import Link from 'next/link';
import { UniverseLogo } from '@/components/ui/UniverseLogo';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const companyLinks = [
    { name: 'About Us', href: '/about' },
    { name: 'Contact Us', href: '/contact' },
    { name: 'Help & Support', href: '/help-support' },
  ];

  const legalLinks = [
    { name: 'Terms & Conditions', href: '/terms' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Disclaimer', href: '/disclaimer' },
  ];

  return (
    <footer className="bg-slate-50 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          <div className="space-y-4 md:col-span-2">
            <Link href="/" className="flex items-center" aria-label="Universe Chain Home">
              <div className="flex items-center justify-center">
                <UniverseLogo className="h-10 w-auto" />
              </div>
            </Link>
            <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
              Universe Chain brings people together on a transparent, community-powered platform. Built on blockchain for trust you can verify — designed for humans who value simplicity.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900 tracking-wider uppercase mb-4">Company</h3>
            <ul className="space-y-2.5">
              {companyLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-500 hover:text-sky-600 transition-colors duration-150"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900 tracking-wider uppercase mb-4">Legal</h3>
            <ul className="space-y-2.5">
              {legalLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-500 hover:text-sky-600 transition-colors duration-150"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-200/60 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-xs text-slate-400">
            &copy; {currentYear} Universe Chain. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <span className="text-xs text-slate-400 flex items-center space-x-1.5">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse-slow"></span>
              <span>Platform Status Online</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
