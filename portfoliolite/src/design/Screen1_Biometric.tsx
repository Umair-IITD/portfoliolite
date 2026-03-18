import { useNavigate } from "react-router";
import { Fingerprint, ShieldCheck } from "lucide-react";
import { useState, useEffect } from "react";

export default function BiometricGate() {
  const navigate = useNavigate();
  const [authenticating, setAuthenticating] = useState(false);

  const handleAuth = () => {
    setAuthenticating(true);
    setTimeout(() => {
      navigate("/home");
    }, 1500);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 bg-[#0A0F1E] text-white space-y-12">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="w-20 h-20 bg-blue-500/10 rounded-3xl flex items-center justify-center">
          <ShieldCheck size={40} className="text-[#3B82F6]" strokeWidth={1.5} />
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">PortfolioLite</h1>
        <p className="text-white/40 text-[15px] leading-relaxed max-w-[280px]">
          Privacy-first wealth tracker. Your data stays on your device.
        </p>
      </div>

      <div className="mt-auto pb-32 w-full flex flex-col items-center gap-8">
        <button
          onClick={handleAuth}
          disabled={authenticating}
          className={`w-24 h-24 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
            authenticating
              ? "border-[#3B82F6] bg-blue-500/10 scale-95"
              : "border-white/10 hover:border-[#3B82F6]/50 bg-white/5 active:scale-95"
          }`}
        >
          <Fingerprint
            size={48}
            className={`transition-colors duration-300 ${
              authenticating ? "text-[#3B82F6] animate-pulse" : "text-white/60"
            }`}
            strokeWidth={1}
          />
        </button>
        <p className="text-white/40 text-sm font-medium tracking-wide uppercase">
          {authenticating ? "Authenticating..." : "Tap to Unlock"}
        </p>
      </div>
    </div>
  );
}
