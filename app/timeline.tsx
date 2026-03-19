// import {
//   View, Text, TouchableOpacity, StyleSheet,
//   PanResponder, Dimensions,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { useRouter } from "expo-router";
// import { X } from "lucide-react-native";
// import { useState, useRef, useCallback } from "react";
// import Svg, {
//   Polyline, Circle, Line, Rect,
//   Text as SvgText, Defs, LinearGradient, Stop, Path,
// } from "react-native-svg";

// const C = {
//   navy: "#0A0F1E", card: "#111827", card2: "#1a2236",
//   blue: "#3B82F6", green: "#22C55E", gold: "#F5A623",
//   text1: "#F1F5F9", text2: "#94A3B8", text3: "#64748B",
//   border: "rgba(255,255,255,0.07)",
// };

// const SCREEN_W = Dimensions.get("window").width;
// const CHART_H = 180;
// const CHART_W = SCREEN_W - 36; // 18px margin each side
// const PAD = { top: 20, bottom: 28, left: 8, right: 8 };

// const ALL_DATA = {
//   "3M": [
//     { month: "Oct",  label: "Oct 2025", value: 1120000 },
//     { month: "Nov",  label: "Nov 2025", value: 1198000 },
//     { month: "Dec",  label: "Dec 2025", value: 1245000 },
//     { month: "Jan",  label: "Jan 2026", value: 1310000 },
//     { month: "Feb",  label: "Feb 2026", value: 1420000 },
//     { month: "Mar",  label: "Mar 2026", value: 1487350 },
//   ],
//   "6M": [
//     { month: "Sep",  label: "Sep 2025", value: 980000  },
//     { month: "Oct",  label: "Oct 2025", value: 1050000 },
//     { month: "Nov",  label: "Nov 2025", value: 1120000 },
//     { month: "Dec",  label: "Dec 2025", value: 1198000 },
//     { month: "Jan",  label: "Jan 2026", value: 1310000 },
//     { month: "Feb",  label: "Feb 2026", value: 1420000 },
//     { month: "Mar",  label: "Mar 2026", value: 1487350 },
//   ],
//   "1Y": [
//     { month: "Apr",  label: "Apr 2025", value: 820000  },
//     { month: "May",  label: "May 2025", value: 870000  },
//     { month: "Jun",  label: "Jun 2025", value: 910000  },
//     { month: "Jul",  label: "Jul 2025", value: 955000  },
//     { month: "Aug",  label: "Aug 2025", value: 990000  },
//     { month: "Sep",  label: "Sep 2025", value: 1040000 },
//     { month: "Oct",  label: "Oct 2025", value: 1120000 },
//     { month: "Nov",  label: "Nov 2025", value: 1198000 },
//     { month: "Dec",  label: "Dec 2025", value: 1245000 },
//     { month: "Jan",  label: "Jan 2026", value: 1310000 },
//     { month: "Feb",  label: "Feb 2026", value: 1420000 },
//     { month: "Mar",  label: "Mar 2026", value: 1487350 },
//   ],
//   "All": [
//     { month: "Jan",  label: "Jan 2025", value: 650000  },
//     { month: "Apr",  label: "Apr 2025", value: 820000  },
//     { month: "Jul",  label: "Jul 2025", value: 955000  },
//     { month: "Oct",  label: "Oct 2025", value: 1120000 },
//     { month: "Jan",  label: "Jan 2026", value: 1310000 },
//     { month: "Mar",  label: "Mar 2026", value: 1487350 },
//   ],
// };

// const TOGGLES = ["3M", "6M", "1Y", "All"] as const;
// type Range = typeof TOGGLES[number];

// function formatINR(n: number) {
//   return "\u20B9" + n.toLocaleString("en-IN");
// }

// // ── Interactive Chart ──────────────────────────────────────────────
// function InteractiveChart({ data }: { data: typeof ALL_DATA["3M"] }) {
//   const [activeIdx, setActiveIdx] = useState<number | null>(null);
//   const chartRef = useRef<View>(null);

//   const vals  = data.map((d) => d.value);
//   const minV  = Math.min(...vals) * 0.97;
//   const maxV  = Math.max(...vals) * 1.01;
//   const innerW = CHART_W - PAD.left - PAD.right;
//   const innerH = CHART_H - PAD.top - PAD.bottom;

//   const toX = (i: number) =>
//     PAD.left + (i / (data.length - 1)) * innerW;
//   const toY = (v: number) =>
//     PAD.top + (1 - (v - minV) / (maxV - minV)) * innerH;

//   // Build polyline points string
//   const points = data.map((d, i) => `${toX(i)},${toY(d.value)}`).join(" ");

//   // Build filled area path
//   const areaPath =
//     `M${toX(0)},${toY(data[0].value)} ` +
//     data.map((d, i) => `L${toX(i)},${toY(d.value)}`).join(" ") +
//     ` L${toX(data.length - 1)},${CHART_H - PAD.bottom}` +
//     ` L${toX(0)},${CHART_H - PAD.bottom} Z`;

//   // Pan responder handles touch + drag
//   const panResponder = useRef(
//     PanResponder.create({
//       onStartShouldSetPanResponder: () => true,
//       onMoveShouldSetPanResponder:  () => true,
//       onPanResponderGrant: (evt) => handleTouch(evt.nativeEvent.locationX),
//       onPanResponderMove: (evt)  => handleTouch(evt.nativeEvent.locationX),
//       onPanResponderRelease: ()  => setActiveIdx(null),
//       onPanResponderTerminate: () => setActiveIdx(null),
//     })
//   ).current;

//   const handleTouch = useCallback(
//     (x: number) => {
//       // Find closest data point to touch x position
//       let closest = 0;
//       let minDist = Infinity;
//       data.forEach((_, i) => {
//         const dist = Math.abs(toX(i) - x);
//         if (dist < minDist) { minDist = dist; closest = i; }
//       });
//       setActiveIdx(closest);
//     },
//     [data]
//   );

//   const active = activeIdx !== null ? data[activeIdx] : null;
//   const activeX = activeIdx !== null ? toX(activeIdx) : null;
//   const activeY = activeIdx !== null ? toY(data[activeIdx].value) : null;

//   // Tooltip: flip to left side if too close to right edge
//   const tooltipW = 110;
//   const tooltipLeft =
//     activeX !== null
//       ? activeX + tooltipW + 8 > CHART_W
//         ? activeX - tooltipW - 6
//         : activeX + 6
//       : 0;

//   return (
//     <View
//       style={s.chartWrap}
//       {...panResponder.panHandlers}
//     >
//       <Svg width={CHART_W} height={CHART_H}>
//         <Defs>
//           <LinearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
//             <Stop offset="0%"   stopColor={C.blue} stopOpacity={0.25} />
//             <Stop offset="100%" stopColor={C.blue} stopOpacity={0}    />
//           </LinearGradient>
//         </Defs>

//         {/* Filled area */}
//         <Path d={areaPath} fill="url(#areaGrad)" />

//         {/* Line */}
//         <Polyline
//           points={points}
//           fill="none"
//           stroke={C.blue}
//           strokeWidth={2.5}
//           strokeLinecap="round"
//           strokeLinejoin="round"
//         />

//         {/* X-axis labels */}
//         {data.map((d, i) => (
//           <SvgText
//             key={i}
//             x={toX(i)}
//             y={CHART_H - 4}
//             fontSize={9}
//             fill={C.text3}
//             textAnchor="middle"
//           >
//             {d.month}
//           </SvgText>
//         ))}

//         {/* ── Crosshair (shown only when touching) ── */}
//         {active && activeX !== null && activeY !== null && (
//           <>
//             {/* Vertical dashed line */}
//             <Line
//               x1={activeX} y1={PAD.top}
//               x2={activeX} y2={CHART_H - PAD.bottom}
//               stroke={C.blue}
//               strokeWidth={1}
//               strokeDasharray="4 3"
//               opacity={0.8}
//             />

//             {/* Dot on line */}
//             <Circle
//               cx={activeX} cy={activeY}
//               r={5}
//               fill={C.blue}
//               stroke={C.navy}
//               strokeWidth={2}
//             />

//             {/* Tooltip box */}
//             <Rect
//               x={tooltipLeft}
//               y={activeY - 28 < PAD.top ? PAD.top : activeY - 28}
//               width={tooltipW}
//               height={44}
//               rx={8}
//               fill={C.card2}
//               stroke="rgba(59,130,246,0.4)"
//               strokeWidth={1}
//             />
//             <SvgText
//               x={tooltipLeft + tooltipW / 2}
//               y={(activeY - 28 < PAD.top ? PAD.top : activeY - 28) + 16}
//               fontSize={10}
//               fill={C.text3}
//               textAnchor="middle"
//             >
//               {active.label}
//             </SvgText>
//             <SvgText
//               x={tooltipLeft + tooltipW / 2}
//               y={(activeY - 28 < PAD.top ? PAD.top : activeY - 28) + 32}
//               fontSize={12}
//               fontWeight="bold"
//               fill={C.gold}
//               textAnchor="middle"
//             >
//               {formatINR(active.value)}
//             </SvgText>
//           </>
//         )}

//         {/* End dot when no touch active */}
//         {activeIdx === null && (
//           <Circle
//             cx={toX(data.length - 1)}
//             cy={toY(data[data.length - 1].value)}
//             r={4}
//             fill={C.blue}
//           />
//         )}
//       </Svg>
//     </View>
//   );
// }

// // ── Main Screen ────────────────────────────────────────────────────
// export default function TimelineScreen() {
//   const router = useRouter();
//   const [range, setRange] = useState<Range>("3M");
//   const data = ALL_DATA[range];

//   const vals   = data.map((d) => d.value);
//   const high   = Math.max(...vals);
//   const low    = Math.min(...vals);
//   const growth = high - low;
//   const growthPct = ((growth / low) * 100).toFixed(1);

//   return (
//     <SafeAreaView style={s.safe}>
//       {/* Header */}
//       <View style={s.header}>
//         <Text style={s.title}>Net Worth History</Text>
//         <TouchableOpacity style={s.closeBtn} onPress={() => router.back()}>
//           <X color={C.text2} size={18} />
//         </TouchableOpacity>
//       </View>

//       {/* Range toggles */}
//       <View style={s.toggleRow}>
//         {TOGGLES.map((t) => (
//           <TouchableOpacity
//             key={t}
//             style={[s.toggle, range === t && s.toggleActive]}
//             onPress={() => setRange(t)}
//           >
//             <Text style={[s.toggleText, range === t && s.toggleTextActive]}>
//               {t}
//             </Text>
//           </TouchableOpacity>
//         ))}
//       </View>

//       {/* Hint */}
//       <Text style={s.hint}>Touch and drag the chart to see values</Text>

//       {/* Interactive Chart */}
//       <InteractiveChart data={data} />

//       {/* Stats */}
//       <View style={s.statsRow}>
//         <View style={s.statCard}>
//           <Text style={s.statLabel}>HIGH</Text>
//           <Text style={[s.statValue, { color: C.green }]}>{formatINR(high)}</Text>
//         </View>
//         <View style={s.statCard}>
//           <Text style={s.statLabel}>LOW</Text>
//           <Text style={s.statValue}>{formatINR(low)}</Text>
//         </View>
//       </View>

//       {/* Growth */}
//       <View style={s.growthCard}>
//         <Text style={s.growthLabel}>GROWTH THIS PERIOD</Text>
//         <Text style={s.growthValue}>+{formatINR(growth)}</Text>
//         <Text style={s.growthPct}>+{growthPct}%</Text>
//       </View>
//     </SafeAreaView>
//   );
// }

// const s = StyleSheet.create({
//   safe:             { flex: 1, backgroundColor: C.navy },
//   header:           { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 18, paddingTop: 14, paddingBottom: 8 },
//   title:            { fontSize: 18, fontWeight: "700", color: C.text1 },
//   closeBtn:         { width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.07)", alignItems: "center", justifyContent: "center" },
//   toggleRow:        { flexDirection: "row", gap: 8, paddingHorizontal: 18, marginBottom: 4 },
//   toggle:           { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", backgroundColor: C.card },
//   toggleActive:     { backgroundColor: C.blue, borderColor: C.blue },
//   toggleText:       { fontSize: 13, color: C.text2 },
//   toggleTextActive: { fontSize: 13, color: "#fff", fontWeight: "600" },
//   hint:             { fontSize: 11, color: C.text3, paddingHorizontal: 18, marginBottom: 6, fontStyle: "italic" },
//   chartWrap:        { marginHorizontal: 18, backgroundColor: C.card, borderRadius: 16, paddingTop: 4, borderWidth: 1, borderColor: C.border, marginBottom: 16 },
//   statsRow:         { flexDirection: "row", gap: 12, paddingHorizontal: 18, marginBottom: 12 },
//   statCard:         { flex: 1, backgroundColor: C.card, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: C.border },
//   statLabel:        { fontSize: 11, color: C.text3, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 },
//   statValue:        { fontSize: 16, fontWeight: "700", color: C.text1 },
//   growthCard:       { marginHorizontal: 18, backgroundColor: C.card, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: C.border },
//   growthLabel:      { fontSize: 11, color: C.text3, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 },
//   growthValue:      { fontSize: 26, fontWeight: "800", color: C.green },
//   growthPct:        { fontSize: 14, color: C.green, marginTop: 2 },
// });

















import {
  View, Text, TouchableOpacity, StyleSheet,
  PanResponder, Dimensions, ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { X } from "lucide-react-native";
import { useState, useRef, useCallback, useEffect } from "react";
import Svg, {
  Polyline, Circle, Line, Rect,
  Text as SvgText, Defs, LinearGradient, Stop, Path,
} from "react-native-svg";
import { getSnapshots, Snapshot } from "../src/db/database";
import { useAssets, formatINR } from "../src/hooks/useAssets";

const C = {
  navy: "#0A0F1E", card: "#111827", card2: "#1a2236",
  blue: "#3B82F6", green: "#22C55E", gold: "#F5A623",
  text1: "#F1F5F9", text2: "#94A3B8", text3: "#64748B",
  border: "rgba(255,255,255,0.07)",
};

const SCREEN_W = Dimensions.get("window").width;
const CHART_H  = 180;
const CHART_W  = SCREEN_W - 36;
const PAD      = { top: 20, bottom: 28, left: 8, right: 8 };

const TOGGLES  = ["1W", "1M", "3M", "All"] as const;
type Range     = typeof TOGGLES[number];

// ─── Snapshot → chart point ───────────────────────────────────────

interface ChartPoint {
  label: string;   // tooltip text  e.g. "15 Jan"
  month: string;   // x-axis label  e.g. "Jan"
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

  const now    = Date.now();
  const cutoff: Record<Range, number> = {
    "1W":  now - 7  * 24 * 60 * 60 * 1000,
    "1M":  now - 30 * 24 * 60 * 60 * 1000,
    "3M":  now - 90 * 24 * 60 * 60 * 1000,
    "All": 0,
  };

  // Filter and sort oldest → newest
  const filtered = snapshots
    .filter((s) => s.capturedAt >= cutoff[range])
    .sort((a, b) => a.capturedAt - b.capturedAt);

  // Deduplicate: keep one snapshot per day (latest that day)
  const byDay: Record<string, Snapshot> = {};
  for (const s of filtered) {
    const day = new Date(s.capturedAt).toDateString();
    byDay[day] = s; // later ones overwrite earlier ones same day
  }

  const deduped = Object.values(byDay).sort((a, b) => a.capturedAt - b.capturedAt);

  return deduped.map((s) => {
    const { label, month } = formatDate(s.capturedAt);
    return { label, month, value: s.totalValue };
  });
}

// ─── Interactive chart ────────────────────────────────────────────

function InteractiveChart({ data }: { data: ChartPoint[] }) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  const vals   = data.map((d) => d.value);
  const minV   = Math.min(...vals) * 0.97;
  const maxV   = Math.max(...vals) * 1.01;
  const innerW = CHART_W - PAD.left - PAD.right;
  const innerH = CHART_H - PAD.top - PAD.bottom;

  const toX = (i: number) =>
    PAD.left + (data.length === 1 ? innerW / 2 : (i / (data.length - 1)) * innerW);
  const toY = (v: number) =>
    maxV === minV
      ? PAD.top + innerH / 2
      : PAD.top + (1 - (v - minV) / (maxV - minV)) * innerH;

  const points = data.map((d, i) => `${toX(i)},${toY(d.value)}`).join(" ");

  const areaPath =
    data.length < 2
      ? ""
      : `M${toX(0)},${toY(data[0].value)} ` +
        data.map((d, i) => `L${toX(i)},${toY(d.value)}`).join(" ") +
        ` L${toX(data.length - 1)},${CHART_H - PAD.bottom}` +
        ` L${toX(0)},${CHART_H - PAD.bottom} Z`;

  const handleTouch = useCallback(
    (x: number) => {
      let closest = 0, minDist = Infinity;
      data.forEach((_, i) => {
        const dist = Math.abs(toX(i) - x);
        if (dist < minDist) { minDist = dist; closest = i; }
      });
      setActiveIdx(closest);
    },
    [data]
  );

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder:  () => true,
      onPanResponderGrant:   (e) => handleTouch(e.nativeEvent.locationX),
      onPanResponderMove:    (e) => handleTouch(e.nativeEvent.locationX),
      onPanResponderRelease: ()  => setActiveIdx(null),
      onPanResponderTerminate: () => setActiveIdx(null),
    })
  ).current;

  const active  = activeIdx !== null ? data[activeIdx]      : null;
  const activeX = activeIdx !== null ? toX(activeIdx)       : null;
  const activeY = activeIdx !== null ? toY(data[activeIdx].value) : null;
  const tooltipW = 120;
  const tooltipLeft =
    activeX !== null
      ? activeX + tooltipW + 8 > CHART_W
        ? activeX - tooltipW - 6
        : activeX + 6
      : 0;

  return (
    <View style={s.chartWrap} {...panResponder.panHandlers}>
      <Svg width={CHART_W} height={CHART_H}>
        <Defs>
          <LinearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%"   stopColor={C.blue} stopOpacity={0.25} />
            <Stop offset="100%" stopColor={C.blue} stopOpacity={0}    />
          </LinearGradient>
        </Defs>

        {/* Filled area */}
        {areaPath !== "" && <Path d={areaPath} fill="url(#ag)" />}

        {/* Line */}
        {data.length >= 2 && (
          <Polyline
            points={points}
            fill="none"
            stroke={C.blue}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* X-axis labels — show max 6 evenly spaced */}
        {data
          .filter((_, i) => {
            if (data.length <= 6) return true;
            const step = Math.floor(data.length / 5);
            return i % step === 0 || i === data.length - 1;
          })
          .map((d, _, arr) => {
            const origIdx = data.indexOf(d);
            return (
              <SvgText
                key={origIdx}
                x={toX(origIdx)}
                y={CHART_H - 4}
                fontSize={9}
                fill={C.text3}
                textAnchor="middle"
              >
                {d.month}
              </SvgText>
            );
          })}

        {/* Crosshair */}
        {active && activeX !== null && activeY !== null && (
          <>
            <Line
              x1={activeX} y1={PAD.top}
              x2={activeX} y2={CHART_H - PAD.bottom}
              stroke={C.blue} strokeWidth={1}
              strokeDasharray="4 3" opacity={0.8}
            />
            <Circle
              cx={activeX} cy={activeY} r={5}
              fill={C.blue} stroke={C.navy} strokeWidth={2}
            />
            <Rect
              x={tooltipLeft}
              y={activeY - 28 < PAD.top ? PAD.top : activeY - 28}
              width={tooltipW} height={44}
              rx={8} fill={C.card2}
              stroke="rgba(59,130,246,0.4)" strokeWidth={1}
            />
            <SvgText
              x={tooltipLeft + tooltipW / 2}
              y={(activeY - 28 < PAD.top ? PAD.top : activeY - 28) + 16}
              fontSize={10} fill={C.text3} textAnchor="middle"
            >
              {active.label}
            </SvgText>
            <SvgText
              x={tooltipLeft + tooltipW / 2}
              y={(activeY - 28 < PAD.top ? PAD.top : activeY - 28) + 32}
              fontSize={12} fontWeight="bold"
              fill={C.gold} textAnchor="middle"
            >
              {formatINR(active.value)}
            </SvgText>
          </>
        )}

        {/* End dot when no touch */}
        {activeIdx === null && data.length > 0 && (
          <Circle
            cx={toX(data.length - 1)}
            cy={toY(data[data.length - 1].value)}
            r={4} fill={C.blue}
          />
        )}
      </Svg>
    </View>
  );
}

// ─── Not enough data placeholder ─────────────────────────────────

function NotEnoughData({ netWorth }: { netWorth: number }) {
  return (
    <View style={s.noDataWrap}>
      <Text style={s.noDataIcon}>📈</Text>
      <Text style={s.noDataTitle}>History is building</Text>
      <Text style={s.noDataSub}>
        Your current net worth is{" "}
        <Text style={{ color: C.gold, fontWeight: "700" }}>
          {formatINR(netWorth)}
        </Text>
        {"\n\n"}
        Open the app daily and the timeline will fill in automatically.
        Each visit saves a snapshot of your net worth.
      </Text>
    </View>
  );
}

// ─── Screen ──────────────────────────────────────────────────────

export default function TimelineScreen() {
  const router               = useRouter();
  const { netWorth }         = useAssets();
  const [range, setRange]    = useState<Range>("All");
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load snapshots from SQLite on mount
  useEffect(() => {
    try {
      const data = getSnapshots(200); // fetch up to 200 snapshots
      setSnapshots(data);
    } catch (e) {
      console.error("[Timeline] load error:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const data = filterByRange(snapshots, range);

  const vals   = data.map((d) => d.value);
  const high   = vals.length > 0 ? Math.max(...vals) : 0;
  const low    = vals.length > 0 ? Math.min(...vals) : 0;
  const growth = high - low;
  const growthPct = low > 0 ? ((growth / low) * 100).toFixed(1) : "0.0";

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.title}>Net Worth History</Text>
        <TouchableOpacity style={s.closeBtn} onPress={() => router.back()}>
          <X color={C.text2} size={18} />
        </TouchableOpacity>
      </View>

      {/* Range toggles */}
      <View style={s.toggleRow}>
        {TOGGLES.map((t) => (
          <TouchableOpacity
            key={t}
            style={[s.toggle, range === t && s.toggleActive]}
            onPress={() => setRange(t)}
          >
            <Text style={[s.toggleText, range === t && s.toggleTextActive]}>
              {t}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <View style={s.centerLoader}>
          <ActivityIndicator color={C.blue} size="large" />
        </View>
      ) : data.length < 2 ? (
        <NotEnoughData netWorth={netWorth} />
      ) : (
        <>
          {/* Hint */}
          <Text style={s.hint}>Touch and drag the chart to see values</Text>

          {/* Chart */}
          <InteractiveChart data={data} />

          {/* Stats */}
          <View style={s.statsRow}>
            <View style={s.statCard}>
              <Text style={s.statLabel}>HIGH</Text>
              <Text style={[s.statValue, { color: C.green }]}>
                {formatINR(high)}
              </Text>
            </View>
            <View style={s.statCard}>
              <Text style={s.statLabel}>LOW</Text>
              <Text style={s.statValue}>{formatINR(low)}</Text>
            </View>
          </View>

          {/* Growth */}
          <View style={s.growthCard}>
            <Text style={s.growthLabel}>GROWTH THIS PERIOD</Text>
            <Text style={s.growthValue}>+{formatINR(growth)}</Text>
            <Text style={s.growthPct}>+{growthPct}%</Text>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:             { flex: 1, backgroundColor: C.navy },
  header:           { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 18, paddingTop: 14, paddingBottom: 8 },
  title:            { fontSize: 18, fontWeight: "700", color: C.text1 },
  closeBtn:         { width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.07)", alignItems: "center", justifyContent: "center" },
  toggleRow:        { flexDirection: "row", gap: 8, paddingHorizontal: 18, marginBottom: 4 },
  toggle:           { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", backgroundColor: C.card },
  toggleActive:     { backgroundColor: C.blue, borderColor: C.blue },
  toggleText:       { fontSize: 13, color: C.text2 },
  toggleTextActive: { fontSize: 13, color: "#fff", fontWeight: "600" },
  hint:             { fontSize: 11, color: C.text3, paddingHorizontal: 18, marginBottom: 6, fontStyle: "italic" },
  chartWrap:        { marginHorizontal: 18, backgroundColor: C.card, borderRadius: 16, paddingTop: 4, borderWidth: 1, borderColor: C.border, marginBottom: 16 },
  statsRow:         { flexDirection: "row", gap: 12, paddingHorizontal: 18, marginBottom: 12 },
  statCard:         { flex: 1, backgroundColor: C.card, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: C.border },
  statLabel:        { fontSize: 11, color: C.text3, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 },
  statValue:        { fontSize: 16, fontWeight: "700", color: C.text1 },
  growthCard:       { marginHorizontal: 18, backgroundColor: C.card, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: C.border },
  growthLabel:      { fontSize: 11, color: C.text3, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 },
  growthValue:      { fontSize: 26, fontWeight: "800", color: C.green },
  growthPct:        { fontSize: 14, color: C.green, marginTop: 2 },
  centerLoader:     { flex: 1, alignItems: "center", justifyContent: "center" },
  noDataWrap:       { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 36 },
  noDataIcon:       { fontSize: 48, marginBottom: 16 },
  noDataTitle:      { fontSize: 20, fontWeight: "700", color: C.text1, marginBottom: 12, textAlign: "center" },
  noDataSub:        { fontSize: 14, color: C.text3, textAlign: "center", lineHeight: 22 },
});