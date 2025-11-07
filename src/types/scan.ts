export interface PortResult {
  port: number;
  status: 'open' | 'closed' | 'filtered';
  service?: string;
}

export interface ScanRequest {
  host: string;
  start_port: number;
  end_port: number;
  timeout?: number;
  concurrency?: number;
}

export interface ScanResponse {
  success: boolean;
  host: string;
  start_port: number;
  end_port: number;
  total_time_ms: number;
  total_ports_scanned: number;
  open_ports: number;
  results: PortResult[];
}
