import { useState, useEffect } from 'react';
import { ScanForm } from '@/components/ScanForm';
import { ScanResults } from '@/components/ScanResults';
import { SecurityWarning } from '@/components/SecurityWarning';
import { ScanHistory } from '@/components/ScanHistory';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Footer } from '@/components/Footer';
import { PortResult } from '@/types/scan';

interface ScanHistoryItem {
  id: string;
  host: string;
  timestamp: number;
  openPorts: number;
  totalScanned: number;
  results: PortResult[];
}

const SCAN_HISTORY_KEY = 'port-scanner-history';
const MAX_HISTORY_ITEMS = 5;

const Index = () => {
  const [results, setResults] = useState<PortResult[] | null>(null);
  const [scanInfo, setScanInfo] = useState<{
    host: string;
    totalTime: number;
    totalScanned: number;
    openPorts: number;
  } | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(SCAN_HISTORY_KEY);
    if (stored) {
      try {
        setScanHistory(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse scan history:', e);
      }
    }
  }, []);

  const handleScanComplete = (
    scanResults: PortResult[],
    host: string,
    totalTime: number,
    totalScanned: number,
    openPorts: number
  ) => {
    setResults(scanResults);
    setScanInfo({ host, totalTime, totalScanned, openPorts });
    setIsScanning(false);

    const newHistoryItem: ScanHistoryItem = {
      id: Date.now().toString(),
      host,
      timestamp: Date.now(),
      openPorts,
      totalScanned,
      results: scanResults.filter(r => r.status === 'open'),
    };

    const updatedHistory = [newHistoryItem, ...scanHistory].slice(0, MAX_HISTORY_ITEMS);
    setScanHistory(updatedHistory);
    localStorage.setItem(SCAN_HISTORY_KEY, JSON.stringify(updatedHistory));
  };

  const handleScanStart = () => {
    setIsScanning(true);
    setResults(null);
    setScanInfo(null);
  };

  const handleScanError = () => {
    setIsScanning(false);
  };

  const handleSelectScan = (item: ScanHistoryItem) => {
    setResults(item.results);
    setScanInfo({
      host: item.host,
      totalTime: 0,
      totalScanned: item.totalScanned,
      openPorts: item.openPorts,
    });
  };

  const handleClearHistory = () => {
    setScanHistory([]);
    localStorage.removeItem(SCAN_HISTORY_KEY);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background flex flex-col">
      <div className="container mx-auto px-4 py-8 max-w-7xl flex-1">
        <header className="flex items-center justify-between mb-8 animate-fade-in">
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Port Scanner
            </h1>
            <p className="text-muted-foreground text-lg">
              Discover open TCP ports on authorized hosts
            </p>
          </div>
          <ThemeToggle />
        </header>

        <SecurityWarning />

        <div className="grid lg:grid-cols-[1fr_320px] gap-6 md:gap-8">
          <div className="space-y-6 animate-fade-in">
            <ScanForm
              onScanComplete={handleScanComplete}
              onScanStart={handleScanStart}
              onScanError={handleScanError}
              isScanning={isScanning}
            />

            {results && scanInfo && (
              <div className="animate-fade-in">
                <ScanResults
                  results={results}
                  host={scanInfo.host}
                  totalTime={scanInfo.totalTime}
                  totalScanned={scanInfo.totalScanned}
                  openPorts={scanInfo.openPorts}
                />
              </div>
            )}
          </div>

          <aside className="animate-fade-in">
            <ScanHistory
              history={scanHistory}
              onSelectScan={handleSelectScan}
              onClearHistory={handleClearHistory}
            />
          </aside>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Index;
