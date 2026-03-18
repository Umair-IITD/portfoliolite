import { formatRupee } from "../utils/format";
import { PieChart, Briefcase, Coins, PiggyBank, MoreVertical } from "lucide-react";

export default function HoldingsList() {
  const assets = [
    { category: "Equity", items: [
      { name: "Reliance Industries", qty: 120, avg: 2450, ltp: 2980, type: "Stock" },
      { name: "HDFC Bank", qty: 350, avg: 1420, ltp: 1510, type: "Stock" },
      { name: "Parag Parikh Flexi Cap", units: 1450.45, nav: 68.2, type: "Mutual Fund" },
    ]},
    { category: "Commodities", items: [
      { name: "Sovereign Gold Bonds", qty: 20, avg: 5200, ltp: 6800, type: "SGB" },
      { name: "Digital Gold", qty: "15g", avg: 5400, ltp: 6700, type: "Gold" },
    ]},
    { category: "Fixed Income", items: [
      { name: "SBI Fixed Deposit", principal: 500000, rate: "7.1%", type: "FD" },
    ]}
  ];

  const getIcon = (category: string) => {
    switch(category) {
      case "Equity": return <Briefcase size={18} className="text-[#3B82F6]" />;
      case "Commodities": return <Coins size={18} className="text-yellow-500" />;
      case "Fixed Income": return <PiggyBank size={18} className="text-green-400" />;
      default: return <PieChart size={18} />;
    }
  };

  const getProfitLoss = (item: any) => {
    if (item.avg && item.ltp && item.qty && typeof item.qty === 'number') {
      const inv = item.qty * item.avg;
      const cur = item.qty * item.ltp;
      const pct = ((cur - inv) / inv) * 100;
      return { val: cur, pct };
    }
    return null;
  };

  return (
    <div className="flex flex-col min-h-full bg-[#0A0F1E] pt-14 pb-6 px-6">
      <h1 className="text-2xl font-semibold tracking-tight mb-8">My Holdings</h1>

      <div className="space-y-8 flex-1">
        {assets.map((section) => (
          <div key={section.category} className="space-y-4">
            <div className="flex items-center gap-2 border-b border-white/5 pb-2">
              {getIcon(section.category)}
              <h2 className="text-[13px] font-medium text-white/60 uppercase tracking-wider">{section.category}</h2>
            </div>
            
            <div className="grid gap-3">
              {section.items.map((item) => {
                const pl = getProfitLoss(item);
                
                return (
                  <div key={item.name} className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-[15px]">{item.name}</p>
                      <p className="text-white/40 text-[12px] mt-1">{item.type} • {item.qty || item.units || '1'} qty</p>
                    </div>
                    
                    <div className="text-right flex items-center gap-3">
                      <div>
                        {pl ? (
                          <>
                            <p className="font-semibold text-[15px]">{formatRupee(pl.val)}</p>
                            <p className={`text-[12px] mt-0.5 font-medium ${pl.pct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {pl.pct >= 0 ? '+' : ''}{pl.pct.toFixed(2)}%
                            </p>
                          </>
                        ) : (
                          <p className="font-semibold text-[15px]">
                            {item.principal ? formatRupee(item.principal) : '₹---'}
                          </p>
                        )}
                      </div>
                      <button className="text-white/20 hover:text-white/60 p-1">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
