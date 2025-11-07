import { Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-card mt-12">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-sm text-muted-foreground">
          <p>© 2025 | Developed by Mratyunjayaa</p>
          <span className="hidden sm:inline">•</span>
          <a
            href="https://www.linkedin.com/in/vishaltomar-cybersecurity/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-primary transition-colors"
          >
            <Linkedin className="h-4 w-4" />
            Connect on LinkedIn
          </a>
        </div>
      </div>
    </footer>
  );
}
