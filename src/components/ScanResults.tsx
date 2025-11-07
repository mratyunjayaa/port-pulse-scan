import { Download, Shield, Clock, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PortResult } from '@/types/scan';
import { useToast } from '@/hooks/use-toast';

interface ScanResultsProps {
  results: PortResult[];
  host: string;
  totalTime: number;
  totalScanned: number;
  openPorts: number;
}

export const ScanResults = ({ results, host, totalTime, totalScanned, openPorts }: ScanResultsProps) => {
  const { toast } = useToast();

  const exportToCSV = () => {
    const csvContent = [
      ['Port', 'Status', 'Service'],
      ...results.map(r => [r.port, r.status, r.service || 'Unknown']),
    ]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `port-scan-${host}-${Date.now()}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: 'Export successful',
      description: 'Scan results exported to CSV',
    });
  };

  const openResults = results.filter(r => r.status === 'open');

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="shadow-lg border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Scan Results
              </CardTitle>
              <CardDescription className="mt-1">Target: {host}</CardDescription>
            </div>
            <Button onClick={exportToCSV} variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-secondary/50 p-4 rounded-lg border border-border/50">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="h-4 w-4 text-green-500" />
                <span className="text-sm text-muted-foreground">Open Ports</span>
              </div>
              <p className="text-2xl font-bold text-green-500">{openPorts}</p>
            </div>
            <div className="bg-secondary/50 p-4 rounded-lg border border-border/50">
              <div className="flex items-center gap-2 mb-1">
                <Activity className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">Ports Scanned</span>
              </div>
              <p className="text-2xl font-bold">{totalScanned}</p>
            </div>
            <div className="bg-secondary/50 p-4 rounded-lg border border-border/50">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">Scan Time</span>
              </div>
              <p className="text-2xl font-bold">{(totalTime / 1000).toFixed(2)}s</p>
            </div>
          </div>

          {openResults.length > 0 ? (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Port</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Service</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {openResults.map(result => (
                    <TableRow key={result.port} className="hover:bg-secondary/50 transition-colors">
                      <TableCell className="font-mono font-semibold">{result.port}</TableCell>
                      <TableCell>
                        <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                          {result.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {result.service || 'Unknown'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg font-medium">No open ports found</p>
              <p className="text-sm mt-1">All scanned ports are closed or filtered</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
