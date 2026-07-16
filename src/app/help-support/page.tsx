import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { HelpCircle, BookOpen, Compass, CheckCircle2, MessageCircle, ShieldCheck } from 'lucide-react';

export const metadata = {
  title: 'Help & Support - Universe Chain',
  description: 'Get quick answers to common questions, setup guides, and troubleshooting tips for your Universe Chain account.',
};

export default function HelpSupport() {
  const articles = [
    {
      title: 'Getting Started',
      description: "New to Universe Chain? Here's a friendly walkthrough — from connecting your wallet to exploring your dashboard for the first time.",
      icon: <Compass className="w-5 h-5 text-sky-600" />
    },
    {
      title: 'Understanding Your Dashboard',
      description: "Your dashboard shows everything that matters — your community, your activity, and your rewards. Here's how to read it.",
      icon: <BookOpen className="w-5 h-5 text-emerald-600" />
    },
    {
      title: 'Troubleshooting Tips',
      description: "Wallet not connecting? Page not loading? Don't worry — most issues have quick fixes. Check these common solutions first.",
      icon: <HelpCircle className="w-5 h-5 text-indigo-600" />
    }
  ];

  return (
    <>
      <Navbar />
      <main className="flex-grow flex flex-col min-w-0 overflow-x-hidden pt-32 md:pt-36 pb-12">
        <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Help & Support</h1>
              <p className="text-slate-500 text-sm">We&apos;ve put together guides and answers for the most common questions. If you can&apos;t find what you need, just reach out.</p>
            </div>

            <div className="glass-card p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-sm space-y-12">
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-slate-900">Popular Topics</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {articles.map((article, i) => (
                  <div key={i} className="glass-card p-6 rounded-2xl border border-slate-100 hover:border-slate-200 transition-all space-y-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
                      {article.icon}
                    </div>
                    <h3 className="font-bold text-slate-800 text-sm">{article.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{article.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-50 rounded-3xl p-6 sm:p-8 border border-slate-200/40 space-y-6">
              <h2 className="text-xl font-bold text-slate-900">Before You Begin — Quick Checklist</h2>
              <p className="text-slate-500 text-sm leading-relaxed">
                Most setup issues come from outdated wallet apps or browser settings. Run through this quick list and you&apos;ll likely be good to go in minutes.
              </p>

              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <li className="flex items-start space-x-3 text-sm text-slate-600">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>Make sure your wallet app (MetaMask, Trust Wallet, etc.) is up to date.</span>
                </li>
                <li className="flex items-start space-x-3 text-sm text-slate-600">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>Check that your browser allows wallet popups and connection prompts.</span>
                </li>
                <li className="flex items-start space-x-3 text-sm text-slate-600">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>Have a small amount of BNB in your wallet for transaction fees.</span>
                </li>
                <li className="flex items-start space-x-3 text-sm text-slate-600">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>Never share your recovery phrase or private keys with anyone — ever.</span>
                </li>
              </ul>
            </div>

            <div className="space-y-6">
              <h2 className="text-xl font-bold text-slate-900">Still Need Help?</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-card p-6 rounded-2xl border border-slate-100 space-y-3">
                  <div className="flex items-center space-x-2">
                    <MessageCircle className="w-5 h-5 text-sky-600" />
                    <h3 className="font-bold text-slate-900">Chat with us</h3>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Join our Telegram community where our team and other members can help you in real-time. Most questions get answered within minutes.
                  </p>
                </div>
                <div className="glass-card p-6 rounded-2xl border border-slate-100 space-y-3">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <h3 className="font-bold text-slate-900">Stay safe</h3>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Our team will never ask for your passwords, seed phrases, or private keys. If someone does, it&apos;s not us. Always verify through official channels.
                  </p>
                </div>
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
