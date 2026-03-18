import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatRupee } from "../utils/format";
import { TrendingUp, Activity } from "lucide-react";
import { useState } from "react";

export default function NetWorthTimeline() {
  const [timeframe, setTimeframe] = useState("1Y");
  
  const data = [
    { month: "Jan", nw: 850000, id: "m1" },
    { month: "Feb", nw: 920000, id: "m2" },
    { month: "Mar", nw: 890000, id: "m3" },
    { month: "Apr", nw: 1050000, id: "m4" },
    { month: "May", nw: 1120000, id: "m5" },
    { month: "Jun", nw: 1250000, id: "m6" },
    { month: "Jul", nw: 1380000, id: "m7" },
    { month: "Aug", nw: 1487350, id: "m8" },
  ];

  const currentNetWorth = data[data.length - 1].nw;
  const startNetWorth = data[0].nw;
  const growth = ((currentNetWorth - startNetWorth) / startNetWorth) * 100;

  return (
    <div className="flex flex-col min-h-full bg-[#0A0F1E] pt-14 pb-6 px-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
          <Activity size={20} className="text-[#3B82F6]" />
        </div>
        <h1 className="text-xl font-semibold tracking-tight">Timeline</h1>
      </div>

      <div className="flex flex-col gap-6 flex-1">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-white/40 text-sm font-medium uppercase tracking-wide mb-1">Total Net Worth</p>
            <h2 className="text-[34px] font-semibold tracking-tight">{formatRupee(currentNetWorth)}</h2>
          </div>
          <div className="flex items-center gap-1 bg-green-500/10 px-3 py-1.5 rounded-full mb-1 border border-green-500/20">
            <TrendingUp size={14} className="text-green-400" />
            <span className="text-green-400 text-sm font-semibold">+{growth.toFixed(1)}%</span>
          </div>
        </div>

        {/* Chart Container */}
        <div className="bg-white/5 border border-white/10 rounded-[32px] p-6 pb-2 h-[340px] flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-medium text-white/60 uppercase tracking-wide">Performance</h3>
            <div className="flex gap-2 bg-black/40 p-1 rounded-xl">
              {["1M", "6M", "1Y", "ALL"].map(t => (
                <button
                  key={t}
                  onClick={() => setTimeframe(t)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    timeframe === t 
                      ? "bg-[#3B82F6] text-white shadow-sm" 
                      : "text-white/40 hover:text-white/80"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 w-full relative -ml-4 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorNw" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  hide={true} 
                  domain={['dataMin - 100000', 'dataMax + 100000']} 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0A0F1E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#3B82F6', fontWeight: 600 }}
                  labelStyle={{ color: 'rgba(255,255,255,0.6)', marginBottom: '4px' }}
                  formatter={(value: number) => [formatRupee(value), "Net Worth"]}
                />
                <Area 
                  type="monotone" 
                  dataKey="nw" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorNw)" 
                  activeDot={{ r: 6, stroke: '#0A0F1E', strokeWidth: 2, fill: '#3B82F6' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Milestones */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-5 mt-4">
          <h3 className="text-sm font-medium text-white/60 uppercase tracking-wide mb-4">Milestones</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]" />
              <p className="text-[15px] font-medium flex-1">Crossed ₹10L mark</p>
              <p className="text-white/40 text-xs">April 2024</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
              <p className="text-[15px] font-medium flex-1 text-white/40">Next Goal: ₹20L</p>
              <p className="text-white/20 text-xs">Target: 2025</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
