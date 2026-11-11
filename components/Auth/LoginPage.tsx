import React, { useState } from 'react';
import BrandingLogo from '../BrandingLogo';
import { useAuth } from '../../src/context/AuthContext';
import { Lock, Mail, ShieldAlert, ArrowLeft, KeyRound, CheckCircle2, UserCheck } from 'lucide-react';

interface LoginPageProps {
  onSuccess: () => void;
  onBackToHome: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onSuccess, onBackToHome }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Invalid credentials or inactive account.');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-brand-red/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top back button */}
      <div className="absolute top-6 left-6 z-20">
        <button
          onClick={onBackToHome}
          className="flex items-center gap-2 text-gray-400 hover:text-white px-3 py-1.5 rounded-lg bg-gray-900/80 border border-gray-800 text-sm hover:border-gray-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Main Website</span>
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        {/* Central Logo */}
        <div className="flex justify-center mb-6">
          <BrandingLogo imgClassName="h-16 w-auto" />
        </div>

        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Inventory & Stocktaking Portal
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Secure multi-shop inventory control & loss prevention
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-dark-card py-8 px-6 sm:px-10 shadow-2xl rounded-xl border border-gray-800">
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-950/60 border border-red-800/80 flex items-start gap-3 text-red-200 text-sm animate-shake">
              <ShieldAlert className="w-5 h-5 text-brand-red flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white">Authentication Failed</p>
                <p className="text-xs text-red-300 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-gray-300">
                Email Address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@kgothatso.co.za"
                  className="block w-full pl-10 pr-3 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-brand-red sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-gray-300">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="block w-full pl-10 pr-3 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-brand-red sm:text-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-400">
              <span className="flex items-center gap-1.5 text-gray-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Restricted Access System
              </span>
              <span className="text-[11px] text-gray-500 italic">
                No public registration
              </span>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-bold text-white bg-brand-red hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-card focus:ring-brand-red transition-all transform active:scale-98 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Sign In to Dashboard</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Demo Switcher */}
          <div className="mt-8 pt-6 border-t border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Evaluation Demo Accounts
              </span>
              <span className="text-[10px] text-gray-500">Click to autofill</span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => fillCredentials('admin@kgothatso.co.za', 'Admin@2026')}
                className="w-full text-left p-2.5 rounded-lg bg-gray-900/80 hover:bg-gray-800 border border-gray-800 hover:border-brand-red/50 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-md bg-brand-red/20 text-brand-red flex items-center justify-center font-bold text-xs">
                    ADM
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white group-hover:text-red-400 transition-colors">
                      Administrator (Full Access)
                    </div>
                    <div className="text-[11px] text-gray-400">admin@kgothatso.co.za</div>
                  </div>
                </div>
                <span className="text-[10px] bg-brand-red/20 text-red-300 px-2 py-0.5 rounded font-mono font-bold">
                  All Shops & Reports
                </span>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials('thabo@client.co.za', 'Client@2026')}
                className="w-full text-left p-2.5 rounded-lg bg-gray-900/80 hover:bg-gray-800 border border-gray-800 hover:border-emerald-500/50 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                    CL1
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white group-hover:text-emerald-400 transition-colors">
                      Thabo Mokoena (Client A)
                    </div>
                    <div className="text-[11px] text-gray-400">thabo@client.co.za</div>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-950/60 text-emerald-400 px-2 py-0.5 rounded font-mono">
                  Shop 001 & Shop 003
                </span>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials('nomsa@client.co.za', 'Client@2026')}
                className="w-full text-left p-2.5 rounded-lg bg-gray-900/80 hover:bg-gray-800 border border-gray-800 hover:border-blue-500/50 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-md bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                    CL2
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white group-hover:text-blue-400 transition-colors">
                      Nomsa Dlamini (Client B)
                    </div>
                    <div className="text-[11px] text-gray-400">nomsa@client.co.za</div>
                  </div>
                </div>
                <span className="text-[10px] bg-blue-950/60 text-blue-400 px-2 py-0.5 rounded font-mono">
                  Shop 002 Only
                </span>
              </button>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-gray-500">
          Kgothatso Shrinkage Control System &bull; Loss Prevention &amp; Stock Audit Platform
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
