import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ScanResponse, PortResult } from '@/types/scan';

const formSchema = z.object({
  host: z.string().min(1, 'Host is required').default('localhost'),
  startPort: z.coerce.number().min(1).max(65535, 'Port must be between 1-65535'),
  endPort: z.coerce.number().min(1).max(65535, 'Port must be between 1-65535'),
  timeout: z.coerce.number().min(100).max(10000).default(2000),
  concurrency: z.coerce.number().min(1).max(100).default(50),
}).refine(data => data.startPort <= data.endPort, {
  message: 'Start port must be less than or equal to end port',
  path: ['endPort'],
}).refine(data => (data.endPort - data.startPort + 1) <= 1000, {
  message: 'Maximum port range is 1000 ports',
  path: ['endPort'],
});

type FormValues = z.infer<typeof formSchema>;

interface ScanFormProps {
  onScanComplete: (
    results: PortResult[],
    host: string,
    totalTime: number,
    totalScanned: number,
    openPorts: number
  ) => void;
  onScanStart: () => void;
  onScanError: () => void;
  isScanning: boolean;
}

export const ScanForm = ({ onScanComplete, onScanStart, onScanError, isScanning }: ScanFormProps) => {
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      host: 'localhost',
      startPort: 1,
      endPort: 1000,
      timeout: 2000,
      concurrency: 50,
    },
  });

  const onSubmit = async (values: FormValues) => {
    onScanStart();
    setProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 5;
      });
    }, 200);

    try {
      const { data, error } = await supabase.functions.invoke<ScanResponse>('port-scan', {
        body: {
          host: values.host,
          start_port: values.startPort,
          end_port: values.endPort,
          timeout: values.timeout,
          concurrency: values.concurrency,
        },
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (error) throw error;

      if (data && data.success) {
        toast({
          title: 'Scan completed',
          description: `Found ${data.open_ports} open ports on ${data.host}`,
        });

        onScanComplete(
          data.results,
          data.host,
          data.total_time_ms,
          data.total_ports_scanned,
          data.open_ports
        );
      } else {
        throw new Error('Scan failed');
      }
    } catch (error) {
      clearInterval(progressInterval);
      console.error('Scan error:', error);
      
      toast({
        variant: 'destructive',
        title: 'Scan failed',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
      });
      
      onScanError();
    }
  };

  return (
    <Card className="shadow-lg border-border/50 animate-scale-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5 text-primary" />
          Configure Scan
        </CardTitle>
        <CardDescription>
          Enter the target host and port range to scan. Defaults to localhost if no host is specified.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="host"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Host</FormLabel>
                  <FormControl>
                    <Input placeholder="localhost or 127.0.0.1" {...field} disabled={isScanning} />
                  </FormControl>
                  <FormDescription>
                    Target hostname or IP address (defaults to localhost)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startPort"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Port</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="1" {...field} disabled={isScanning} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endPort"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Port</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="1000" {...field} disabled={isScanning} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="timeout"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Timeout (ms)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="2000" {...field} disabled={isScanning} />
                    </FormControl>
                    <FormDescription>Connection timeout</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="concurrency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Concurrency</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="50" {...field} disabled={isScanning} />
                    </FormControl>
                    <FormDescription>Parallel connections</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {isScanning && (
              <div className="space-y-2 animate-fade-in">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Scanning in progress...</span>
                  <span className="font-medium text-primary">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            <Button type="submit" className="w-full transition-all duration-300" disabled={isScanning}>
              {isScanning ? (
                <span className="animate-fade-in flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Scanning...
                </span>
              ) : (
                <span className="flex items-center">
                  <Search className="mr-2 h-4 w-4" />
                  Start Scan
                </span>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
