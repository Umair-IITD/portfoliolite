import { Crown, Check, X } from "lucide-react";
import { useNavigate } from "react-router";

export default function PaywallModal() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-full bg-[#0A0F1E]/95 backdrop-blur-xl px-6 py-8 relative">
      <button 
        onClick={() => navigate(-1)}
        className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors z-10"
      >
        <X size={18} />
      </button>

      <div className="flex-1 flex flex-col justify-center items-center max-w-sm mx-auto w-full">
        <div className="w-20 h-20 bg-gradient-to-br from-amber-300 to-amber-600 rounded-full flex items-center justify-center mb-8 shadow-xl shadow-amber-500/20">
          <Crown size={40} className="text-[#0A0F1E]" strokeWidth={2} />
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-center mb-3">PortfolioLite <span className="text-amber-400">Pro</span></h1>
        <p className="text-white/60 text-center text-[15px] leading-relaxed mb-10 px-4">
          Unlock unlimited assets, multi-currency support, and cloud backup. Still completely private.
        </p>

        <div className="w-full space-y-4 mb-10">
          {[
            "Track unlimited asset classes",
            "Auto-sync latest stock prices",
            "Export raw data to CSV/Excel",
            "Family portfolio sharing",
            "Priority email support"
          ].map((feature, i) => (
            <div key={i} className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/5">
              <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                <Check size={14} className="text-amber-400" strokeWidth={3} />
              </div>
              <span className="font-medium text-[15px]">{feature}</span>
            </div>
          ))}
        </div>

        <div className="w-full mt-auto">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-2xl font-bold tracking-tight">₹499</span>
            <span className="text-white/40 text-sm">/ year</span>
          </div>
          
          <button className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-600 text-[#0A0F1E] font-bold text-[16px] tracking-wide active:scale-95 transition-transform shadow-lg shadow-amber-500/25">
            Upgrade Now
          </button>
          
          <p className="text-center mt-6 text-xs text-white/40 font-medium tracking-wide">
            Restore Purchases • Terms of Service
          </p>
        </div>
      </div>
    </div>
  );
}
