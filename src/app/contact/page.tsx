import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ContactForm from '@/components/ContactForm';

export const metadata = {
  title: 'Contact Us - Universe Chain',
  description: 'Get in touch with the Universe Chain team for support, inquiries, and partnership opportunities.',
};

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main className="flex-grow flex flex-col min-w-0 overflow-x-hidden pt-32 md:pt-36 pb-12">
        <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Contact Us</h1>
              <p className="text-slate-500 text-sm">
                Have questions about Universe Chain? Need support or want to explore partnership opportunities? We&apos;d love to hear from you.
              </p>
            </div>

            <div className="w-full">
              <div className="glass-card bg-white p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6">
                <h2 className="text-xl font-bold text-slate-900">Send a Message</h2>
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
