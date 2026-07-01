'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Wallet, ArrowRight, Home, Info, Phone, HelpCircle } from 'lucide-react';
import { UniverseLogo } from '@/components/ui/UniverseLogo';

export default function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/', icon: <Home className="w-4 h-4" /> },
    { name: 'About', href: '/about', icon: <Info className="w-4 h-4" /> },
    { name: 'Contact', href: '/contact', icon: <Phone className="w-4 h-4" /> },
    { name: 'Help & Support', href: '/help-support', icon: <HelpCircle className="w-4 h-4" /> },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled || isMobileMenuOpen
            ? 'glass-nav py-3 shadow-sm'
            : 'bg-white/80 backdrop-blur-md py-4 border-b border-slate-200/60'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center" aria-label="Universe Chain Home">
                <div className="flex items-center justify-center">
                  <UniverseLogo className="h-10 w-auto" />
                </div>
              </Link>
            </div>

            <div className="hidden lg:flex items-center space-x-6">
              <div className="flex space-x-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-colors duration-200 ${
                      isActive(link.href)
                        ? 'bg-sky-50 text-sky-600 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {link.icon}
                    <span>{link.name}</span>
                  </Link>
                ))}
              </div>

              <div className="w-px h-8 bg-slate-200 mx-2"></div>

              <Link
                href="/dashboard"
                className="glow-btn flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all duration-200"
              >
                <Wallet className="w-4 h-4" />
                <span>Launch App</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="lg:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-slate-600 hover:text-slate-900 p-2 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none"
                aria-label="Toggle navigation menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu - Rendered as sibling to avoid nested backdrop-filter bug */}
      {isMobileMenuOpen && (
        <div className="lg:hidden glass-nav fixed top-[64px] sm:top-[72px] left-0 right-0 bottom-0 z-40 animate-fade-in shadow-lg overflow-y-auto pb-24 border-t border-slate-200/50">
          <div className="px-4 pt-2 pb-6 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3.5 rounded-xl text-base font-semibold transition-colors ${
                  isActive(link.href)
                    ? 'bg-sky-50 text-sky-600 shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {link.icon}
                <span>{link.name}</span>
              </Link>
            ))}
            <div className="pt-6 border-t border-slate-200/60 mt-4 px-1">
              <Link
                href="/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full flex items-center justify-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 rounded-xl text-base font-semibold shadow-sm transition-all duration-200"
              >
                <Wallet className="w-5 h-5" />
                <span>Launch App</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
