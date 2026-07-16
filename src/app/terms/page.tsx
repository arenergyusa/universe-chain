import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export const metadata = {
  title: 'Terms & Conditions - Universe Chain',
  description: 'Read the Universe Chain terms of use — written in plain language so you actually understand what you are agreeing to.',
};

export default function Terms() {
  return (
    <>
      <Navbar />
      <main className="flex-grow flex flex-col min-w-0 overflow-x-hidden pt-32 md:pt-36 pb-12">
        <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Terms & Conditions</h1>
              <p className="text-slate-500 text-sm">Last updated: June 2026. We&apos;ve tried to keep this readable — because terms shouldn&apos;t require a law degree.</p>
            </div>

            <div className="glass-card p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-sm">
              <div className="prose prose-slate text-slate-600 max-w-none space-y-8 leading-relaxed text-sm">
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">1. By using Universe Chain, you agree to these terms</h2>
              <p>
                When you connect your wallet and use Universe Chain, you&apos;re agreeing to follow these terms. If something here doesn&apos;t work for you, we&apos;d ask that you not use the platform.
              </p>
              <p>
                These terms cover the website, the dashboard, support pages, and everything else we make available under the Universe Chain name.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">2. Your account is your responsibility</h2>
              <p>
                You&apos;re in charge of your wallet, your device, and your recovery phrase. We can&apos;t access or restore your wallet if something goes wrong on your end — that&apos;s by design, not by accident. It&apos;s what keeps the system secure.
              </p>
              <p>
                Always double-check what you&apos;re approving in your wallet. Take your time with prompts. If something feels off, stop and ask us.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">3. How the platform works</h2>
              <p>
                Universe Chain allows you to activate your account with a one-time deposit. Once activated, you get access to your personal dashboard where you can invite others, track your community&apos;s growth, and manage your account.
              </p>
              <p>
                Rewards are distributed automatically based on community activity. All parameters — including activation amounts, reward percentages, and timelines — are configurable by the platform and may be adjusted as needed.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">4. Play fair</h2>
              <p>
                Don&apos;t try to game the system, spam other users, create fake accounts, or do anything that hurts the experience for others. We&apos;re building this for honest people who want a fair shot.
              </p>
              <p>
                If we see activity that looks abusive or harmful, we may limit or block that account. We&apos;d rather keep the community clean than let bad actors ruin it.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">5. Withdrawals and fees</h2>
              <p>
                You can withdraw your rewards from your internal balance. There&apos;s a minimum withdrawal amount and a processing fee — both are visible in your dashboard settings. These help cover transaction costs and keep the platform running.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">6. Things can change</h2>
              <p>
                We&apos;re constantly improving Universe Chain. That means these terms, platform features, and system parameters may evolve over time. We&apos;ll always try to give you a heads-up, but continued use means you&apos;re okay with the latest version.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">7. No guarantees</h2>
              <p>
                Like any platform, Universe Chain is provided as-is. We work hard to keep things running smoothly, but we can&apos;t promise zero downtime or that every feature will work perfectly at all times. Technology has its days.
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
