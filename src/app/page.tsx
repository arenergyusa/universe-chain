'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight, Shield, Zap, RefreshCw, Layers,
  ChevronDown, CheckCircle, Users, Heart, Globe, Lock
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function Home() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const stats = [
    { value: '24/7', label: 'Always Available' },
    { value: 'PRIVATE', label: 'Your Keys, Your Control' },
    { value: 'INSTANT', label: 'Quick Onboarding' },
    { value: 'GLOBAL', label: 'Borderless Access' }
  ];

  const features = [
    {
      icon: <Lock className="w-6 h-6 text-sky-600" />,
      title: 'Your Identity Stays Yours',
      description: "No passwords to remember, no email signups. Just connect your wallet and you're in. We believe your digital identity should be in your hands — not ours."
    },
    {
      icon: <Zap className="w-6 h-6 text-emerald-600" />,
      title: 'Built for Speed & Simplicity',
      description: "Every interaction is designed to be fast and intuitive. Whether you're checking your dashboard or inviting a friend, things just work — no friction, no confusion."
    },
    {
      icon: <Heart className="w-6 h-6 text-indigo-600" />,
      title: 'Community First, Always',
      description: "Universe Chain grows because people share it with people they trust. We've built everything around that idea — a platform where your community genuinely benefits alongside you."
    },
    {
      icon: <Globe className="w-6 h-6 text-amber-600" />,
      title: 'Works Everywhere You Do',
      description: "On the bus, at a café, or at your desk — Universe Chain looks and feels great on every screen. We obsess over the small details so you don't have to."
    }
  ];

  const steps = [
    {
      step: '01',
      title: 'Connect Your Wallet',
      description: "Open Universe Chain and connect with MetaMask, Trust Wallet, or any Web3 wallet you already use. No forms, no sign-up headaches."
    },
    {
      step: '02',
      title: 'Set Up Your Account',
      description: "Your personal dashboard is ready in seconds. See your activity, manage your profile, and get a unique invite link to share with friends."
    },
    {
      step: '03',
      title: 'Invite People You Trust',
      description: "Share your invite link with friends and family. When they join and get started, both of you benefit from the growing community."
    },
    {
      step: '04',
      title: 'Watch Your Community Grow',
      description: "Track your team's progress in real-time from your dashboard. Everything is transparent — you always know exactly where you stand."
    }
  ];

  const faqs = [
    {
      question: 'What exactly is Universe Chain?',
      answer: "Universe Chain is a community-powered platform where people connect their wallets, get started with a simple activation, and grow together. Think of it as a digital space where your connections actually matter and create value for everyone involved."
    },
    {
      question: 'How do I get started?',
      answer: "It's really simple — connect your Web3 wallet (like MetaMask or Trust Wallet), complete a one-time activation of 100 USDT on the BSC chain, and your account is live. From there, you can invite others and start building your community."
    },
    {
      question: 'Is this safe to use?',
      answer: "Absolutely. We use industry-standard security practices including encrypted data storage, secure session management, and wallet-based authentication. Your private keys never touch our servers — they stay with you, always."
    },
    {
      question: 'Do I need to be tech-savvy?',
      answer: "Not at all. If you can use a smartphone and have a basic wallet app, you're good to go. Our interface is designed for real people, not developers. Everything is clearly labeled, and our support team is always here to help."
    },
    {
      question: 'How does the community benefit work?',
      answer: "When you invite someone and they activate their account, both of you benefit. As your community grows, so does your position. It's designed to be fair, transparent, and rewarding for people who genuinely care about bringing others along."
    }
  ];

  return (
    <>
      <Navbar />

      <main className="flex-grow pt-24">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 md:py-24 bg-gradient-to-b from-sky-50/50 via-white to-slate-50/30">
          <div className="absolute top-1/4 left-[10%] w-96 h-96 bg-sky-200/30 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute top-1/3 right-[10%] w-80 h-80 bg-emerald-200/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                <div className="inline-flex items-center space-x-2 bg-sky-50 border border-sky-100 rounded-full px-4 py-1.5 text-xs font-semibold text-sky-700">
                  <span className="flex h-2 w-2 rounded-full bg-sky-500 animate-ping"></span>
                  <span>Trusted by growing communities worldwide</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  Build Something <br />
                  <span className="gradient-text">Meaningful Together</span> <br />
                  with Universe Chain
                </h1>

                <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                  Universe Chain is where communities come alive. Connect your wallet, bring in the people you believe in, and grow together on a platform that&apos;s designed to be transparent, fair, and genuinely rewarding.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                  <Link
                    href="/dashboard"
                    className="glow-btn w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white font-bold px-8 py-4 rounded-xl text-base shadow-lg shadow-slate-900/10 transition-all duration-200"
                  >
                    <span>Get Started — It&apos;s Quick</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <a
                    href="#how-it-works"
                    className="w-full sm:w-auto inline-flex items-center justify-center bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold px-8 py-4 rounded-xl text-base shadow-sm transition-all duration-150"
                  >
                    See How It Works
                  </a>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 pt-8 border-t border-slate-200/60 max-w-lg sm:max-w-none mx-auto">
                  {stats.map((stat, i) => (
                    <div key={i} className="text-center lg:text-left">
                      <div className="text-lg sm:text-xl font-extrabold text-slate-800 tracking-tight">{stat.value}</div>
                      <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hero Visual — Community Growth Card */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="relative w-full max-w-md">
                  <div className="absolute inset-0 bg-gradient-to-tr from-sky-400 to-emerald-400 rounded-3xl opacity-10 blur-xl transform rotate-2"></div>

                  <div className="glass-card rounded-3xl p-5 sm:p-6 relative border border-slate-200/80 shadow-xl space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                      <div className="flex items-center space-x-2">
                        <Users className="w-5 h-5 text-sky-600" />
                        <span className="text-sm font-bold text-slate-800">Your Community</span>
                      </div>
                      <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 w-fit">
                        <CheckCircle className="w-3.5 h-3.5" /> Active & Growing
                      </span>
                    </div>

                    {/* Community Tree Visual */}
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full gradient-bg flex items-center justify-center text-white font-bold shadow-md shadow-sky-500/20 text-xs z-10 animate-float">
                        You
                      </div>
                      <div className="w-0.5 h-6 bg-slate-200"></div>

                      <div className="flex justify-between w-4/5 relative">
                        <div className="absolute top-0 left-1/4 right-1/4 h-0.5 bg-slate-200"></div>

                        <div className="flex flex-col items-center w-1/2">
                          <div className="w-10 h-10 rounded-full bg-sky-100 border border-sky-300 flex items-center justify-center text-sky-700 font-extrabold text-xs shadow-sm z-10">
                            Sam
                          </div>
                          <div className="w-0.5 h-4 bg-slate-100"></div>
                          <div className="flex justify-between w-full relative">
                            <div className="absolute top-0 left-1/4 right-1/4 h-0.5 bg-slate-100"></div>
                            <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-[10px] z-10">Ali</div>
                            <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-[10px] z-10">Raj</div>
                          </div>
                        </div>

                        <div className="flex flex-col items-center w-1/2">
                          <div className="w-10 h-10 rounded-full bg-sky-100 border border-sky-300 flex items-center justify-center text-sky-700 font-extrabold text-xs shadow-sm z-10">
                            Priya
                          </div>
                          <div className="w-0.5 h-4 bg-slate-100"></div>
                          <div className="flex justify-between w-full relative">
                            <div className="absolute top-0 left-1/4 right-1/4 h-0.5 bg-slate-100"></div>
                            <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-[10px] z-10">Noor</div>
                            <div className="w-7 h-7 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 font-bold text-[10px] z-10">+</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-4 space-y-3.5 border border-slate-100">
                      <div className="flex justify-between gap-4 text-xs">
                        <span className="text-slate-500 font-medium">Activation</span>
                        <span className="font-bold text-slate-800">100 USDT (one-time)</span>
                      </div>
                      <div className="flex justify-between gap-4 text-xs">
                        <span className="text-slate-500 font-medium">Community Size</span>
                        <span className="font-bold text-slate-800">Up to 14 members per cycle</span>
                      </div>
                      <div className="flex justify-between gap-4 text-xs">
                        <span className="text-slate-500 font-medium">Transparency</span>
                        <span className="font-bold text-emerald-600">100% on-chain</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Universe Chain Section */}
        <section className="py-20 bg-white border-y border-slate-200/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
              <h2 className="text-xs font-bold tracking-wider text-sky-700 uppercase">Why People Choose Us</h2>
              <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                A platform that respects your time and trust
              </p>
              <p className="text-slate-500 text-base leading-relaxed">
                We didn&apos;t build Universe Chain to impress — we built it to be useful. Here&apos;s what makes it different from everything else out there.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
              {features.map((feature, i) => (
                <div key={i} className="flex flex-col sm:flex-row gap-5 glass-card p-6 rounded-2xl border border-slate-100 hover:border-slate-200 transition-all">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
                    {feature.icon}
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-slate-900">{feature.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 bg-slate-50/50 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
              <h2 className="text-xs font-bold tracking-wider text-sky-700 uppercase">How It Works</h2>
              <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Four simple steps. That&apos;s it.
              </p>
              <p className="text-slate-500 text-base leading-relaxed">
                No complicated setup, no confusing jargon. Just connect, activate, invite, and grow. You could be up and running in under 5 minutes.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((step, i) => (
                <div key={i} className="relative glass-card p-6 rounded-2xl border border-slate-100 space-y-6">
                  <div aria-hidden="true" className="text-4xl font-black text-sky-600 tracking-wider font-mono">{step.step}</div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-slate-900">{step.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA / Plan Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
              <h2 className="text-xs font-bold tracking-wider text-sky-700 uppercase">Get Started</h2>
              <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                One activation. Unlimited possibilities.
              </p>
              <p className="text-slate-500 text-base leading-relaxed">
                A single 100 USDT activation opens up your personal dashboard, your invite link, and your journey with Universe Chain. No hidden fees, no surprises.
              </p>
            </div>

            <div className="flex justify-center">
              <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-lg shadow-slate-100/50 transform hover:scale-[1.01] transition-transform">
                <div className="p-8 bg-slate-50 border-b border-slate-200/80 text-center space-y-4">
                  <h3 className="text-xl font-bold text-slate-800">Community Activation</h3>
                  <div className="inline-flex items-baseline">
                    <span className="text-5xl font-black text-slate-900">100</span>
                    <span className="text-lg font-bold text-slate-500 ml-2">USDT</span>
                  </div>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">One-Time Activation</p>
                </div>

                <div className="p-8 space-y-6">
                  <ul className="space-y-4">
                    <li className="flex items-center space-x-3 text-sm text-slate-600">
                      <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      <span><strong>Personal dashboard</strong> with real-time activity</span>
                    </li>
                    <li className="flex items-center space-x-3 text-sm text-slate-600">
                      <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      <span><strong>Unique invite link</strong> to share with your community</span>
                    </li>
                    <li className="flex items-center space-x-3 text-sm text-slate-600">
                      <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      <span><strong>Transparent tracking</strong> of your team growth</span>
                    </li>
                    <li className="flex items-center space-x-3 text-sm text-slate-600">
                      <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      <span><strong>Automatic rewards</strong> as your community expands</span>
                    </li>
                    <li className="flex items-center space-x-3 text-sm text-slate-600">
                      <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      <span><strong>24/7 support</strong> whenever you need help</span>
                    </li>
                  </ul>

                  <Link
                    href="/dashboard"
                    className="w-full inline-flex items-center justify-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl text-base shadow-md transition-all duration-200"
                  >
                    <span>Activate Now</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-slate-50/50 border-t border-slate-200/50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-xs font-bold tracking-wider text-sky-700 uppercase">FAQ</h2>
              <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Got questions? We&apos;ve got answers.
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div
                  key={i}
                  className="bg-white border border-slate-200/60 rounded-2xl overflow-hidden transition-all duration-200 shadow-sm"
                >
                  <button
                    onClick={() => toggleFaq(i)}
                    className="w-full flex items-center justify-between p-5 sm:p-6 text-left focus:outline-none"
                  >
                    <span className="font-bold text-slate-800 pr-4">{faq.question}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-400 transition-transform duration-200 flex-shrink-0 ${
                        activeFaq === i ? 'transform rotate-180' : ''
                      }`}
                    />
                  </button>
                  <div
                    className={`transition-all duration-300 ${
                      activeFaq === i ? 'max-h-96 border-t border-slate-100' : 'max-h-0 overflow-hidden'
                    }`}
                  >
                    <div className="p-5 sm:p-6 text-sm text-slate-500 leading-relaxed bg-slate-50/30">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
