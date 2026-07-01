import { ReactNode } from 'react';
import type { Metadata } from 'next';
import { getSession } from '@/lib/jwt';
import { db } from '@/lib/db';
import SignIn from '@/components/dashboard/SignIn';
import BlockedPage from '@/components/dashboard/BlockedPage';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import DashboardNavbar from '@/components/dashboard/DashboardNavbar';
import { Web3Provider } from '@/components/providers/Web3Provider';

export const metadata: Metadata = {
  title: 'Dashboard - Universe Chain',
  description: 'Manage your Universe Chain account, view active slots, track rewards, and grow your community.',
};

interface DashboardLayoutProps {
  children: ReactNode;
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const session = await getSession();

  if (!session) {
    return (
      <Web3Provider>
        <div className="min-h-screen flex flex-col bg-slate-50">
          <Navbar />
          <main className="flex-grow pt-12">
            <SignIn />
          </main>
          <Footer />
        </div>
      </Web3Provider>
    );
  }

  // Session exists, verify user in database
  const user = await db.user.findUnique({
    where: { id: session.userId },
  });

  if (!user) {
    return (
      <Web3Provider>
        <div className="min-h-screen flex flex-col bg-slate-50">
          <Navbar />
          <main className="flex-grow pt-12">
            <SignIn />
          </main>
          <Footer />
        </div>
      </Web3Provider>
    );
  }

  // Blocked user check
  if (user.status === 'blocked') {
    return (
      <Web3Provider>
        <div className="min-h-screen flex flex-col bg-slate-50">
          <Navbar />
          <main className="flex-grow pt-12">
            <BlockedPage />
          </main>
          <Footer />
        </div>
      </Web3Provider>
    );
  }

  return (
    <Web3Provider>
      <div className="min-h-screen flex flex-col bg-slate-50">
        {/* Top Navigation - Exact match to landing page */}
        <DashboardNavbar user={{
          walletAddress: user.walletAddress,
          referralCode: user.referralCode,
          status: user.status,
        }} />

        {/* Main Content wrapper */}
        <main className="flex-grow flex flex-col min-w-0 overflow-x-hidden pt-32 md:pt-36 pb-12">
          <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
        
        {/* Footer across all authenticated pages too */}
        <Footer />
      </div>
    </Web3Provider>
  );
}
