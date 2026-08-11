import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { MobileContainer, TabType } from './components/MobileContainer';
import { ScannerView } from './components/ScannerView';
import { DosageCalculatorView } from './components/DosageCalculatorView';
import { SprinklerView } from './components/SprinklerView';
import { FieldMapView } from './components/FieldMapView';
import { AnalyticsView } from './components/AnalyticsView';
import { OfflineSyncView } from './components/OfflineSyncView';
import { RewaAssistant } from './components/RewaAssistant';
import { AppThemeConfig, PlantScanRecord, SprinklerHardwareState, DosageFormulaConfig, DEFAULT_DOSAGE_CONFIG, ScanModeType } from './types';
import { OfflineStorageService } from './services/offlineStorage';
import { triggerHaptic } from './components/VoiceReader';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('scanner');
  const [scannerMode, setScannerMode] = useState<ScanModeType>('CROP_HEALTH_ANALYSIS');
  const [autoStartSpray, setAutoStartSpray] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [simulatedOffline, setSimulatedOffline] = useState<boolean>(false);
  const [batteryLevel, setBatteryLevel] = useState<number>(88);

  // App Theme & Field Settings
  const [themeConfig, setThemeConfig] = useState<AppThemeConfig>({
    highContrastOutdoor: false,
    batterySaverEco: false,
    voiceAudioEnabled: true,
    hapticsEnabled: true,
    language: 'EN',
  });

  // Configurable Dosage Formula Rules State
  const [formulaConfig, setFormulaConfig] = useState<DosageFormulaConfig>(DEFAULT_DOSAGE_CONFIG);

  // Sprinkler Hardware Rig State
  const [hardwareState, setHardwareState] = useState<SprinklerHardwareState>({
    connected: true,
    batteryLevelPct: 92,
    tankLevelMl: 850,
    maxTankCapacityMl: 1000,
    nozzlePressureBar: 2.8,
    isSpraying: false,
    currentFlowRateMlSec: 10,
    bluetoothSignalDbm: -65,
    mode: 'AUTO_AI',
    nozzleType: 'FINE_MIST_CONE',
  });

  // Saved Scan History & Unsynced Queue
  const [scanHistory, setScanHistory] = useState<PlantScanRecord[]>([]);
  const [unsyncedQueue, setUnsyncedQueue] = useState<PlantScanRecord[]>([]);
  const [pendingDosageMl, setPendingDosageMl] = useState<number>(35);

  // Initial Load from Offline Storage
  useEffect(() => {
    const history = OfflineStorageService.getScansHistory();
    const queue = OfflineStorageService.getUnsyncedQueue();
    const loadedFormula = OfflineStorageService.getDosageFormulaConfig();

    setScanHistory(history);
    setUnsyncedQueue(queue);
    setFormulaConfig(loadedFormula);

    // Online/Offline event listeners
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);


  const handleUpdateTheme = (updated: Partial<AppThemeConfig>) => {
    setThemeConfig((prev) => ({ ...prev, ...updated }));
  };

  const handleUpdateHardware = (updated: Partial<SprinklerHardwareState>) => {
    setHardwareState((prev) => ({ ...prev, ...updated }));
  };

  // Called when AI Scan completes
  const handleScanCompleted = (newRecord: PlantScanRecord) => {
    OfflineStorageService.saveScan(newRecord);
    setScanHistory(OfflineStorageService.getScansHistory());
    setUnsyncedQueue(OfflineStorageService.getUnsyncedQueue());
  };

  // Called when worker or Rewa AI triggers tab navigation
  const handleNavigateTab = (tab: TabType, scanMode?: ScanModeType) => {
    if (scanMode) {
      setScannerMode(scanMode);
    }
    if (tab !== 'sprinkler') {
      setAutoStartSpray(false);
    }
    setActiveTab(tab);
  };

  // Called when worker clicks "ACTUATE SPRINKLER RIG NOW" or Rewa triggers spray
  const handleTriggerSprayFromScan = (dosageMl: number, durationSec: number, pressureBar: number) => {
    setPendingDosageMl(dosageMl);
    setHardwareState((prev) => ({ ...prev, nozzlePressureBar: pressureBar }));
    setAutoStartSpray(true);
    setActiveTab('sprinkler'); // Switch to Sprinkler view to actuate
  };

  // Called when worker selects a sector on Field Map to scan
  const handleSelectSectorForScan = (sectorName: string) => {
    handleNavigateTab('scanner');
  };

  const effectiveOnlineStatus = isOnline && !simulatedOffline;

  return (
    <MobileContainer
      activeTab={activeTab}
      onTabChange={handleNavigateTab}
      themeConfig={themeConfig}
      unsyncedCount={unsyncedQueue.length}
    >
      <Header
        themeConfig={themeConfig}
        onUpdateTheme={handleUpdateTheme}
        isOnline={effectiveOnlineStatus}
        unsyncedCount={unsyncedQueue.length}
        batteryLevel={batteryLevel}
      />

      <main className="flex-1">
        {activeTab === 'scanner' && (
          <ScannerView
            themeConfig={themeConfig}
            isOnline={effectiveOnlineStatus}
            initialScanMode={scannerMode}
            onScanCompleted={handleScanCompleted}
            onTriggerSpray={handleTriggerSprayFromScan}
          />
        )}

        {activeTab === 'calculator' && (
          <DosageCalculatorView
            themeConfig={themeConfig}
            formulaConfig={formulaConfig}
            onUpdateFormulaConfig={setFormulaConfig}
            onTriggerSpray={handleTriggerSprayFromScan}
            onSaveScanRecord={handleScanCompleted}
          />
        )}

        {activeTab === 'sprinkler' && (
          <SprinklerView
            themeConfig={themeConfig}
            hardwareState={hardwareState}
            onUpdateHardware={handleUpdateHardware}
            pendingDosageMl={pendingDosageMl}
            latestScanRecord={scanHistory[0]}
            autoStartSpray={autoStartSpray}
          />
        )}

        {activeTab === 'field_map' && (
          <FieldMapView
            themeConfig={themeConfig}
            onSelectSectorForScan={handleSelectSectorForScan}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView
            themeConfig={themeConfig}
            scanHistory={scanHistory}
          />
        )}

        {activeTab === 'offline_sync' && (
          <OfflineSyncView
            themeConfig={themeConfig}
            onUpdateTheme={handleUpdateTheme}
            isOnline={effectiveOnlineStatus}
            onToggleSimulatedOffline={() => setSimulatedOffline(!simulatedOffline)}
            unsyncedQueue={unsyncedQueue}
            onSyncCompleted={() => {
              setUnsyncedQueue(OfflineStorageService.getUnsyncedQueue());
              setScanHistory(OfflineStorageService.getScansHistory());
            }}
            batteryLevel={batteryLevel}
          />
        )}
      </main>

      {/* Rewa Virtual AI Assistant - Floating Voice & Text Controller */}
      <RewaAssistant
        currentTab={activeTab}
        themeConfig={themeConfig}
        onNavigateTab={handleNavigateTab}
        onTriggerSpray={handleTriggerSprayFromScan}
        onUpdateThemeConfig={handleUpdateTheme}
      />
    </MobileContainer>
  );
}
