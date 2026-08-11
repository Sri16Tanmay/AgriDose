import { PlantScanRecord, DosageFormulaConfig, DEFAULT_DOSAGE_CONFIG } from '../types';
import { aesGcmEncrypt, aesGcmDecrypt, EncryptedPayload } from './aesGcmCrypto';

const OFFLINE_QUEUE_KEY = 'agri_pesticide_offline_queue_v1';
const SCANS_HISTORY_KEY = 'agri_pesticide_scans_history_v1';
const DOSAGE_FORMULA_KEY = 'agri_pesticide_dosage_formula_v1';

// Helper to strip heavy base64 images from stored scan history items to save localStorage space
function sanitizeRecordForStorage(record: PlantScanRecord): PlantScanRecord {
  const sanitized = { ...record };
  // If imageUrl is a huge base64 string (> 20KB), replace it with a lightweight placeholder indicator
  if (sanitized.imageUrl && sanitized.imageUrl.startsWith('data:image/') && sanitized.imageUrl.length > 20000) {
    sanitized.imageUrl = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23064e3b"/><text x="50" y="55" font-size="12" fill="%2334d399" text-anchor="middle">Stored Scan</text></svg>';
  }
  return sanitized;
}

// Encrypted localStorage getItem helper with fallback parsing for legacy unencrypted items
function safeLocalStorageGet<T>(key: string, fallback: T): T {
  try {
    const rawData = localStorage.getItem(key);
    if (!rawData) return fallback;

    const parsed = JSON.parse(rawData);

    // If data is AES-256-GCM encrypted payload, decrypt before returning
    if (parsed && typeof parsed === 'object' && parsed.cipher === 'AES-256-GCM' && parsed.ciphertext) {
      const decryptedJson = aesGcmDecrypt(parsed as EncryptedPayload);
      return JSON.parse(decryptedJson) as T;
    }

    // Seamless backward compatibility for unencrypted legacy storage data
    return parsed as T;
  } catch (e) {
    console.error(`Error reading or decrypting storage data for key "${key}":`, e);
    return fallback;
  }
}

// Safe localStorage setItem helper with AES-256-GCM encryption, quota management and fallback pruning
function safeLocalStorageSet(key: string, data: any): void {
  try {
    const jsonString = JSON.stringify(data);
    const encryptedPayload = aesGcmEncrypt(jsonString);
    localStorage.setItem(key, JSON.stringify(encryptedPayload));
  } catch (e) {
    console.warn(`localStorage quota warning for key "${key}". Executing storage compression & pruning...`, e);
    try {
      if (Array.isArray(data)) {
        // Step 1: Strip heavy images from all items
        const sanitizedArray = data.slice(0, 15).map(sanitizeRecordForStorage);
        const jsonString = JSON.stringify(sanitizedArray);
        const encryptedPayload = aesGcmEncrypt(jsonString);
        localStorage.setItem(key, JSON.stringify(encryptedPayload));
      } else {
        const jsonString = JSON.stringify(data);
        const encryptedPayload = aesGcmEncrypt(jsonString);
        localStorage.setItem(key, JSON.stringify(encryptedPayload));
      }
    } catch (e2) {
      console.warn(`Secondary quota compression attempt failed for "${key}". Pruning history to 5 items...`, e2);
      try {
        if (Array.isArray(data)) {
          const minimalArray = data.slice(0, 5).map(sanitizeRecordForStorage);
          const jsonString = JSON.stringify(minimalArray);
          const encryptedPayload = aesGcmEncrypt(jsonString);
          localStorage.setItem(key, JSON.stringify(encryptedPayload));
        }
      } catch (e3) {
        console.error(`Unable to write to localStorage for key "${key}" due to strict browser quota limit.`, e3);
      }
    }
  }
}

export class OfflineStorageService {
  // Get dosage formula configuration
  static getDosageFormulaConfig(): DosageFormulaConfig {
    const data = safeLocalStorageGet<DosageFormulaConfig | null>(DOSAGE_FORMULA_KEY, null);
    return data ? { ...DEFAULT_DOSAGE_CONFIG, ...data } : DEFAULT_DOSAGE_CONFIG;
  }

  // Save dosage formula configuration
  static saveDosageFormulaConfig(config: DosageFormulaConfig): void {
    safeLocalStorageSet(DOSAGE_FORMULA_KEY, config);
  }

  // Get all saved scan records
  static getScansHistory(): PlantScanRecord[] {
    return safeLocalStorageGet<PlantScanRecord[]>(SCANS_HISTORY_KEY, []);
  }

  // Save new scan record
  static saveScan(scan: PlantScanRecord): void {
    try {
      const sanitizedNewScan = sanitizeRecordForStorage(scan);
      const history = this.getScansHistory();
      const updated = [sanitizedNewScan, ...history].slice(0, 30); // Keep max 30 records
      safeLocalStorageSet(SCANS_HISTORY_KEY, updated);

      // If not synced, queue for background upload
      if (!scan.synced) {
        this.addToUnsyncedQueue(sanitizedNewScan);
      }
    } catch (e) {
      console.error('Error saving scan record:', e);
    }
  }

  // Get unsynced scans
  static getUnsyncedQueue(): PlantScanRecord[] {
    return safeLocalStorageGet<PlantScanRecord[]>(OFFLINE_QUEUE_KEY, []);
  }

  // Add scan to offline sync queue
  static addToUnsyncedQueue(scan: PlantScanRecord): void {
    try {
      const queue = this.getUnsyncedQueue();
      if (!queue.some(q => q.id === scan.id)) {
        const sanitized = sanitizeRecordForStorage(scan);
        queue.push(sanitized);
        safeLocalStorageSet(OFFLINE_QUEUE_KEY, queue.slice(0, 20));
      }
    } catch (e) {
      console.error('Error adding to offline queue:', e);
    }
  }

  // Mark all or specific queue items as synced
  static markAsSynced(scanIds: string[]): void {
    try {
      // Update history records
      const history = this.getScansHistory();
      const updatedHistory = history.map(item => {
        if (scanIds.includes(item.id)) {
          return { ...item, synced: true };
        }
        return item;
      });
      safeLocalStorageSet(SCANS_HISTORY_KEY, updatedHistory);

      // Remove from offline queue
      const queue = this.getUnsyncedQueue();
      const remainingQueue = queue.filter(q => !scanIds.includes(q.id));
      safeLocalStorageSet(OFFLINE_QUEUE_KEY, remainingQueue);
    } catch (e) {
      console.error('Error marking items as synced:', e);
    }
  }

  // Clear unsynced queue after successful sync
  static clearQueue(): void {
    try {
      localStorage.removeItem(OFFLINE_QUEUE_KEY);
    } catch (e) {
      console.error('Error clearing offline queue:', e);
    }
  }

  // Update spray status (e.g. from PENDING to SPRAYED)
  static updateSprayStatus(scanId: string, status: 'PENDING' | 'SPRAYED' | 'SKIPPED'): void {
    try {
      const history = this.getScansHistory();
      const updated = history.map(item => {
        if (item.id === scanId) {
          return { ...item, sprayStatus: status };
        }
        return item;
      });
      safeLocalStorageSet(SCANS_HISTORY_KEY, updated);
    } catch (e) {
      console.error('Error updating spray status:', e);
    }
  }
}

