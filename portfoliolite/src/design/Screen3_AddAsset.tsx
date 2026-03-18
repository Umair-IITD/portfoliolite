import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useState } from "react";

export default function AddAsset() {
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);
  const [type, setType] = useState("Stocks");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => {
      navigate("/home");
    }, 1500);
  };

  return (
    <div className="flex flex-col min-h-full bg-[#0A0F1E] pt-14 pb-6 px-6">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate(-1)} 
          className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 active:scale-95"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-semibold tracking-tight">Add New Asset</h1>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-[32px] p-6 mb-6 flex-1">
        {success ? (
          <div className="h-full flex flex-col items-center justify-center space-y-6">
            <CheckCircle2 size={64} className="text-green-500 animate-bounce" />
            <h2 className="text-xl font-medium tracking-tight">Asset Added</h2>
            <p className="text-white/40 text-center text-sm max-w-[200px]">
              Your portfolio has been updated locally.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col space-y-6 h-full">
            <div className="space-y-4">
              <label className="text-sm font-medium text-white/60 uppercase tracking-wide block">Asset Type</label>
              <div className="grid grid-cols-2 gap-3">
                {["Stocks", "Mutual Funds", "Gold", "FD / Cash"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`py-3 px-4 rounded-xl text-[13px] font-medium border transition-colors ${
                      type === t 
                        ? "bg-[#3B82F6] border-[#3B82F6] text-white" 
                        : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white/60 uppercase tracking-wide block">Asset Name / Symbol</label>
              <input 
                type="text" 
                placeholder="e.g. RELIANCE or Nifty 50" 
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-[15px] outline-none focus:border-[#3B82F6] transition-colors placeholder:text-white/20"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white/60 uppercase tracking-wide block">Current Value (₹)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 text-lg">₹</span>
                <input 
                  type="number" 
                  placeholder="0.00" 
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-4 text-[17px] font-semibold tracking-tight outline-none focus:border-[#3B82F6] transition-colors placeholder:text-white/20"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="mt-auto w-full py-4 rounded-xl bg-[#3B82F6] text-white font-semibold text-[15px] tracking-wide active:scale-95 transition-transform"
            >
              Save Asset Offline
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
