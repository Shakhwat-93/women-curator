import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { OrganicBackground } from '../../components/common/OrganicBackground';

export const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    const res = await login(email.trim(), password.trim());
    if (res.success) {
      navigate('/admin');
    } else {
      setErrorMsg(res.error || 'Invalid credentials');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#FAF5EE] text-curator-charcoal flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Organic Design */}
      <OrganicBackground variant="hero" showDots={true} showArc={true} showShadows={true} />

      <div className="relative z-10 w-full max-w-md">
        {/* Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-[2.5rem] p-8 sm:p-10 border border-curator-border shadow-2xl">
          {/* Logo Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-1.5 select-none mb-3">
              <span className="font-serif text-2xl font-bold tracking-tight text-curator-charcoal">
                Women
              </span>
              <span className="text-curator-coral text-sm animate-pulse">✦</span>
              <span className="font-serif text-2xl font-normal text-curator-coral">
                Admin
              </span>
            </div>

            <h2 className="font-serif text-xl font-bold text-curator-charcoal">
              Welcome to Store CMS
            </h2>
            <p className="text-xs text-curator-muted mt-1 font-sans">
              Sign in to manage products, orders, and homepage content
            </p>
          </div>

          {errorMsg && (
            <div className="mb-5 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-curator-muted" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@womencurator.com"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-curator-border bg-[#FAF5EE]/50 text-xs font-mono focus:outline-none focus:border-curator-coral focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-curator-muted" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-curator-border bg-[#FAF5EE]/50 text-xs font-mono focus:outline-none focus:border-curator-coral focus:bg-white transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 rounded-full bg-curator-coral text-white font-sans text-xs font-bold uppercase tracking-wider shadow-lg hover:bg-curator-coral-hover hover:shadow-curator-glow active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Verifying Access...</span>
              ) : (
                <>
                  <span>Sign In to Admin</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-curator-border text-center">
            <a
              href="/"
              className="text-xs text-curator-muted hover:text-curator-coral font-semibold transition-colors flex items-center justify-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-curator-coral" />
              <span>Back to Storefront</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
