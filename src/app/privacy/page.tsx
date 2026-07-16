import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export const metadata = {
  title: 'Privacy Policy - Universe Chain',
  description: 'Learn how Universe Chain handles your data — what we collect, what we don\'t, and how we keep your information safe.',
};

export default function Privacy() {
  return (
    <>
      <Navbar />
      <main className="flex-grow flex flex-col min-w-0 overflow-x-hidden pt-32 md:pt-36 pb-12">
        <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Privacy Policy</h1>
              <p className="text-slate-500 text-sm">Last updated: June 2026. Your privacy matters to us — here&apos;s a straightforward explanation of how we handle your data.</p>
            </div>

            <div className="glass-card p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-sm">
              <div className="prose prose-slate text-slate-600 max-w-none space-y-8 leading-relaxed text-sm">
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">1. We keep it minimal</h2>
              <p>
                Universe Chain is built around wallet-based access. That means we don&apos;t ask for your email, phone number, or personal ID to get started. We collect only what&apos;s needed to make the platform work — your public wallet address, session data, and activity logs.
              </p>
              <p>
                If you reach out to support, we&apos;ll process whatever you share in that conversation (like your name and email) to help resolve your question.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">2. How we use your information</h2>
              <p>
                Simply put: to run the platform, keep your account secure, respond to your support requests, and improve the overall experience. We don&apos;t sell your data. We don&apos;t share it with advertisers. Period.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">3. Security is built into everything</h2>
              <p>
                Sensitive data on our servers is encrypted using industry-standard methods. Your wallet&apos;s private keys never touch our systems — they stay in your wallet app where they belong.
              </p>
              <p>
                That said, no system is bulletproof. We do our best, but please also keep your own devices updated and your wallet app secured.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">4. Cookies and sessions</h2>
              <p>
                We use secure cookies to remember your login session after wallet verification. This means you don&apos;t have to reconnect your wallet every time you visit a new page. These cookies are temporary and are automatically deleted when your session ends.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">5. Third-party services</h2>
              <p>
                We work with hosting and infrastructure providers to keep Universe Chain running. These partners only get access to what&apos;s strictly necessary — nothing more.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">6. Your choices</h2>
              <p>
                You can disconnect your wallet at any time, clear your browser cookies, or contact us to ask about your data. We&apos;re happy to help with any privacy concerns.
              </p>
            </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
