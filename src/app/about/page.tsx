import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Shield, Users, Award, Heart, Lightbulb, Target } from 'lucide-react';

export const metadata = {
  title: 'About Us - Universe Chain',
  description: 'Learn the story behind Universe Chain — why we built it, what drives our team, and how we are creating a fairer way for communities to grow together.',
};

export default function About() {
  return (
    <>
      <Navbar />
      <main className="flex-grow flex flex-col min-w-0 overflow-x-hidden pt-32 md:pt-36 pb-12">
        <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">About Us</h1>
              <p className="text-slate-500 text-sm">Universe Chain started with a simple question: what if there was a platform where people could grow together — transparently, fairly, and without the usual friction?</p>
            </div>

            <div className="glass-card p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-sm space-y-12">
              <div className="space-y-4 leading-relaxed text-sm">
              <h2 className="text-xl font-bold text-slate-900">Why We Built This</h2>
              <p className="text-slate-600">
                We&apos;ve seen too many platforms that promise the world and deliver confusion. Complicated dashboards. Hidden fees. Vague terms. People deserve better than that.
              </p>
              <p className="text-slate-600">
                So we built Universe Chain — a community platform where everything is upfront. You can see exactly how your community is growing, what&apos;s happening with your account, and where your rewards come from. No black boxes, no fine print games.
              </p>
              <p className="text-slate-600">
                We use blockchain technology not because it&apos;s trendy, but because it gives people real transparency. Every transaction is verifiable. Every activation is on-chain. That&apos;s the kind of trust we think people deserve.
              </p>
            </div>

            <div className="space-y-4 leading-relaxed text-sm">
              <h2 className="text-xl font-bold text-slate-900">What We Believe In</h2>
              <p className="text-slate-600">
                A great platform isn&apos;t about flashy features — it&apos;s about making people feel confident. That means clear language on every page, a support team that actually responds, and a dashboard that shows you the truth, not just what looks impressive.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
              <div className="glass-card p-6 rounded-2xl border border-slate-100 space-y-4">
                <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center border border-slate-100">
                  <Target className="w-5 h-5 text-sky-600" />
                </div>
                <h3 className="font-bold text-slate-900">Radical Transparency</h3>
                <p className="text-xs text-slate-500 leading-relaxed">Every activation, every reward, every community growth metric — it&apos;s all visible and verifiable. We have nothing to hide.</p>
              </div>

              <div className="glass-card p-6 rounded-2xl border border-slate-100 space-y-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center border border-slate-100">
                  <Heart className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="font-bold text-slate-900">People Over Profits</h3>
                <p className="text-xs text-slate-500 leading-relaxed">We designed the reward structure so that the community benefits first. When your people succeed, that&apos;s when the platform truly works.</p>
              </div>

              <div className="glass-card p-6 rounded-2xl border border-slate-100 space-y-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center border border-slate-100">
                  <Lightbulb className="w-5 h-5 text-indigo-600" />
                </div>
                <h3 className="font-bold text-slate-900">Keep It Simple</h3>
                <p className="text-xs text-slate-500 leading-relaxed">We don&apos;t use complicated jargon or bury important info in long documents. If it&apos;s important, you&apos;ll see it front and center.</p>
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
