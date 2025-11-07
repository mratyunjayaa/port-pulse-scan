import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export const SecurityWarning = () => {
  return (
    <Alert variant="destructive" className="mb-6 animate-fade-in border-2">
      <AlertTriangle className="h-5 w-5" />
      <AlertTitle className="text-lg font-semibold">Important Security Notice</AlertTitle>
      <AlertDescription className="mt-2">
        <strong>Only scan hosts you are explicitly authorized to test.</strong> Unauthorized port
        scanning may be illegal in your jurisdiction and can result in serious consequences. This
        tool is intended for security auditing and network diagnostics on systems you own or have
        permission to test.
      </AlertDescription>
    </Alert>
  );
};
