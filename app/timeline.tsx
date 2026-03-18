import {
  View, Text, TouchableOpacity, StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { X } from "lucide-react-native";
import { useState } from "react";
import Svg, { Polyline, Circle, Rect, Text as SvgText } from "react-native-svg";

const C = {
  navy: "#0A0F1E", card: "#111827", card2: "#1a2236",
  blue: "#3B82F6", green: "#22C55E",
  text1: "#F1F5F9", text2: "#94A3B8", text3: "#64748B",
  border: "rgba(255,255,255,0.07)",
};

const TOGGLES = ["3M", "6M", "1Y", "All"];

/* Mock data points — replaced with real snapshots in step 07 */
const POINTS = [
  { month: "Oct", value: 1120000 },
  { month: "Nov", value: 1198000 },
  { month: "Dec", value: 1245000 },
  { month: "Jan", value: 1310000 },
  { month: "Feb", value: 1420000 },
  { month: "Mar", value: 1487350 },
];

function formatINR(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}

function MiniChart() {
  const W = 320, H = 140;
  const vals = POINTS.map((p) => p.value);
  const min = Math.min(...vals) * 0.98;
  const max = Math.max(...vals) * 1.01;
  const toY = (v: number) => H - 16 - ((v - min) / (max - min)) * (H - 32);
  const toX = (i: number) => 20 + (i / (POINTS.length - 1)) * (W - 40);

  const pts = POINTS.map((p, i) => `${toX(i)},${toY(p.value)}`).join(" ");

  return (
    <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <Polyline points={pts} fill="none" stroke={C.blue} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      {POINTS.map((p, i) => (
        <Circle key={i} cx={toX(i)} cy={toY(p.value)} r={3} fill={C.blue} />
      ))}
      {/* Last point tooltip */}
      <Rect x={toX(5) - 50} y={toY(POINTS[5].value) - 28} width={100} height={22} rx={6} fill={C.card2} />
      <SvgText x={toX(5)} y={toY(POINTS[5].value) - 12} fontSize={11} fill={C.text1} textAnchor="middle">
        ₹14,87,350
      </SvgText>
      {/* X axis labels */}
      {POINTS.map((p, i) => (
        <SvgText key={i} x={toX(i)} y={H - 2} fontSize={10} fill={C.text3} textAnchor="middle">
          {p.month}
        </SvgText>
      ))}
    </Svg>
  );
}

export default function TimelineScreen() {
  const router = useRouter();
  const [active, setActive] = useState("3M");

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.title}>Net Worth History</Text>
        <TouchableOpacity style={s.closeBtn} onPress={() => router.back()}>
          <X color={C.text2} size={18} />
        </TouchableOpacity>
      </View>

      {/* Toggles */}
      <View style={s.toggleRow}>
        {TOGGLES.map((t) => (
          <TouchableOpacity
            key={t}
            style={[s.toggle, active === t && s.toggleActive]}
            onPress={() => setActive(t)}
          >
            <Text style={[s.toggleText, active === t && s.toggleTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Chart */}
      <View style={s.chartCard}>
        <MiniChart />
      </View>

      {/* Stats */}
      <View style={s.statsRow}>
        <View style={s.statCard}>
          <Text style={s.statLabel}>3M HIGH</Text>
          <Text style={[s.statValue, { color: C.green }]}>₹14,87,350</Text>
        </View>
        <View style={s.statCard}>
          <Text style={s.statLabel}>3M LOW</Text>
          <Text style={s.statValue}>₹11,20,000</Text>
        </View>
      </View>

      {/* Growth */}
      <View style={s.growthCard}>
        <Text style={s.growthLabel}>GROWTH THIS PERIOD</Text>
        <Text style={s.growthValue}>+₹3,67,350</Text>
        <Text style={s.growthPct}>+32.7%</Text>
      </View>

      {/* Pro blur overlay note */}
      <View style={s.proNote}>
        <Text style={s.proNoteText}>
          Full history unlocked in Pro · Snapshots saved automatically every time you open the app
        </Text>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:            { flex: 1, backgroundColor: C.navy },
  header:          { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 18, paddingVertical: 14 },
  title:           { fontSize: 18, fontWeight: "700", color: C.text1 },
  closeBtn:        { width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.07)", alignItems: "center", justifyContent: "center" },
  toggleRow:       { flexDirection: "row", gap: 8, paddingHorizontal: 18, marginBottom: 16 },
  toggle:          { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", backgroundColor: C.card },
  toggleActive:    { backgroundColor: C.blue, borderColor: C.blue },
  toggleText:      { fontSize: 13, color: C.text2 },
  toggleTextActive:{ fontSize: 13, color: "#fff", fontWeight: "600" },
  chartCard:       { marginHorizontal: 18, backgroundColor: C.card, borderRadius: 16, padding: 12, borderWidth: 1, borderColor: C.border, marginBottom: 16, alignItems: "center" },
  statsRow:        { flexDirection: "row", gap: 12, paddingHorizontal: 18, marginBottom: 12 },
  statCard:        { flex: 1, backgroundColor: C.card, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: C.border },
  statLabel:       { fontSize: 11, color: C.text3, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 },
  statValue:       { fontSize: 18, fontWeight: "700", color: C.text1 },
  growthCard:      { marginHorizontal: 18, backgroundColor: C.card, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: C.border, marginBottom: 16 },
  growthLabel:     { fontSize: 11, color: C.text3, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 },
  growthValue:     { fontSize: 26, fontWeight: "800", color: C.green },
  growthPct:       { fontSize: 14, color: C.green, marginTop: 2 },
  proNote:         { marginHorizontal: 18, padding: 12, backgroundColor: "rgba(59,130,246,0.08)", borderRadius: 10, borderWidth: 1, borderColor: "rgba(59,130,246,0.15)" },
  proNoteText:     { fontSize: 12, color: C.text2, textAlign: "center", lineHeight: 18 },
});