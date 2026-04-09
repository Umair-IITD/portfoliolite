import {
  View, Text, TouchableOpacity, StyleSheet,
  PanResponder, Dimensions, ActivityIndicator, ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Info, Lock } from "lucide-react-native";
import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import Svg, {
  Polyline, Circle, Line, Rect,
  Text as SvgText, Defs, LinearGradient, Stop, Path,
} from "react-native-svg";
import { getSnapshots, Snapshot } from "../../src/db/database";
import { useAssets, formatINR } from "../../src/hooks/useAssets";
import { usePurchases } from "../../src/hooks/usePurchases";

const C = {
  navy: "#0A0F1E", card: "#111827", card2: "#1a2236",
  blue: "#3B82F6", green: "#22C55E", gold: "#F5A623",
  teal: "#00D4B4", 
  text1: "#F1F5F9", text2: "#94A3B8", text3: "#64748B",
  border: "rgba(255,255,255,0.07)",
};

const SCREEN_W = Dimensions.get("window").width;
const CHART_H  = 200;
const CHART_W  = SCREEN_W - 36;
const PAD      = { top: 30, bottom: 30, left: 10, right: 10 };

const TOGGLES  = ["1W", "1M", "3M", "All"] as const;
type Range     = typeof TOGGLES[number];

interface ChartPoint {
  label: string; 
  month: string; 
  value: number;
}

function formatDate(ts: number): { label: string; month: string } {
  const d = new Date(ts);
  const months = ["Jan","Feb","Mar","Apr","May","Jun",
                  "Jul","Aug","Sep","Oct","Nov","Dec"];
  const m = months[d.getMonth()];
  const day = d.getDate();
  return { label: `${day} ${m}`, month: m };
}

function filterByRange(snapshots: Snapshot[], range: Range): ChartPoint[] {
  if (snapshots.length === 0) return [];
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const cutoff: Record<Range, number> = {
    "1W":  now - 7  * dayMs,
    "1M":  now - 30 * dayMs,
    "3M":  now - 90 * dayMs,
    "All": 0,
  };

  const filtered = snapshots
    .filter((s) => s.capturedAt >= cutoff[range])
    .sort((a, b) => a.capturedAt - b.capturedAt);

  const byDay: Record<string, Snapshot> = {};
  for (const s of filtered) {
    const dStr = new Date(s.capturedAt).toDateString();
    byDay[dStr] = s;
  }
  const deduped = Object.values(byDay).sort((a, b) => a.capturedAt - b.capturedAt);

  return deduped.map((s) => {
    const { label, month } = formatDate(s.capturedAt);
    return { label, month, value: s.totalValue };
  });
}

function InteractiveChart({ data }: { data: ChartPoint[] }) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  if (data.length === 0) return null;

  const vals   = data.map((d) => d.value);
  const minV   = Math.min(...vals) * 0.98;
  const maxV   = Math.max(...vals) * 1.02;
  const innerW = CHART_W - PAD.left - PAD.right;
  const innerH = CHART_H - PAD.top - PAD.bottom;

  const toX = (i: number) => PAD.left + (data.length <= 1 ? innerW/2 : (i / (data.length - 1)) * innerW);
  const toY = (v: number) => maxV === minV ? PAD.top + innerH/2 : PAD.top + (1 - (v - minV) / (maxV - minV)) * innerH;

  const points = data.map((d, i) => `${toX(i)},${toY(d.value)}`).join(" ");
  const areaPath = data.length < 2 ? "" : 
    `M${toX(0)},${toY(data[0].value)} ` + 
    data.map((d, i) => `L${toX(i)},${toY(d.value)}`).join(" ") + 
    ` L${toX(data.length - 1)},${CHART_H - PAD.bottom} L${toX(0)},${CHART_H - PAD.bottom} Z`;

  const handleTouch = (x: number) => {
    let closest = 0, minDist = Infinity;
    data.forEach((_, i) => {
      const d = Math.abs(toX(i) - x);
      if (d < minDist) { minDist = d; closest = i; }
    });
    setActiveIdx(closest);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder:  () => true,
      onPanResponderGrant:   (e) => handleTouch(e.nativeEvent.locationX),
      onPanResponderMove:    (e) => handleTouch(e.nativeEvent.locationX),
      onPanResponderRelease: ()  => setActiveIdx(null),
    })
  ).current;

  const active = activeIdx !== null ? data[activeIdx] : null;
  const activeX = activeIdx !== null ? toX(activeIdx) : 0;
  const activeY = activeIdx !== null ? toY(active?.value ?? 0) : 0;
  const tooltipW = 120;
  const tooltipLeft = activeX + tooltipW + 10 > CHART_W ? activeX - tooltipW - 10 : activeX + 10;

  return (
    <View style={s.chartContainer} {...panResponder.panHandlers}>
      <Svg width={CHART_W} height={CHART_H}>
        <Defs>
          <LinearGradient id="g" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={C.blue} stopOpacity={0.2} />
            <Stop offset="100%" stopColor={C.blue} stopOpacity={0} />
          </LinearGradient>
        </Defs>
        {areaPath !== "" && <Path d={areaPath} fill="url(#g)" />}
        {data.length >= 2 && <Polyline points={points} fill="none" stroke={C.blue} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" opacity={0.9} />}
        
        {/* X Axis Labels */}
        {data.filter((_,i) => data.length <= 6 || i % Math.floor(data.length/5) === 0).map((d,i) => {
            const idx = data.indexOf(d);
            return (
                <SvgText key={i} x={toX(idx)} y={CHART_H-5} fontSize={10} fill={C.text3} textAnchor="middle">{d.month}</SvgText>
            );
        })}

        {active && (
            <>
                <Line x1={activeX} y1={PAD.top} x2={activeX} y2={CHART_H-PAD.bottom} stroke={C.blue} strokeWidth={1} strokeDasharray="4 4" opacity={0.5} />
                <Circle cx={activeX} cy={activeY} r={6} fill={C.blue} stroke={C.navy} strokeWidth={2} />
                <Rect x={tooltipLeft} y={activeY-20 < 10 ? 10 : activeY-20} width={tooltipW} height={40} rx={8} fill={C.card2} stroke={C.border} />
                <SvgText x={tooltipLeft+tooltipW/2} y={(activeY-20 < 10 ? 10 : activeY-20)+15} fontSize={10} fill={C.text3} textAnchor="middle">{active.label}</SvgText>
                <SvgText x={tooltipLeft+tooltipW/2} y={(activeY-20 < 10 ? 10 : activeY-20)+32} fontSize={12} fontWeight="bold" fill={C.gold} textAnchor="middle">{formatINR(active.value)}</SvgText>
            </>
        )}
      </Svg>
    </View>
  );
}

function LockedState({ onUnlock }: { onUnlock: () => void }) {
    return (
        <View style={s.lockedOverlay}>
            <View style={s.lockedContent}>
                <View style={s.lockIconWrap}>
                    <Lock color={C.blue} size={32} />
                </View>
                <Text style={s.lockedTitle}>Net Worth Timeline is Pro</Text>
                <Text style={s.lockedSub}>Unlock PortfolioLite Pro to visualize your wealth growth over time.</Text>
                <TouchableOpacity style={s.unlockBtn} onPress={onUnlock}>
                    <Text style={s.unlockBtnText}>Go Pro</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

export default function TimelineScreen() {
  const router = useRouter();
  const { isPro } = usePurchases();
  const [range, setRange] = useState<Range>("All");
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getSnapshots(365);
        setSnapshots(data);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const data = filterByRange(snapshots, range);
  const vals = data.map(d => d.value);
  const high = vals.length ? Math.max(...vals) : 0;
  const low  = vals.length ? Math.min(...vals) : 0;

  // Actual period change: last snapshot minus first snapshot (can be negative)
  const firstVal  = vals.length ? vals[0] : 0;
  const lastVal   = vals.length ? vals[vals.length - 1] : 0;
  const growth    = lastVal - firstVal;
  const isGrowthPositive = growth >= 0;
  const growthPct = firstVal > 0 ? Math.abs((growth / firstVal) * 100).toFixed(1) : "0.0";

  // ─── Growth Velocity Logic ────────────────────────────────────
  const velocity = useMemo(() => {
    if (vals.length < 3) return "Neutral";
    const last = vals[vals.length - 1];
    const prev = vals[vals.length - 2];
    const avg  = vals.reduce((a, b) => a + b, 0) / vals.length;
    if (last > prev && last > avg) return "Accelerating";
    if (last < prev) return "Decelerating";
    return "Steady";
  }, [vals]);

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Text style={s.title}>Timeline</Text>
        <TouchableOpacity style={s.infoBtn}>
            <Info color={C.text3} size={20} />
        </TouchableOpacity>
      </View>

      <View style={s.toggleRow}>
        {TOGGLES.map((t) => (
          <TouchableOpacity key={t} style={[s.toggle, range===t && s.toggleActive]} onPress={() => setRange(t)}>
            <Text style={[s.toggleText, range===t && s.toggleTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {!isPro ? (
          <LockedState onUnlock={() => router.push("/paywall")} />
      ) : isLoading ? (
          <View style={s.center}><ActivityIndicator color={C.blue} size="large" /></View>
      ) : data.length < 2 ? (
          <View style={s.empty}>
              <Text style={s.emptyIcon}>📈</Text>
              <Text style={s.emptyTitle}>Building your history</Text>
              <Text style={s.emptySub}>We need at least 2 days of data to show a trend. Keep using the app!</Text>
          </View>
      ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
            <Text style={s.hint}>Touch and drag the chart to explore</Text>
            <InteractiveChart data={data} />
            
            <View style={s.statsRow}>
                <View style={s.statCard}>
                    <Text style={s.statLabel}>ALL-TIME HIGH</Text>
                    <Text style={[s.statValue, { color: C.green }]}>{formatINR(high)}</Text>
                </View>
                <View style={s.statCard}>
                    <Text style={s.statLabel}>VELOCITY</Text>
                    <Text style={[s.statValue, { color: velocity === "Accelerating" ? C.teal : C.text1 }]}>{velocity}</Text>
                </View>
            </View>

            <View style={s.growthCard}>
                <View style={s.growthHeader}>
                    <Text style={s.growthLabel}>PERIOD GROWTH</Text>
                    <View style={s.growthBadge}>
                        <Text style={s.growthBadgeText}>PRO INSIGHT</Text>
                    </View>
                </View>
                <View style={s.growthRow}>
                    <Text style={[s.growthValue, { color: isGrowthPositive ? C.green : "#EF4444" }]}>
                        {isGrowthPositive ? "+" : "-"}{formatINR(Math.abs(growth))}
                    </Text>
                    <Text style={[s.growthPct, { color: isGrowthPositive ? C.green : "#EF4444" }]}>
                        {isGrowthPositive ? "▲" : "▼"} {growthPct}%
                    </Text>
                </View>
            </View>
          </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:             { flex: 1, backgroundColor: C.navy },
  header:           { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 18, paddingVertical: 14 },
  title:            { fontSize: 22, fontWeight: "800", color: C.text1 },
  infoBtn:          { padding: 4 },
  toggleRow:        { flexDirection: "row", gap: 10, paddingHorizontal: 18, marginBottom: 16 },
  toggle:           { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20, backgroundColor: C.card, borderWidth: 1, borderColor: C.border },
  toggleActive:     { backgroundColor: C.blue, borderColor: C.blue },
  toggleText:       { fontSize: 13, color: C.text2, fontWeight: "500" },
  toggleTextActive: { color: "#fff", fontWeight: "700" },
  scroll:           { paddingBottom: 40 },
  hint:             { fontSize: 11, color: C.text3, paddingHorizontal: 18, marginBottom: 10, fontStyle: "italic" },
  chartContainer:   { marginHorizontal: 18, backgroundColor: C.card, borderRadius: 20, padding: 4, borderWidth: 1, borderColor: C.border, marginBottom: 20 },
  statsRow:         { flexDirection: "row", gap: 12, paddingHorizontal: 18, marginBottom: 12 },
  statCard:         { flex: 1, backgroundColor: C.card, borderRadius: 16, padding: 18, borderWidth: 1, borderColor: C.border },
  statLabel:        { fontSize: 10, color: C.text3, letterSpacing: 1, marginBottom: 4 },
  statValue:        { fontSize: 16, fontWeight: "800", color: C.text1 },
  growthCard:       { marginHorizontal: 18, backgroundColor: C.card, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: C.border },
  growthLabel:      { fontSize: 10, color: C.text3, letterSpacing: 1 },
  growthHeader:     { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  growthBadge:      { backgroundColor: "rgba(59,130,246,0.1)", borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  growthBadgeText:  { fontSize: 8, fontWeight: "800", color: C.blue },
  growthRow:        { flexDirection: "row", alignItems: "baseline", gap: 10 },
  growthValue:      { fontSize: 28, fontWeight: "900", color: C.green },
  growthPct:        { fontSize: 14, color: C.green, fontWeight: "700" },
  center:           { flex: 1, justifyContent: "center", alignItems: "center" },
  empty:            { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 40 },
  emptyIcon:        { fontSize: 60, marginBottom: 20 },
  emptyTitle:       { fontSize: 20, fontWeight: "800", color: C.text1, marginBottom: 10 },
  emptySub:         { fontSize: 14, color: C.text3, textAlign: "center", lineHeight: 22 },
  lockedOverlay:    { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 30 },
  lockedContent:    { alignItems: "center" },
  lockIconWrap:     { width: 80, height: 80, borderRadius: 40, backgroundColor: "rgba(59,130,246,0.1)", alignItems: "center", justifyContent: "center", marginBottom: 24 },
  lockedTitle:      { fontSize: 22, fontWeight: "800", color: C.text1, marginBottom: 12, textAlign: "center" },
  lockedSub:        { fontSize: 14, color: C.text3, textAlign: "center", lineHeight: 22, marginBottom: 30 },
  unlockBtn:        { backgroundColor: C.teal, paddingVertical: 14, paddingHorizontal: 40, borderRadius: 14 },
  unlockBtnText:    { fontSize: 15, fontWeight: "800", color: "#0A0F1E" },
});
