import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from "react-native";
import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  TrendingUp, Circle, Landmark, BarChart2,
  Plus, Lock, Shield, ChevronRight, LineChart,
  Zap, Home, Wallet,
} from "lucide-react-native";
import Svg, { Circle as SvgCircle } from "react-native-svg";
import { useAssets, formatINR, AllocationItem } from "../../src/hooks/useAssets";
import { Asset, AssetType } from "../../src/db/database";
import { usePurchases } from "../../src/hooks/usePurchases";

const C = {
  navy:   "#0A0F1E",
  card:   "rgba(17, 24, 39, 0.8)", // Glass effect
  card2:  "#1a2236",
  teal:   "#00D4B4",
  blue:   "#3B82F6",
  gold:   "#F5A623",
  green:  "#22C55E",
  purple: "#8B5CF6",
  orange: "#F97316",
  text1:  "#F1F5F9",
  text2:  "#94A3B8",
  text3:  "#64748B",
  border: "rgba(255, 255, 255, 0.08)",
};

// ─── Donut chart ─────────────────────────────────────────────────
function DonutChart({ allocation }: { allocation: AllocationItem[] }) {
  const r = 36, cx = 48, cy = 48, stroke = 12;
  const circ = 2 * Math.PI * r;
  let used = 0;

  return (
    <Svg width={96} height={96} viewBox="0 0 96 96">
      <SvgCircle cx={cx} cy={cy} r={r} fill="none" stroke={C.card2} strokeWidth={stroke} />
      {allocation.map((seg) => {
        const dash   = (seg.percentage / 100) * circ;
        const offset = circ * 0.25 - (used / 100) * circ;
        used += seg.percentage;
        return (
          <SvgCircle
            key={seg.type}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth={stroke - 1}
            strokeDasharray={`${dash} ${circ - dash}`}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        );
      })}
    </Svg>
  );
}

// ─── Asset type icon ─────────────────────────────────────────────
function AssetIcon({ type }: { type: AssetType }) {
  const sz = 18;
  switch (type) {
    case "mutual_fund":  return <TrendingUp color={C.teal}    size={sz} />;
    case "gold":         return <Circle     color={C.gold}    size={sz} />;
    case "fd":           return <Landmark   color={C.green}   size={sz} />;
    case "stock":        return <BarChart2  color={C.blue}    size={sz} />;
    case "crypto":       return <Zap        color="#F97316"   size={sz} />;
    case "ppf":          return <Shield     color="#A855F7"   size={sz} />;
    case "real_estate":  return <Home       color={C.text3}   size={sz} />;
    case "cash":         return <Wallet     color={C.text3}   size={sz} />;
  }
}

// ─── Empty state ──────────────────────────────────────────────────
function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <View style={s.emptyWrap}>
      <Text style={s.emptyIcon}>📊</Text>
      <Text style={s.emptyTitle}>No assets yet</Text>
      <Text style={s.emptySub}>
        Tap the + button to add your first asset.{"\n"}
        All data stays on your device — forever.
      </Text>
      <TouchableOpacity style={s.emptyBtn} onPress={onAdd}>
        <Text style={s.emptyBtnText}>Add First Asset</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Screen ──────────────────────────────────────────────────────
export default function HomeScreen() {
  const router = useRouter();
  const { assets, isLoading: assetsLoading, netWorth, allocation } = useAssets();
  const { isPro } = usePurchases();

  // ─── Metrics ───────────────────────────────────────────────────
  const diversityScore = useMemo(() => {
    if (allocation.length === 0) return 0;
    // Ideal balance: 100/count per asset. Penalty for large single-asset concentration.
    const maxPct = Math.max(...allocation.map(a => a.percentage));
    const score = Math.max(0, 100 - (maxPct - (100 / allocation.length)) * 1.5);
    return Math.round(score);
  }, [allocation]);

  const growthVelocity = "Steady"; // Placeholder until snapshots DB is deeper

  if (assetsLoading) {
    return (
      <SafeAreaView style={[s.safe, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator color={C.teal} size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.headerLeft}>
            <Text style={s.headerTitle}>PortfolioLite</Text>
            {isPro && (
                <View style={s.proBadge}>
                    <Text style={s.proBadgeText}>PRO</Text>
                </View>
            )}
        </View>
        <TouchableOpacity onPress={() => router.push("/settings")}>
          <Lock color={C.text3} size={20} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >
        {/* Net Worth Card */}
        <View style={s.nwCard}>
          <View style={s.zeroBadge}>
            <Shield color={C.teal} size={12} />
            <Text style={s.zeroText}>Zero Cloud · Private Dashboard</Text>
          </View>
          <Text style={s.nwLabel}>TOTAL NET WORTH</Text>
          <Text style={s.nwAmount}>{formatINR(netWorth)}</Text>
          {netWorth > 0 && (
            <Text style={s.nwSub}>{assets.length} active asset{assets.length !== 1 ? "s" : ""}</Text>
          )}
        </View>

        {assets.length === 0 ? (
          <EmptyState onAdd={() => router.push("/add-asset")} />
        ) : (
          <>
            {/* Allocation card */}
            {allocation.length > 0 && (
              <View style={s.allocCard}>
                <View style={s.allocHeader}>
                    <Text style={s.sectionLabelSmall}>DIVERSITY SCORE: {diversityScore}%</Text>
                    <View style={s.diversityBar}>
                        <View style={[s.diversityFill, { width: `${diversityScore}%`, backgroundColor: diversityScore > 70 ? C.teal : C.gold }]} />
                    </View>
                </View>
                <View style={s.allocBody}>
                    <DonutChart allocation={allocation} />
                    <View style={s.legend}>
                    {allocation.map((a) => (
                        <View key={a.type} style={s.legendRow}>
                        <View style={[s.dot, { backgroundColor: a.color }]} />
                        <Text style={s.legendText}>{a.label}</Text>
                        <Text style={s.legendPct}>{a.percentage}%</Text>
                        </View>
                    ))}
                    </View>
                </View>
              </View>
            )}

            {/* Timeline Row (Quick Access) */}
            <TouchableOpacity
              style={s.timelineBtn}
              onPress={() => router.push("/timeline")}
            >
              <View style={s.timelineBtnLeft}>
                <LineChart color={C.blue} size={18} />
                <Text style={s.timelineBtnText}>View Net Worth History</Text>
              </View>
              <ChevronRight color={C.text3} size={16} />
            </TouchableOpacity>

            {/* Recent Assets Section */}
            <View style={s.sectionHeader}>
                <Text style={s.sectionLabel}>RECENT ASSETS</Text>
                <TouchableOpacity onPress={() => router.push("/holdings")}>
                    <Text style={s.seeAllText}>See All</Text>
                </TouchableOpacity>
            </View>
            
            <View style={s.assetListCard}>
                {assets.slice(0, 4).map((a: Asset, i) => (
                    <View key={a.id} style={[
                        s.assetRow, 
                        i === Math.min(assets.length, 4) - 1 && { borderBottomWidth: 0 }
                    ]}>
                        <View style={s.assetIconWrap}>
                            <AssetIcon type={a.type} />
                        </View>
                        <View style={s.assetRowMid}>
                            <Text style={s.assetName} numberOfLines={1}>{a.name}</Text>
                            <Text style={s.assetType}>{a.type.replace("_", " ")}</Text>
                        </View>
                        <Text style={s.assetValue}>
                            {formatINR(a.quantity * a.currentPrice)}
                        </Text>
                    </View>
                ))}
            </View>

            {assets.length > 4 && (
              <TouchableOpacity
                style={s.viewAll}
                onPress={() => router.push("/holdings")}
              >
                <Text style={s.viewAllLink}>
                  View all {assets.length} assets →
                </Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={s.fab}
        onPress={() => router.push("/add-asset")}
      >
        <Plus color="#0A0F1E" size={28} strokeWidth={2.5} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:            { flex: 1, backgroundColor: C.navy },
  header:          { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 18, paddingVertical: 14 },
  headerLeft:      { flexDirection: "row", alignItems: "center", gap: 8 },
  headerTitle:     { fontSize: 20, fontWeight: "800", color: C.text1, letterSpacing: -0.5 },
  proBadge:        { backgroundColor: C.gold, borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2 },
  proBadgeText:    { fontSize: 10, fontWeight: "800", color: "#0A0F1E" },
  scroll:          { paddingBottom: 110 },

  nwCard:          { margin: 18, marginBottom: 14, backgroundColor: C.card, borderRadius: 20, padding: 22, borderWidth: 1, borderColor: C.border },
  zeroBadge:       { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 14 },
  zeroText:        { fontSize: 11, color: C.teal, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },
  nwLabel:         { fontSize: 11, letterSpacing: 1.5, color: C.text3, textTransform: "uppercase", marginBottom: 6 },
  nwAmount:        { fontSize: 36, fontWeight: "900", color: C.text1, letterSpacing: -1, marginBottom: 4 },
  nwSub:           { fontSize: 13, color: C.text3 },

  allocCard:       { marginHorizontal: 18, marginBottom: 14, backgroundColor: C.card, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: C.border },
  allocHeader:     { marginBottom: 18, gap: 8 },
  sectionLabelSmall:{ fontSize: 9, fontWeight: "800", color: C.text3, letterSpacing: 1.2 },
  diversityBar:    { height: 4, width: "100%", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 2, overflow: "hidden" },
  diversityFill:   { height: "100%", borderRadius: 2 },
  allocBody:       { flexDirection: "row", alignItems: "center", gap: 16 },
  legend:          { flex: 1, gap: 8 },
  legendRow:       { flexDirection: "row", alignItems: "center", gap: 8 },
  dot:             { width: 8, height: 8, borderRadius: 4 },
  legendText:      { flex: 1, fontSize: 13, color: C.text2, fontWeight: "500" },
  legendPct:       { fontSize: 12, color: C.text3, fontWeight: "600" },

  timelineBtn:     { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginHorizontal: 18, marginBottom: 20, backgroundColor: C.card, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 15, borderWidth: 1, borderColor: C.border },
  timelineBtnLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  timelineBtnText: { fontSize: 14, color: C.text1, fontWeight: "600" },

  sectionHeader:   { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 18, marginBottom: 10 },
  sectionLabel:    { fontSize: 11, fontWeight: "700", letterSpacing: 1.5, color: C.text3, textTransform: "uppercase" },
  seeAllText:      { fontSize: 12, color: C.blue, fontWeight: "600" },
  
  assetListCard:   { marginHorizontal: 18, backgroundColor: C.card, borderRadius: 20, overflow: "hidden", borderWidth: 1, borderColor: C.border },
  assetRow:        { flexDirection: "row", alignItems: "center", gap: 14, padding: 16, borderBottomWidth: 1, borderBottomColor: C.border },
  assetIconWrap:   { width: 42, height: 42, borderRadius: 12, backgroundColor: C.card2, alignItems: "center", justifyContent: "center" },
  assetRowMid:     { flex: 1 },
  assetName:       { fontSize: 15, color: C.text1, fontWeight: "600", marginBottom: 2 },
  assetType:       { fontSize: 11, color: C.text3, textTransform: "capitalize" },
  assetValue:      { fontSize: 16, fontWeight: "800", color: C.gold },

  viewAll:         { alignItems: "center", paddingTop: 16, paddingBottom: 24 },
  viewAllLink:     { fontSize: 13, color: C.text3, fontWeight: "500" },

  fab:             { position: "absolute", bottom: 82, right: 18, width: 60, height: 60, borderRadius: 30, backgroundColor: C.teal, alignItems: "center", justifyContent: "center", elevation: 10, shadowColor: C.teal, shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 5 } },

  emptyWrap:       { alignItems: "center", paddingTop: 40, paddingHorizontal: 32 },
  emptyIcon:       { fontSize: 54, marginBottom: 20 },
  emptyTitle:      { fontSize: 22, fontWeight: "800", color: C.text1, marginBottom: 10 },
  emptySub:        { fontSize: 15, color: C.text3, textAlign: "center", lineHeight: 24, marginBottom: 32 },
  emptyBtn:        { paddingVertical: 16, paddingHorizontal: 36, backgroundColor: C.teal, borderRadius: 14 },
  emptyBtnText:    { fontSize: 16, fontWeight: "800", color: "#0A0F1E" },
});