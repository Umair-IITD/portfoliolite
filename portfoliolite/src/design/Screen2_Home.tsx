import { Plus } from "lucide-react";
import { Link } from "react-router";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { formatRupee } from "../utils/format";

export default function HomeDashboard() {
  const totalNetWorth = 1487350;
  
  const data = [
    { name: "Stocks", value: 850000, color: "#3B82F6" },
    { name: "Mutual Funds", value: 450000, color: "#60A5FA" },
    { name: "Gold", value: 120000, color: "#93C5FD" },
    { name: "Cash", value: 67350, color: "#BFDBFE" },
  ];

  return (
    <div className="flex flex-col min-h-full bg-[#0A0F1E] pt-14 pb-6 px-6 gap-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/40 text-sm font-medium tracking-wide uppercase mb-1">Total Net Worth</p>
          <h1 className="text-[34px] font-semibold tracking-tight">{formatRupee(totalNetWorth)}</h1>
        </div>
        <Link 
          to="/add" 
          className="w-12 h-12 rounded-full bg-[#3B82F6] flex items-center justify-center text-white shadow-lg shadow-blue-500/20 active:scale-95 transition-transform"
        >
          <Plus size={24} strokeWidth={2.5} />
        </Link>
      </div>

      {/* Allocation Chart */}
      <div className="bg-white/5 border border-white/10 rounded-[32px] p-6 flex flex-col gap-6">
        <h2 className="text-lg font-medium tracking-tight">Asset Allocation</h2>
        
        <div className="h-[200px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-white/40 text-xs font-medium uppercase tracking-wider">Top Asset</span>
            <span className="text-lg font-semibold mt-0.5">Stocks</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-y-4 gap-x-2">
          {data.map((item) => (
            <div key={item.name} className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <div>
                <p className="text-white/80 text-[13px] font-medium">{item.name}</p>
                <p className="text-white/40 text-[11px] mt-0.5">{((item.value / totalNetWorth) * 100).toFixed(1)}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-medium tracking-tight">Recent Activity</h2>
        <div className="space-y-3">
          {[
            { title: "Nifty 50 Index Fund", type: "SIP Auto-debit", amount: 15000, date: "Today" },
            { title: "HDFC Bank", type: "Dividend Received", amount: 4500, date: "Yesterday" },
            { title: "SGB 2024 Series", type: "Buy Order", amount: 62000, date: "Mar 15" },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl">
              <div>
                <p className="font-medium text-[15px]">{item.title}</p>
                <p className="text-white/40 text-[13px] mt-0.5">{item.type} • {item.date}</p>
              </div>
              <p className="font-medium text-[15px] text-[#3B82F6]">{formatRupee(item.amount)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
