import { Clock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PortResult } from "@/types/scan";

interface ScanHistoryItem {
  id: string;
  host: string;
  timestamp: number;
  openPorts: number;
  totalScanned: number;
  results: PortResult[];
}

interface ScanHistoryProps {
  history: ScanHistoryItem[];
  onSelectScan: (item: ScanHistoryItem) => void;
  onClearHistory: () => void;
}

export function ScanHistory({ history, onSelectScan, onClearHistory }: ScanHistoryProps) {
  if (history.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-sm text-muted-foreground text-center">No scan history yet</p>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Recent Scans
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearHistory}
          className="h-8 text-destructive hover:text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
      
      <ScrollArea className="h-[400px]">
        <div className="space-y-2">
          {history.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelectScan(item)}
              className="w-full text-left p-3 rounded-lg border bg-card hover:bg-accent transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{item.host}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(item.timestamp).toLocaleDateString()} at{" "}
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </p>
                </div>
                <div className="text-xs text-right shrink-0">
                  <p className="font-medium text-primary">{item.openPorts} open</p>
                  <p className="text-muted-foreground">{item.totalScanned} scanned</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
}
