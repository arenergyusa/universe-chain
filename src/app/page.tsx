'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight, Shield, Zap,
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

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Universe Chain',
    url: 'https://universechain.online',
    description: 'A secure Web3 Ecosystem platform built on Binance Smart Chain.',
    publisher: {
      '@type': 'Organization',
      name: 'Universe Chain',
      logo: 'https://universechain.online/og-image.png'
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-32 pb-16 md:pt-40 md:pb-24 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                <div className="inline-flex items-center space-x-2 bg-sky-50 border border-sky-100 rounded-full px-4 py-1.5 text-xs font-semibold text-sky-700">
                  <span className="flex h-2 w-2 rounded-full bg-sky-500 animate-ping"></span>
                  <span>Trusted by growing communities worldwide</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  Build Something <br />
                  <span className="text-blue-600">Meaningful Together</span> <br />
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
                  <div className="absolute inset-0 bg-slate-50 rounded-lg transform rotate-2"></div>

                  <div className="glass-card rounded-lg p-5 sm:p-6 relative border border-slate-200 shadow-sm space-y-6">
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
                    <div className="flex flex-col items-center pt-2">
                      <div className="w-10 h-10 rounded-full bg-sky-600 flex items-center justify-center text-white font-bold text-xs z-10 shadow-md">
                        You
                      </div>
                      <div className="w-px h-4 bg-slate-200"></div>

                      <div className="flex justify-between w-full relative">
                        <div className="absolute top-0 left-[25%] right-[25%] h-px bg-slate-200"></div>

                        {/* Level 1 - Left Node */}
                        <div className="flex flex-col items-center w-1/2">
                          <div className="w-8 h-8 rounded-full bg-sky-400 shadow-sm z-10 border-2 border-white"></div>
                          <div className="w-px h-4 bg-slate-200"></div>
                          
                          <div className="flex justify-between w-[85%] relative">
                            <div className="absolute top-0 left-[25%] right-[25%] h-px bg-slate-200"></div>
                            
                            {/* Level 2 - L1 */}
                            <div className="flex flex-col items-center w-1/2">
                              <div className="w-6 h-6 rounded-full bg-sky-300 shadow-sm z-10 border-2 border-white"></div>
                              <div className="w-px h-3 bg-slate-200"></div>
                              
                              <div className="flex justify-between w-[75%] relative">
                                <div className="absolute top-0 left-[25%] right-[25%] h-px bg-slate-200"></div>
                                <div className="w-4 h-4 rounded-full bg-slate-200 shadow-sm z-10 border-2 border-white"></div>
                                <div className="w-4 h-4 rounded-full bg-slate-200 shadow-sm z-10 border-2 border-white"></div>
                              </div>
                            </div>
                            
                            {/* Level 2 - L2 */}
                            <div className="flex flex-col items-center w-1/2">
                              <div className="w-6 h-6 rounded-full bg-sky-300 shadow-sm z-10 border-2 border-white"></div>
                              <div className="w-px h-3 bg-slate-200"></div>
                              
                              <div className="flex justify-between w-[75%] relative">
                                <div className="absolute top-0 left-[25%] right-[25%] h-px bg-slate-200"></div>
                                <div className="w-4 h-4 rounded-full bg-slate-200 shadow-sm z-10 border-2 border-white"></div>
                                <div className="w-4 h-4 rounded-full bg-slate-200 shadow-sm z-10 border-2 border-white"></div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Level 1 - Right Node */}
                        <div className="flex flex-col items-center w-1/2">
                          <div className="w-8 h-8 rounded-full bg-sky-400 shadow-sm z-10 border-2 border-white"></div>
                          <div className="w-px h-4 bg-slate-200"></div>
                          
                          <div className="flex justify-between w-[85%] relative">
                            <div className="absolute top-0 left-[25%] right-[25%] h-px bg-slate-200"></div>
                            
                            {/* Level 2 - R1 */}
                            <div className="flex flex-col items-center w-1/2">
                              <div className="w-6 h-6 rounded-full bg-sky-300 shadow-sm z-10 border-2 border-white"></div>
                              <div className="w-px h-3 bg-slate-200"></div>
                              
                              <div className="flex justify-between w-[75%] relative">
                                <div className="absolute top-0 left-[25%] right-[25%] h-px bg-slate-200"></div>
                                <div className="w-4 h-4 rounded-full bg-slate-200 shadow-sm z-10 border-2 border-white"></div>
                                <div className="w-4 h-4 rounded-full bg-slate-200 shadow-sm z-10 border-2 border-white"></div>
                              </div>
                            </div>
                            
                            {/* Level 2 - R2 */}
                            <div className="flex flex-col items-center w-1/2">
                              <div className="w-6 h-6 rounded-full bg-sky-300 shadow-sm z-10 border-2 border-white"></div>
                              <div className="w-px h-3 bg-slate-200"></div>
                              
                              <div className="flex justify-between w-[75%] relative">
                                <div className="absolute top-0 left-[25%] right-[25%] h-px bg-slate-200"></div>
                                <div className="w-4 h-4 rounded-full bg-slate-200 shadow-sm z-10 border-2 border-white"></div>
                                <div className="w-4 h-4 rounded-full bg-slate-200 shadow-sm z-10 border-2 border-white"></div>
                              </div>
                            </div>
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
        <section id="how-it-works" className="py-20 bg-white relative overflow-hidden border-b border-slate-200/50">
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
        <section className="py-24 bg-slate-50 border-y border-slate-200/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6 text-center lg:text-left">
                <h2 className="text-xs font-bold tracking-wider text-sky-700 uppercase">Get Started</h2>
                <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  One activation. <br className="hidden lg:block" /> Unlimited possibilities.
                </h3>
                <p className="text-slate-500 text-base leading-relaxed max-w-lg mx-auto lg:mx-0">
                  A single 100 USDT activation opens up your personal dashboard, your invite link, and your journey with Universe Chain. No hidden fees, no surprises.
                </p>
                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                  <div className="flex items-center space-x-3 bg-white px-4 py-3 rounded-2xl border border-slate-200 shadow-sm">
                    <Shield className="w-6 h-6 text-emerald-500" />
                    <div className="text-xs text-left">
                      <strong className="block text-slate-900">Secure & Transparent</strong>
                      <span className="text-slate-500">Powered by smart contracts</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center lg:justify-end">
                <div className="w-full max-w-md glass-card border border-slate-100 rounded-3xl overflow-hidden shadow-lg relative">
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-sky-400 to-blue-600"></div>
                  
                  <div className="p-8 bg-white/50 border-b border-slate-100 text-center space-y-4">
                    <h3 className="text-xl font-bold text-slate-800">Community Activation</h3>
                    <div className="inline-flex items-baseline">
                      <span className="text-5xl font-black text-slate-900">100</span>
                      <span className="text-lg font-bold text-slate-500 ml-2">USDT</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 font-bold uppercase tracking-wider bg-slate-100 px-3 py-1 rounded-full inline-block">
                        One-Time Activation
                      </span>
                    </div>
                  </div>

                  <div className="p-8 space-y-6 bg-white">
                    <ul className="space-y-4">
                      <li className="flex items-start space-x-3 text-sm text-slate-600">
                        <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span><strong>Personal dashboard</strong> with real-time activity</span>
                      </li>
                      <li className="flex items-start space-x-3 text-sm text-slate-600">
                        <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span><strong>Unique invite link</strong> to share with your community</span>
                      </li>
                      <li className="flex items-start space-x-3 text-sm text-slate-600">
                        <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span><strong>Transparent tracking</strong> of your team growth</span>
                      </li>
                      <li className="flex items-start space-x-3 text-sm text-slate-600">
                        <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span><strong>Automatic rewards</strong> as your community expands</span>
                      </li>
                    </ul>

                    <Link
                      href="/dashboard"
                      className="glow-btn w-full inline-flex items-center justify-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl text-base shadow-md transition-all duration-200"
                    >
                      <span>Activate Now</span>
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">
              <div className="lg:col-span-5 space-y-6 text-center lg:text-left lg:sticky lg:top-32">
                <h2 className="text-xs font-bold tracking-wider text-sky-700 uppercase">FAQ</h2>
                <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  Got questions? <br className="hidden lg:block" /> We&apos;ve got answers.
                </h3>
                <p className="text-slate-500 text-base leading-relaxed max-w-lg mx-auto lg:mx-0">
                  If you can&apos;t find what you&apos;re looking for, feel free to reach out to our team via the contact page or community chat.
                </p>
                <div className="pt-2 flex justify-center lg:justify-start">
                  <Link
                    href="/contact"
                    className="inline-flex items-center space-x-2 text-sm font-bold text-sky-600 hover:text-sky-700 transition-colors bg-sky-50 px-4 py-2 rounded-xl"
                  >
                    <span>Contact Support</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-7 space-y-4">
                {faqs.map((faq, i) => (
                  <div
                    key={i}
                    className="glass-card border border-slate-100 rounded-2xl overflow-hidden transition-all duration-200 shadow-sm"
                  >
                    <button
                      onClick={() => toggleFaq(i)}
                      className="w-full flex items-center justify-between p-6 text-left focus:outline-none bg-white hover:bg-slate-50/50 transition-colors"
                    >
                      <span className="font-bold text-slate-800 pr-4 text-base">{faq.question}</span>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors flex-shrink-0 ${activeFaq === i ? 'bg-sky-100 text-sky-600' : 'bg-slate-100 text-slate-400'}`}>
                        <ChevronDown
                          className={`w-5 h-5 transition-transform duration-200 ${
                            activeFaq === i ? 'transform rotate-180' : ''
                          }`}
                        />
                      </div>
                    </button>
                    <div
                      className={`transition-all duration-300 ${
                        activeFaq === i ? 'max-h-96 border-t border-slate-100' : 'max-h-0 overflow-hidden'
                      }`}
                    >
                      <div className="p-6 text-sm text-slate-500 leading-relaxed bg-slate-50/50">
                        {faq.answer}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
