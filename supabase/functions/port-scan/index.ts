// Edge Function for Port Scanning
// WARNING: Only scan hosts you have explicit authorization to test

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScanRequest {
  host: string;
  start_port: number;
  end_port: number;
  timeout?: number;
  concurrency?: number;
}

interface PortResult {
  port: number;
  status: 'open' | 'closed' | 'filtered';
  service?: string;
}

// Common port to service mapping
const commonServices: Record<number, string> = {
  20: 'FTP Data',
  21: 'FTP Control',
  22: 'SSH',
  23: 'Telnet',
  25: 'SMTP',
  53: 'DNS',
  80: 'HTTP',
  110: 'POP3',
  143: 'IMAP',
  443: 'HTTPS',
  445: 'SMB',
  3306: 'MySQL',
  3389: 'RDP',
  5432: 'PostgreSQL',
  5900: 'VNC',
  6379: 'Redis',
  8080: 'HTTP Alt',
  8443: 'HTTPS Alt',
  27017: 'MongoDB',
};

// Check if IP is private/local
function isPrivateIP(host: string): boolean {
  const privateRanges = [
    /^127\./,
    /^10\./,
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
    /^192\.168\./,
    /^169\.254\./,
    /^localhost$/i,
  ];
  return privateRanges.some(range => range.test(host));
}

// Validate scan request
function validateRequest(req: ScanRequest): { valid: boolean; error?: string } {
  const { host, start_port, end_port, timeout = 2000, concurrency = 50 } = req;

  if (!host) {
    return { valid: false, error: 'Host is required' };
  }

  if (start_port < 1 || start_port > 65535 || end_port < 1 || end_port > 65535) {
    return { valid: false, error: 'Ports must be between 1 and 65535' };
  }

  if (start_port > end_port) {
    return { valid: false, error: 'Start port must be less than or equal to end port' };
  }

  const portRange = end_port - start_port + 1;
  if (portRange > 1000) {
    return { valid: false, error: 'Maximum port range is 1000 ports' };
  }

  if (timeout < 100 || timeout > 10000) {
    return { valid: false, error: 'Timeout must be between 100 and 10000 ms' };
  }

  if (concurrency < 1 || concurrency > 100) {
    return { valid: false, error: 'Concurrency must be between 1 and 100' };
  }

  return { valid: true };
}

// Scan a single port
async function scanPort(host: string, port: number, timeout: number): Promise<PortResult> {
  console.log(`Scanning ${host}:${port}`);
  
  try {
    const conn = await Promise.race([
      Deno.connect({ hostname: host, port, transport: 'tcp' }),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('timeout')), timeout)
      ),
    ]);
    
    conn.close();
    return {
      port,
      status: 'open',
      service: commonServices[port],
    };
  } catch (error) {
    const err = error as Error;
    if (err.message === 'timeout' || err.message.includes('timeout')) {
      return { port, status: 'filtered' };
    }
    return { port, status: 'closed' };
  }
}

// Batch scanning with concurrency control
async function scanPorts(
  host: string,
  startPort: number,
  endPort: number,
  timeout: number,
  concurrency: number
): Promise<PortResult[]> {
  const results: PortResult[] = [];
  const ports = Array.from({ length: endPort - startPort + 1 }, (_, i) => startPort + i);
  
  for (let i = 0; i < ports.length; i += concurrency) {
    const batch = ports.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map(port => scanPort(host, port, timeout))
    );
    results.push(...batchResults);
  }
  
  return results;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body: ScanRequest = await req.json();
    
    // Default to localhost if no host provided
    if (!body.host) {
      body.host = 'localhost';
    }

    // Validate request
    const validation = validateRequest(body);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { host, start_port, end_port, timeout = 2000, concurrency = 50 } = body;

    // Check if trying to scan private IP without explicit authorization
    const isPrivate = isPrivateIP(host);
    console.log(`Scan request: ${host}:${start_port}-${end_port} (private: ${isPrivate})`);

    // Start timing
    const startTime = Date.now();

    // Perform scan
    const results = await scanPorts(host, start_port, end_port, timeout, concurrency);

    // Calculate total time
    const totalTime = Date.now() - startTime;

    // Filter to only open ports for response
    const openPorts = results.filter(r => r.status === 'open');

    console.log(`Scan completed in ${totalTime}ms. Found ${openPorts.length} open ports`);

    return new Response(
      JSON.stringify({
        success: true,
        host,
        start_port,
        end_port,
        total_time_ms: totalTime,
        total_ports_scanned: results.length,
        open_ports: openPorts.length,
        results: results,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Scan error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Scan failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
