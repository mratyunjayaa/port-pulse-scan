# Port Scanner - Full Stack Application

A modern, secure port scanner built with React and Lovable Cloud edge functions. Scan TCP ports on authorized hosts with real-time progress tracking and exportable results.

## ⚠️ Security Warning

**ONLY scan hosts you are explicitly authorized to test.** Unauthorized port scanning may be illegal in your jurisdiction and can result in serious consequences. This tool is intended for:
- Security auditing on your own systems
- Network diagnostics on authorized networks
- Educational purposes with proper permissions

## Features

### Backend (Edge Function)
- ✅ Async TCP socket scanning using Deno
- ✅ Configurable timeout and concurrency
- ✅ Input validation and rate limiting
- ✅ Prevents scanning of private IP ranges (configurable)
- ✅ JSON response with port status and timing
- ✅ CORS enabled for frontend access
- ✅ Comprehensive logging

### Frontend (React)
- ✅ Responsive, accessible UI
- ✅ Real-time progress tracking with percentage
- ✅ Form validation with helpful error messages
- ✅ Open ports display with common service hints
- ✅ CSV export functionality
- ✅ Smooth animations and transitions
- ✅ Mobile-friendly design
- ✅ Dark/light mode support

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Lovable Cloud (Deno edge functions)
- **Validation**: Zod, React Hook Form
- **Build Tool**: Vite

## Quick Start

### Prerequisites
- Node.js 18+ and npm installed
- Lovable account (for Cloud backend)

### Installation

1. Clone the repository:
```bash
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:5173`

The backend edge function deploys automatically through Lovable Cloud.

## Usage

1. **Enter Target Information**
   - Host: Target hostname or IP (defaults to localhost)
   - Start Port: Beginning of port range (1-65535)
   - End Port: End of port range (1-65535)
   - Timeout: Connection timeout in milliseconds (100-10000)
   - Concurrency: Number of parallel connections (1-100)

2. **Start Scan**
   - Click "Start Scan" button
   - Watch real-time progress indicator
   - View results when complete

3. **Export Results**
   - Click "Export CSV" to download scan results
   - CSV includes port number, status, and service information

## Configuration Limits

- **Max Port Range**: 1000 ports per scan
- **Max Concurrency**: 100 parallel connections
- **Timeout Range**: 100-10000 ms
- **Default Host**: localhost (if none provided)

## API Reference

### POST /port-scan

**Request Body:**
```json
{
  "host": "localhost",
  "start_port": 1,
  "end_port": 1000,
  "timeout": 2000,
  "concurrency": 50
}
```

**Response:**
```json
{
  "success": true,
  "host": "localhost",
  "start_port": 1,
  "end_port": 1000,
  "total_time_ms": 5432,
  "total_ports_scanned": 1000,
  "open_ports": 3,
  "results": [
    {
      "port": 22,
      "status": "open",
      "service": "SSH"
    }
  ]
}
```

## Common Services Detected

The scanner recognizes common services on standard ports:
- 22: SSH
- 80: HTTP
- 443: HTTPS
- 3306: MySQL
- 5432: PostgreSQL
- And many more...

## Security Features

- ✅ Input validation on all parameters
- ✅ Rate limiting through concurrency control
- ✅ Private IP range detection
- ✅ Maximum port range limits
- ✅ Comprehensive logging
- ✅ Security warning banner
- ✅ Timeout protection

## Deployment

This project is deployed through Lovable:

1. Open [Lovable Project](https://lovable.dev/projects/b75773a9-2e3f-47a0-aca1-00a5c01a50b5)
2. Click "Share" → "Publish"
3. Your app will be live with backend automatically deployed

## Development

### Project Structure
```
src/
├── components/
│   ├── ScanForm.tsx       # Scan configuration form
│   ├── ScanResults.tsx    # Results display and export
│   └── SecurityWarning.tsx # Security notice banner
├── types/
│   └── scan.ts            # TypeScript type definitions
└── pages/
    └── Index.tsx          # Main application page

supabase/functions/
└── port-scan/
    └── index.ts           # Edge function for port scanning
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Support

For issues and questions:
- Visit [Lovable Docs](https://docs.lovable.dev/)
- Join [Lovable Discord](https://discord.com/channels/1119885301872070706)

---

Built with ❤️ using [Lovable](https://lovable.dev)
