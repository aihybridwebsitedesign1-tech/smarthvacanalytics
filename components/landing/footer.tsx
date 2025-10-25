import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
          <p className="mb-4 md:mb-0">&copy; 2025 SmartHVACAnalytics. All rights reserved.</p>

          <div className="flex gap-6">
            <Link href="/legal/terms" className="hover:text-foreground transition-colors">
              Terms of Service
            </Link>
            <Link href="/legal/privacy" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="/pricing" className="hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link href="/how-it-works" className="hover:text-foreground transition-colors">
              How It Works
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
