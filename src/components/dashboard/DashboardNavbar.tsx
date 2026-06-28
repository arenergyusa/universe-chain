'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, LayoutDashboard, Layers, Users2, ArrowDownCircle, ArrowUpCircle, History, LogOut, Wallet, ShieldCheck, Copy, Check, Gift } from 'lucide-react';
import { UniverseLogo } from '@/components/ui/UniverseLogo';

interface DashboardNavbarProps {
  user: {
    walletAddress: string;
    referralCode: string;
    status: string;
  };
}

export default function DashboardNavbar({ user }: DashboardNavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
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
    { name: 'Overview', href: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { name: 'Slots', href: '/dashboard/slots', icon: <Layers className="w-4 h-4" /> },
    { name: 'Rewards', href: '/dashboard/rewards', icon: <Gift className="w-4 h-4" /> },
    { name: 'Deposit', href: '/dashboard/deposit', icon: <ArrowDownCircle className="w-4 h-4" /> },
    { name: 'Withdraw', href: '/dashboard/withdraw', icon: <ArrowUpCircle className="w-4 h-4" /> },
    { name: 'History', href: '/dashboard/history', icon: <History className="w-4 h-4" /> },
  ];

  const isActive = (path: string) => pathname === path;

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

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
            <Link href="/" className="flex items-center">
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

            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200/60 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-700">
                <Wallet className="w-4 h-4 text-slate-500" />
                <span>{formatAddress(user.walletAddress)}</span>
                <span className={`w-2 h-2 rounded-full ml-1 ${user.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center justify-center p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
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
          <div className="px-4 pt-2 pb-6 space-y-2">
            {/* User Profile Mobile */}
            <div className="p-4 mb-4 bg-white/60 border border-slate-200/60 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-600 border border-sky-500/20">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Wallet</div>
                    <div className="text-sm font-bold text-slate-700">
                      {formatAddress(user.walletAddress)}
                    </div>
                  </div>
                </div>
                <div className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  user.status === 'active' 
                    ? 'bg-emerald-50 border border-emerald-150 text-emerald-700' 
                    : 'bg-amber-50 border border-amber-150 text-amber-700'
                }`}>
                  <ShieldCheck className="w-3 h-3" />
                  {user.status === 'active' ? 'Active' : 'Inactive'}
                </div>
              </div>
            </div>

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
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-2 bg-rose-50 hover:bg-rose-100 text-rose-600 px-5 py-3 rounded-xl text-base font-bold transition-all duration-200"
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
