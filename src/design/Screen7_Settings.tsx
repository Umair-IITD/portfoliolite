import { Link } from "react-router";
import { User, Shield, Lock, Download, Moon, ChevronRight, Crown } from "lucide-react";

export default function Settings() {
  return (
    <div className="flex flex-col min-h-full bg-[#0A0F1E] pt-14 pb-6 px-6">
      <h1 className="text-2xl font-semibold tracking-tight mb-8">Settings</h1>

      <div className="space-y-6 flex-1">
        {/* Profile Card */}
        <div className="bg-white/5 border border-white/10 rounded-[32px] p-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#3B82F6]/20 flex items-center justify-center border border-[#3B82F6]/50">
            <User size={24} className="text-[#3B82F6]" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold tracking-tight">Investor Mode</h2>
            <p className="text-white/40 text-sm mt-0.5">Free Plan • Local Only</p>
          </div>
          <Link to="/paywall" className="p-3 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full shadow-lg shadow-amber-500/20">
            <Crown size={20} className="text-[#0A0F1E]" />
          </Link>
        </div>

        {/* Settings Groups */}
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest px-2">Security</h3>
            <div className="bg-white/5 border border-white/5 rounded-3xl overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <Lock size={20} className="text-white/60" />
                  <span className="font-medium text-[15px]">Biometric Lock</span>
                </div>
                <div className="w-12 h-6 bg-[#3B82F6] rounded-full relative">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                </div>
              </div>
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <Shield size={20} className="text-white/60" />
                  <span className="font-medium text-[15px]">Privacy Shield</span>
                </div>
                <ChevronRight size={20} className="text-white/20" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest px-2">Data</h3>
            <div className="bg-white/5 border border-white/5 rounded-3xl overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <Download size={20} className="text-white/60" />
                  <span className="font-medium text-[15px]">Export Portfolio</span>
                </div>
                <ChevronRight size={20} className="text-white/20" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest px-2">Appearance</h3>
            <div className="bg-white/5 border border-white/5 rounded-3xl overflow-hidden">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <Moon size={20} className="text-white/60" />
                  <span className="font-medium text-[15px]">Dark Theme</span>
                </div>
                <span className="text-sm font-medium text-white/40">Default</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8 text-center pb-20">
        <p className="text-white/20 text-xs font-medium tracking-wide">Version 1.0.0 (Build 42)</p>
        <p className="text-white/20 text-[10px] mt-1">Made in India</p>
      </div>
    </div>
  );
}
