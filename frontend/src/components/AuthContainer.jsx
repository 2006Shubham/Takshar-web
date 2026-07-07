import { useState } from 'react';
import { LoginForm } from './LoginForm';
import { SignUpForm } from './SignUpForm';

// Spark brand logo SVG — inline so no external dependency needed
const SparkLogo = () => (
  <div className="flex items-center gap-2.5">
    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500 shadow-lg shadow-orange-500/30">
      <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M13 3L4 14h7v7l9-11h-7z" />
      </svg>
    </div>
    <span className="text-2xl font-bold tracking-tight text-white">Spark</span>
  </div>
);

export const AuthContainer = () => {
  const [isLogin, setIsLogin] = useState(true);

  const handleSwitchToSignUp = () => setIsLogin(false);
  const handleSwitchToLogin = () => setIsLogin(true);

  return (
    <div className="min-h-screen flex">

      {/* ── LEFT PANEL: Brand Hero ── */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[40%] flex-col justify-between bg-[#1C1917] relative overflow-hidden p-12">

        {/* Subtle background texture — concentric dots */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)`,
            backgroundSize: '28px 28px',
          }}
        />

        {/* Warm gradient glow behind content */}
        <div className="pointer-events-none absolute -bottom-40 -left-20 h-80 w-80 rounded-full bg-orange-600/20 blur-3xl" />
        <div className="pointer-events-none absolute top-20 right-0 h-64 w-64 rounded-full bg-orange-500/10 blur-3xl" />

        {/* Logo */}
        <div className="relative z-10">
          <SparkLogo />
        </div>

        {/* Hero Copy */}
        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl xl:text-5xl font-bold leading-tight text-white">
            Learn. Challenge.<br />
            <span className="text-orange-400">Prove it.</span>
          </h1>
          <p className="text-base text-white/60 leading-relaxed max-w-xs">
            Send video challenges to peers, accept their sparks, and build your skills publicly — one proof-of-work at a time.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2 pt-2">
            {['🎯 Daily Challenges', '🔥 Streaks', '🏆 Leaderboard', '🤝 Peer Network'].map(f => (
              <span key={f} className="rounded-full bg-white/8 px-3 py-1 text-xs font-medium text-white/70 ring-1 ring-white/10">
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom tagline */}
        <div className="relative z-10">
          <p className="text-xs text-white/30 font-medium">Built for builders. Designed for doers.</p>
        </div>
      </div>

      {/* ── RIGHT PANEL: Form ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-stone-50 overflow-y-auto">

        {/* Mobile logo */}
        <div className="lg:hidden mb-8">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-600">
              <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900">Spark</span>
          </div>
        </div>

        <div className="w-full max-w-[420px]">
          {isLogin ? (
            <div className="animate-fade-up">
              <LoginForm onNavigateToSignUp={handleSwitchToSignUp} />
            </div>
          ) : (
            <div className="animate-fade-up">
              <SignUpForm
                onNavigateToLogin={handleSwitchToLogin}
                onSuccess={(data) => {
                  console.log('Signup success data:', data);
                  handleSwitchToLogin();
                }}
              />
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default AuthContainer;