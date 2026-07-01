import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Mail, MessageSquare, Globe } from 'lucide-react';

export const metadata = {
  title: 'Contact Us - Universe Chain',
  description: 'Reach out to the Universe Chain team for account questions, setup help, or general feedback. We are real people and we respond quickly.',
};

export default function Contact() {
  return (
    <>
      <Navbar />
      <main className="flex-grow flex flex-col min-w-0 overflow-x-hidden pt-32 md:pt-36 pb-12">
        <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Talk to Us</h1>
              <p className="text-slate-500 text-sm">Whether you have a question, feedback, or just want to say hello — we'd love to hear from you. Our team typically responds within a few hours.</p>
            </div>

            <div className="glass-card p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
            <div className="md:col-span-5 space-y-6">
              <h2 className="text-xl font-bold text-slate-900">How to reach us</h2>
              <p className="text-slate-500 text-sm leading-relaxed">
                Pick whatever feels most comfortable. Email us for detailed questions, join our community chat for quick answers, or just fill out the form — we read every single message.
              </p>

              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center border border-slate-100">
                    <Mail className="w-5 h-5 text-sky-600" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-bold uppercase">Email</div>
                    <a href="mailto:hello@universechain.online" className="text-sm font-bold text-slate-700 hover:text-sky-600 transition-colors">
                      hello@universechain.online
                    </a>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center border border-slate-100">
                    <MessageSquare className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-bold uppercase">Community Chat</div>
                    <a href="https://t.me/universechain" target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-slate-700 hover:text-emerald-600 transition-colors">
                      t.me/universechain
                    </a>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center border border-slate-100">
                    <Globe className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-bold uppercase">Platform Status</div>
                    <span className="text-sm font-bold text-emerald-600 flex items-center gap-1.5 mt-0.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse-slow"></span>
                      Everything&apos;s running smoothly
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-7">
              <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-md">
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-slate-900">Send us a message</h3>
                  <p className="text-xs text-slate-400 mt-1">We&apos;ll get back to you as soon as we can — usually within a few hours.</p>
                </div>
                <form className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Your Name</label>
                    <input
                      type="text"
                      required
                      placeholder="What should we call you?"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">What&apos;s on your mind?</label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Tell us how we can help..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-sky-500 transition-colors resize-none"
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    className="w-full inline-flex items-center justify-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl text-sm shadow-md transition-all duration-200"
                  >
                    <span>Send Message</span>
                  </button>
                </form>
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
