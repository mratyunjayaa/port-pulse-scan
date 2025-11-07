import { useState } from 'react';
import { ScanForm } from '@/components/ScanForm';
import { ScanResults } from '@/components/ScanResults';
import { SecurityWarning } from '@/components/SecurityWarning';
import { PortResult } from '@/types/scan';

const Index = () => {
  const [results, setResults] = useState<PortResult[] | null>(null);
  const [scanInfo, setScanInfo] = useState<{
    host: string;
    totalTime: number;
    totalScanned: number;
    openPorts: number;
  } | null>(null);
  const [isScanning, setIsScanning] = useState(false);

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
  };

  const handleScanStart = () => {
    setIsScanning(true);
    setResults(null);
    setScanInfo(null);
  };

  const handleScanError = () => {
    setIsScanning(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <header className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Port Scanner
          </h1>
          <p className="text-muted-foreground text-lg">
            Discover open TCP ports on authorized hosts
          </p>
        </header>

        <SecurityWarning />

        <div className="grid gap-6 md:gap-8 animate-fade-in">
          <ScanForm
            onScanComplete={handleScanComplete}
            onScanStart={handleScanStart}
            onScanError={handleScanError}
            isScanning={isScanning}
          />

          {results && scanInfo && (
            <ScanResults
              results={results}
              host={scanInfo.host}
              totalTime={scanInfo.totalTime}
              totalScanned={scanInfo.totalScanned}
              openPorts={scanInfo.openPorts}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
