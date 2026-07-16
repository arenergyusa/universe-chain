import Link from 'next/link';
import { SearchX, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="glass-card bg-white border border-slate-200/60 rounded-3xl p-8 max-w-lg w-full text-center shadow-xl space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
          <SearchX className="w-10 h-10" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            404
          </h1>
          <h2 className="text-lg font-bold text-slate-700">
            Page Not Found
          </h2>
          <p className="text-slate-500 text-sm leading-relaxed max-w-sm mx-auto">
            The page you are looking for doesn&apos;t exist, has been moved, or is temporarily unavailable.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 justify-center pt-4">
          <Link href="/" className="w-full sm:w-auto">
            <Button 
              variant="default"
              className="w-full bg-slate-900 hover:bg-slate-800"
            >
              <Home className="w-4 h-4 mr-2" />
              Go to Homepage
            </Button>
          </Link>
          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button 
              variant="outline"
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
