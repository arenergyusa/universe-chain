import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export const metadata = {
  title: 'Disclaimer - Universe Chain',
  description: 'Important things to know before using Universe Chain — risks, responsibilities, and honest disclosures.',
};

export default function Disclaimer() {
  return (
    <>
      <Navbar />
      <main className="flex-grow pt-24">
        <section className="bg-slate-50 border-b border-slate-200/50 py-16">
          <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Disclaimer
            </h1>
            <p className="text-slate-500 text-sm max-w-2xl mx-auto leading-relaxed">
              Last updated: June 2026. We believe in being upfront — here are some important things you should know.
            </p>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="max-w-3xl mx-auto px-4 prose prose-slate text-slate-600 space-y-8 leading-relaxed">
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">1. This is not financial advice</h2>
              <p>
                Nothing on this website — including plans, reward descriptions, or community examples — should be taken as financial, investment, tax, or legal advice. We&apos;re a technology platform, not financial advisors.
              </p>
              <p>
                If you&apos;re unsure about anything, talk to a qualified professional before making any decisions. We genuinely mean that.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">2. Results depend on you</h2>
              <p>
                Universe Chain provides tools for community building. How your experience turns out depends on many factors — your effort, your community, market conditions, and timing. We don&apos;t guarantee any specific outcome.
              </p>
              <p>
                We&apos;ll always be honest about how the platform works, but we can&apos;t predict or promise what results you&apos;ll see.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">3. Blockchain transactions are permanent</h2>
              <p>
                Once a transaction happens on the blockchain, it can&apos;t be reversed. Please double-check wallet addresses, amounts, and approvals before confirming anything. Take your time — there&apos;s no undo button.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">4. Technology has its limits</h2>
              <p>
                Like any online platform, Universe Chain can be affected by things outside our control — slow networks, wallet provider issues, browser bugs, or hosting problems. We work hard to keep things stable, but perfect uptime isn&apos;t something anyone can promise.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">5. Use your own judgment</h2>
              <p>
                We encourage you to read everything on this website carefully, ask questions before you start, and only participate with amounts you&apos;re comfortable with. The best decisions come from understanding, not pressure.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
