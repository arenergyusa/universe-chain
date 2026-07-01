import { ReactNode } from 'react';
import { getSession } from '@/lib/jwt';
import { redirect } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { ShieldAlert } from 'lucide-react';
import { Toaster } from 'sonner';

export const metadata = {
  title: 'Admin Control Panel - Universe Chain',
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getSession();

  if (!session) {
    redirect('/dashboard');
  }

  // Check if the connected wallet is the admin wallet
  const adminAddress = process.env.ADMIN_WALLET_ADDRESS?.trim().replace(/['"]/g, '').toLowerCase();
  const userAddress = session.walletAddress.trim().toLowerCase();

  console.log('[Admin Check] Admin env:', JSON.stringify(process.env.ADMIN_WALLET_ADDRESS));
  console.log('[Admin Check] Admin parsed:', adminAddress);
  console.log('[Admin Check] User wallet:', userAddress);
  console.log('[Admin Check] Match:', adminAddress === userAddress);

  if (adminAddress !== userAddress) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <main className="flex-grow flex items-center justify-center pt-12 p-4">
          <div className="glass-card bg-white border border-rose-200 rounded-3xl p-8 max-w-md w-full text-center space-y-6">
            <div className="w-16 h-16 mx-auto bg-rose-50 rounded-2xl flex items-center justify-center border border-rose-100">
              <ShieldAlert className="w-8 h-8 text-rose-500" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">Access Denied</h2>
              <p className="text-sm text-slate-500 mt-2">
                You do not have administrative privileges to view this page.
              </p>
            </div>
            <a
              href="/dashboard"
              className="inline-block w-full bg-slate-900 text-white font-bold text-sm py-3.5 rounded-xl hover:bg-slate-800 transition-colors"
            >
              Return to Dashboard
            </a>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-grow pt-32 md:pt-36 pb-12">
        <Toaster position="top-right" richColors />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-lg">
              <ShieldAlert className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Admin Portal</h1>
              <p className="text-xs font-bold text-slate-500">System Configuration & Management</p>
            </div>
          </div>
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
