// import {
//   View, Text, ScrollView, TouchableOpacity, StyleSheet,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { useRouter } from "expo-router";
// import {
//   TrendingUp, Circle, Landmark, BarChart2,
//   Plus, Lock, Shield, ChevronRight,
// } from "lucide-react-native";
// import Svg, { Circle as SvgCircle } from "react-native-svg";

// const C = {
//   navy:"#0A0F1E", card:"#111827", card2:"#1a2236",
//   teal:"#00D4B4", blue:"#3B82F6", gold:"#F5A623",
//   green:"#22C55E", orange:"#F97316", text1:"#F1F5F9",
//   text2:"#94A3B8", text3:"#64748B",
//   border:"rgba(255,255,255,0.07)",
// };

// const MOCK_ASSETS = [
//   { id:"1", name:"HDFC Flexi Cap SIP",  type:"mutual_fund", currentValue:594000 },
//   { id:"2", name:"Digital Gold",         type:"gold",        currentValue:371800 },
//   { id:"3", name:"SBI Fixed Deposit",    type:"fd",          currentValue:297350 },
// ];

// const ALLOCATION = [
//   { label:"Mutual Funds", pct:40, color:C.teal   },
//   { label:"Gold",         pct:25, color:C.gold   },
//   { label:"FD",           pct:20, color:C.blue   },
//   { label:"Stocks",       pct:15, color:C.orange },
// ];

// const NET_WORTH = 1487350;

// function formatINR(n: number) {
//   return "₹" + n.toLocaleString("en-IN");
// }

// function DonutChart() {
//   const r = 36, cx = 48, cy = 48, stroke = 12;
//   const circ = 2 * Math.PI * r;
//   let used = 0;
//   return (
//     <Svg width={96} height={96} viewBox="0 0 96 96">
//       <SvgCircle cx={cx} cy={cy} r={r} fill="none" stroke={C.card2} strokeWidth={stroke} />
//       {ALLOCATION.map((seg) => {
//         const dash   = (seg.pct / 100) * circ;
//         const offset = circ * 0.25 - (used / 100) * circ;
//         used += seg.pct;
//         return (
//           <SvgCircle
//             key={seg.label} cx={cx} cy={cy} r={r}
//             fill="none" stroke={seg.color}
//             strokeWidth={stroke - 1}
//             strokeDasharray={`${dash} ${circ - dash}`}
//             strokeDashoffset={offset}
//             strokeLinecap="round"
//           />
//         );
//       })}
//     </Svg>
//   );
// }

// function AssetIcon({ type }: { type: string }) {
//   const sz = 18;
//   if (type === "mutual_fund") return <TrendingUp color={C.teal}  size={sz} />;
//   if (type === "gold")        return <Circle     color={C.gold}  size={sz} />;
//   if (type === "fd")          return <Landmark   color={C.green} size={sz} />;
//   return <BarChart2 color={C.blue} size={sz} />;
// }

// export default function HomeScreen() {
//   const router = useRouter();
//   return (
//     <SafeAreaView style={s.safe}>
//       {/* Header */}
//       <View style={s.header}>
//         <Text style={s.headerTitle}>PortfolioLite</Text>
//         <TouchableOpacity>
//             <Lock color={C.text3} size={18} />
//         </TouchableOpacity>
//       </View>

//       <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

//         {/* Net Worth Card */}
//         <View style={s.nwCard}>
//           <View style={s.zeroBadge}>
//             <Shield color={C.teal} size={12} />
//             <Text style={s.zeroText}>Zero Cloud · All data on device</Text>
//           </View>
//           <Text style={s.nwLabel}>TOTAL NET WORTH</Text>
//           <Text style={s.nwAmount}>{formatINR(NET_WORTH)}</Text>
//           <Text style={s.nwChange}>▲ ₹23,400 this month</Text>
//         </View>

//         {/* Allocation — tap to open Timeline */}
//         <TouchableOpacity style={s.allocCard} onPress={() => router.push("/timeline")} activeOpacity={0.85}>
//           <DonutChart />
//           <View style={s.legend}>
//             {ALLOCATION.map((a) => (
//               <View key={a.label} style={s.legendRow}>
//                 <View style={[s.dot, { backgroundColor: a.color }]} />
//                 <Text style={s.legendText}>{a.label}</Text>
//                 <Text style={s.legendPct}>{a.pct}%</Text>
//               </View>
//             ))}
//           </View>
//           <ChevronRight color={C.text3} size={16} style={{ alignSelf:"center" }} />
//         </TouchableOpacity>
//         <Text style={s.tapHint}>Tap chart to view net worth history</Text>

//         {/* Asset list */}
//         <Text style={s.sectionLabel}>YOUR ASSETS</Text>
//         {MOCK_ASSETS.map((a) => (
//           <View key={a.id} style={s.assetRow}>
//             <View style={s.assetIconWrap}>
//               <AssetIcon type={a.type} />
//             </View>
//             <Text style={s.assetName}>{a.name}</Text>
//             <Text style={s.assetValue}>{formatINR(a.currentValue)}</Text>
//           </View>
//         ))}

//         <TouchableOpacity style={s.viewAll} onPress={() => router.push("/holdings")}>
//           <Text style={s.viewAllText}>View all assets →</Text>
//         </TouchableOpacity>
//       </ScrollView>

//       {/* FAB */}
//       <TouchableOpacity style={s.fab} onPress={() => router.push("/add-asset")}>
//         <Plus color="#0A0F1E" size={28} strokeWidth={2.5} />
//       </TouchableOpacity>
//     </SafeAreaView>
//   );
// }

// const s = StyleSheet.create({
//   safe:         { flex:1, backgroundColor:C.navy },
//   header:       { flexDirection:"row", justifyContent:"space-between", alignItems:"center", paddingHorizontal:18, paddingVertical:12 },
//   headerTitle:  { fontSize:18, fontWeight:"700", color:C.text1, letterSpacing:-0.3 },
//   scroll:       { paddingBottom:110 },
//   nwCard:       { margin:18, marginBottom:14, backgroundColor:C.card, borderRadius:16, padding:20, borderWidth:1, borderColor:C.border },
//   zeroBadge:    { flexDirection:"row", alignItems:"center", gap:5, marginBottom:12 },
//   zeroText:     { fontSize:11, color:C.teal, fontWeight:"500" },
//   nwLabel:      { fontSize:11, letterSpacing:1.5, color:C.text3, textTransform:"uppercase", marginBottom:6 },
//   nwAmount:     { fontSize:38, fontWeight:"800", color:C.text1, letterSpacing:-1, marginBottom:4 },
//   nwChange:     { fontSize:13, color:C.green },
//   allocCard:    { marginHorizontal:18, marginBottom:4, backgroundColor:C.card, borderRadius:16, padding:14, borderWidth:1, borderColor:C.border, flexDirection:"row", alignItems:"center", gap:12 },
//   legend:       { flex:1, gap:10 },
//   legendRow:    { flexDirection:"row", alignItems:"center", gap:8 },
//   dot:          { width:8, height:8, borderRadius:4 },
//   legendText:   { flex:1, fontSize:12, color:C.text2 },
//   legendPct:    { fontSize:12, color:C.text3 },
//   tapHint:      { textAlign:"center", fontSize:11, color:C.text3, marginBottom:12, marginTop:4 },
//   sectionLabel: { fontSize:11, fontWeight:"600", letterSpacing:1, color:C.text3, textTransform:"uppercase", paddingHorizontal:18, paddingTop:4, paddingBottom:6 },
//   assetRow:     { flexDirection:"row", alignItems:"center", gap:12, paddingHorizontal:18, paddingVertical:13, borderBottomWidth:1, borderBottomColor:C.border },
//   assetIconWrap:{ width:38, height:38, borderRadius:10, backgroundColor:C.card2, alignItems:"center", justifyContent:"center" },
//   assetName:    { flex:1, fontSize:14, color:C.text1, fontWeight:"500" },
//   assetValue:   { fontSize:15, fontWeight:"700", color:C.gold },
//   viewAll:      { alignItems:"center", paddingVertical:18 },
//   viewAllText:  { fontSize:13, color:C.blue },
//   fab:          { position:"absolute", bottom:82, right:18, width:54, height:54, borderRadius:27, backgroundColor:C.teal, alignItems:"center", justifyContent:"center", elevation:8 },
// });








import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  TrendingUp, Circle, Landmark, BarChart2,
  Plus, Lock, Shield, ChevronRight, LineChart,
  Zap, Home, Wallet,
} from "lucide-react-native";
import Svg, { Circle as SvgCircle } from "react-native-svg";
import { useAssets, formatINR, AllocationItem } from ".../../src/hooks/useAssets";
import { Asset, AssetType } from "../../src/db/database";

const C = {
  navy: "#0A0F1E", card: "#111827", card2: "#1a2236",
  teal: "#00D4B4", blue: "#3B82F6", gold: "#F5A623",
  green: "#22C55E", text1: "#F1F5F9", text2: "#94A3B8",
  text3: "#64748B", border: "rgba(255,255,255,0.07)",
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
  const { assets, isLoading, netWorth, allocation } = useAssets();

  if (isLoading) {
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
        <Text style={s.headerTitle}>PortfolioLite</Text>
        <TouchableOpacity>
          <Lock color={C.text3} size={18} />
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
            <Text style={s.zeroText}>Zero Cloud · All data on your device</Text>
          </View>
          <Text style={s.nwLabel}>TOTAL NET WORTH</Text>
          <Text style={s.nwAmount}>{formatINR(netWorth)}</Text>
          {netWorth > 0 && (
            <Text style={s.nwSub}>{assets.length} asset{assets.length !== 1 ? "s" : ""} tracked</Text>
          )}
        </View>

        {assets.length === 0 ? (
          <EmptyState onAdd={() => router.push("/add-asset")} />
        ) : (
          <>
            {/* Allocation chart */}
            {allocation.length > 0 && (
              <View style={s.allocCard}>
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
            )}

            {/* Timeline button */}
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

            {/* Assets list */}
            <Text style={s.sectionLabel}>YOUR ASSETS</Text>
            {assets.slice(0, 5).map((a: Asset) => (
              <View key={a.id} style={s.assetRow}>
                <View style={s.assetIconWrap}>
                  <AssetIcon type={a.type} />
                </View>
                <Text style={s.assetName}>{a.name}</Text>
                <Text style={s.assetValue}>
                  {formatINR(a.quantity * a.currentPrice)}
                </Text>
              </View>
            ))}

            {assets.length > 5 && (
              <TouchableOpacity
                style={s.viewAll}
                onPress={() => router.push("/holdings")}
              >
                <Text style={s.viewAllText}>
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
  header:          { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 18, paddingVertical: 12 },
  headerTitle:     { fontSize: 18, fontWeight: "700", color: C.text1, letterSpacing: -0.3 },
  scroll:          { paddingBottom: 110 },

  nwCard:          { margin: 18, marginBottom: 14, backgroundColor: C.card, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: C.border },
  zeroBadge:       { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 12 },
  zeroText:        { fontSize: 11, color: C.teal, fontWeight: "500" },
  nwLabel:         { fontSize: 11, letterSpacing: 1.5, color: C.text3, textTransform: "uppercase", marginBottom: 6 },
  nwAmount:        { fontSize: 38, fontWeight: "800", color: C.text1, letterSpacing: -1, marginBottom: 4 },
  nwSub:           { fontSize: 13, color: C.text3 },

  allocCard:       { marginHorizontal: 18, marginBottom: 14, backgroundColor: C.card, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: C.border, flexDirection: "row", alignItems: "center", gap: 12 },
  legend:          { flex: 1, gap: 10 },
  legendRow:       { flexDirection: "row", alignItems: "center", gap: 8 },
  dot:             { width: 8, height: 8, borderRadius: 4 },
  legendText:      { flex: 1, fontSize: 12, color: C.text2 },
  legendPct:       { fontSize: 12, color: C.text3 },

  timelineBtn:     { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginHorizontal: 18, marginBottom: 14, backgroundColor: C.card, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 13, borderWidth: 1, borderColor: C.border },
  timelineBtnLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  timelineBtnText: { fontSize: 14, color: C.text1, fontWeight: "500" },

  sectionLabel:    { fontSize: 11, fontWeight: "600", letterSpacing: 1, color: C.text3, textTransform: "uppercase", paddingHorizontal: 18, paddingTop: 4, paddingBottom: 6 },
  assetRow:        { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 18, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: C.border },
  assetIconWrap:   { width: 38, height: 38, borderRadius: 10, backgroundColor: C.card2, alignItems: "center", justifyContent: "center" },
  assetName:       { flex: 1, fontSize: 14, color: C.text1, fontWeight: "500" },
  assetValue:      { fontSize: 15, fontWeight: "700", color: C.gold },

  viewAll:         { alignItems: "center", paddingVertical: 18 },
  viewAllText:     { fontSize: 13, color: C.blue },

  fab:             { position: "absolute", bottom: 82, right: 18, width: 54, height: 54, borderRadius: 27, backgroundColor: C.teal, alignItems: "center", justifyContent: "center", elevation: 8 },

  emptyWrap:       { alignItems: "center", paddingTop: 40, paddingHorizontal: 32 },
  emptyIcon:       { fontSize: 48, marginBottom: 16 },
  emptyTitle:      { fontSize: 20, fontWeight: "700", color: C.text1, marginBottom: 8 },
  emptySub:        { fontSize: 14, color: C.text3, textAlign: "center", lineHeight: 22, marginBottom: 28 },
  emptyBtn:        { paddingVertical: 14, paddingHorizontal: 32, backgroundColor: C.teal, borderRadius: 12 },
  emptyBtnText:    { fontSize: 15, fontWeight: "700", color: "#0A0F1E" },
});