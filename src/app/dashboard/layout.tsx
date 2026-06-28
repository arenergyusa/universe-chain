import { ReactNode } from 'react';
import { getSession } from '@/lib/jwt';
import { db } from '@/lib/db';
import SignIn from '@/components/dashboard/SignIn';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import DashboardNavbar from '@/components/dashboard/DashboardNavbar';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const session = await getSession();

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <main className="flex-grow pt-12">
          <SignIn />
        </main>
        <Footer />
      </div>
    );
  }

  // Session exists, verify user in database
  const user = await db.user.findUnique({
    where: { id: session.userId },
  });

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <main className="flex-grow pt-12">
          <SignIn />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Top Navigation - Exact match to landing page */}
      <DashboardNavbar user={{
        walletAddress: user.walletAddress,
        referralCode: user.referralCode,
        status: user.status,
      }} />

      {/* Main Content wrapper */}
      <main className="flex-grow flex flex-col min-w-0 overflow-x-hidden pt-24 pb-12">
        <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
      
      {/* Footer across all authenticated pages too */}
      <Footer />
    </div>
  );
}
