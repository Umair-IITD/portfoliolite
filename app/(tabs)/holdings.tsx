// import {
//   View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { useRouter } from "expo-router";
// import {
//   Plus, Search, TrendingUp, Circle, Landmark,
//   BarChart2, Zap, Shield, Home, Wallet, Lock,
// } from "lucide-react-native";

// const C = {
//   navy:"#0A0F1E", card:"#111827", card2:"#1a2236",
//   teal:"#00D4B4", blue:"#3B82F6", gold:"#F5A623",
//   green:"#22C55E", red:"#EF4444", orange:"#F97316",
//   purple:"#A855F7", text1:"#F1F5F9", text2:"#94A3B8",
//   text3:"#64748B", border:"rgba(255,255,255,0.07)",
// };

// const MOCK_HOLDINGS = [
//   { id:"1", name:"HDFC Flexi Cap SIP",  type:"mutual_fund",  value:594000,  pnlPct:18.8, color:C.teal,   locked:false },
//   { id:"2", name:"Nippon ELSS Fund",    type:"mutual_fund",  value:210000,  pnlPct:20.0, color:C.teal,   locked:false },
//   { id:"3", name:"Digital Gold",        type:"gold",         value:371800,  pnlPct:6.2,  color:C.gold,   locked:false },
//   { id:"4", name:"SBI FD — 7.2%",      type:"fd",           value:297350,  pnlPct:18.9, color:C.green,  locked:false },
//   { id:"5", name:"PPF Account",         type:"ppf",          value:180000,  pnlPct:7.1,  color:C.purple, locked:false },
//   { id:"6", name:"Infosys Ltd",         type:"stock",        value:78600,   pnlPct:-4.2, color:C.orange, locked:true  },
//   { id:"7", name:"TCS Ltd",             type:"stock",        value:135600,  pnlPct:12.5, color:C.orange, locked:true  },
// ];

// function typeIcon(type: string) {
//   const sz = 16;
//   switch (type) {
//     case "mutual_fund":  return <TrendingUp color={C.teal}   size={sz} />;
//     case "gold":         return <Circle     color={C.gold}   size={sz} />;
//     case "fd":           return <Landmark   color={C.green}  size={sz} />;
//     case "ppf":          return <Shield     color={C.purple} size={sz} />;
//     case "crypto":       return <Zap        color={C.orange} size={sz} />;
//     case "real_estate":  return <Home       color={C.text3}  size={sz} />;
//     case "cash":         return <Wallet     color={C.text3}  size={sz} />;
//     default:             return <BarChart2  color={C.blue}   size={sz} />;
//   }
// }

// function formatINR(n: number) {
//   return "₹" + n.toLocaleString("en-IN");
// }

// export default function HoldingsScreen() {
//   const router = useRouter();
//   return (
//     <SafeAreaView style={s.safe}>
//       <View style={s.header}>
//         <Text style={s.title}>Holdings</Text>
//         <TouchableOpacity style={s.addBtn} onPress={() => router.push("/add-asset")}>
//           <Plus color={C.teal} size={20} />
//         </TouchableOpacity>
//       </View>

//       <View style={s.searchWrap}>
//         <Search color={C.text3} size={15} />
//         <TextInput style={s.searchInput} placeholder="Search assets…" placeholderTextColor={C.text3} />
//       </View>

//       <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
//         {MOCK_HOLDINGS.map((h) =>
//           h.locked ? (
//             <TouchableOpacity key={h.id} style={s.lockedRow} onPress={() => router.push("/paywall")} activeOpacity={0.8}>
//               <View style={s.lockedContent}>
//                 <View style={[s.dot, { backgroundColor: h.color }]} />
//                 <View style={s.iconWrap}>{typeIcon(h.type)}</View>
//                 <View style={{ flex: 1 }}>
//                   <Text style={[s.name, { opacity: 0.2 }]}>{"██████████"}</Text>
//                   <Text style={[s.typeLabel, { opacity: 0.2 }]}>{"██████"}</Text>
//                 </View>
//                 <View style={{ alignItems: "flex-end" }}>
//                   <Text style={[s.value, { opacity: 0.2 }]}>{"₹██,███"}</Text>
//                 </View>
//               </View>
//               <View style={s.unlockBar}>
//                 <Lock color={C.blue} size={12} />
//                 <Text style={s.unlockText}>Tap to unlock Pro</Text>
//               </View>
//             </TouchableOpacity>
//           ) : (
//             <View key={h.id} style={s.row}>
//               <View style={[s.dot, { backgroundColor: h.color }]} />
//               <View style={s.iconWrap}>{typeIcon(h.type)}</View>
//               <View style={{ flex: 1 }}>
//                 <Text style={s.name}>{h.name}</Text>
//                 <Text style={s.typeLabel}>{h.type.replace(/_/g, " ")}</Text>
//               </View>
//               <View style={{ alignItems: "flex-end" }}>
//                 <Text style={s.value}>{formatINR(h.value)}</Text>
//                 <Text style={[s.pnl, { color: h.pnlPct >= 0 ? C.green : C.red }]}>
//                   {h.pnlPct >= 0 ? "+" : ""}{h.pnlPct}%
//                 </Text>
//               </View>
//             </View>
//           )
//         )}

//         <TouchableOpacity style={s.upsellBanner} onPress={() => router.push("/paywall")}>
//           <Lock color={C.blue} size={14} />
//           <Text style={s.upsellText}>Unlock Pro — ₹49 once for unlimited assets</Text>
//         </TouchableOpacity>
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// const s = StyleSheet.create({
//   safe:         { flex:1, backgroundColor:C.navy },
//   header:       { flexDirection:"row", justifyContent:"space-between", alignItems:"center", paddingHorizontal:18, paddingTop:14, paddingBottom:8 },
//   title:        { fontSize:22, fontWeight:"700", color:C.text1 },
//   addBtn:       { width:36, height:36, borderRadius:18, backgroundColor:C.card2, alignItems:"center", justifyContent:"center" },
//   searchWrap:   { flexDirection:"row", alignItems:"center", gap:8, marginHorizontal:18, marginBottom:14, backgroundColor:C.card, borderRadius:10, paddingHorizontal:12, paddingVertical:10, borderWidth:1, borderColor:C.border },
//   searchInput:  { flex:1, color:C.text1, fontSize:14 },
//   row:          { flexDirection:"row", alignItems:"center", gap:10, paddingHorizontal:18, paddingVertical:14, borderBottomWidth:1, borderBottomColor:C.border },
//   dot:          { width:8, height:8, borderRadius:4 },
//   iconWrap:     { width:34, height:34, borderRadius:8, backgroundColor:C.card2, alignItems:"center", justifyContent:"center" },
//   name:         { fontSize:14, color:C.text1, fontWeight:"500" },
//   typeLabel:    { fontSize:11, color:C.text3, marginTop:2, textTransform:"capitalize" },
//   value:        { fontSize:14, fontWeight:"700", color:C.gold },
//   pnl:          { fontSize:12, marginTop:2 },
//   lockedRow:    { borderBottomWidth:1, borderBottomColor:C.border },
//   lockedContent:{ flexDirection:"row", alignItems:"center", gap:10, paddingHorizontal:18, paddingVertical:14 },
//   unlockBar:    { flexDirection:"row", alignItems:"center", justifyContent:"center", gap:6, paddingVertical:7, backgroundColor:"rgba(59,130,246,0.10)", borderTopWidth:1, borderTopColor:"rgba(59,130,246,0.15)" },
//   unlockText:   { fontSize:12, color:C.blue, fontWeight:"600" },
//   upsellBanner: { flexDirection:"row", alignItems:"center", justifyContent:"center", gap:8, margin:18, paddingVertical:14, backgroundColor:"rgba(59,130,246,0.08)", borderRadius:12, borderWidth:1, borderColor:"rgba(59,130,246,0.2)" },
//   upsellText:   { fontSize:13, color:C.blue, fontWeight:"500" },
// });















import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, TextInput, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  Plus, Search, TrendingUp, Circle, Landmark,
  BarChart2, Zap, Shield, Home, Wallet, Lock, Trash2,
} from "lucide-react-native";
import {
  useAssets, calcPnL, formatINR, FREE_LIMIT,
} from ".../../src/hooks/useAssets";
import { Asset, AssetType } from "../../src/db/database";
import { useState } from "react";

const C = {
  navy: "#0A0F1E", card: "#111827", card2: "#1a2236",
  teal: "#00D4B4", blue: "#3B82F6", gold: "#F5A623",
  green: "#22C55E", red: "#EF4444", orange: "#F97316",
  purple: "#A855F7", text1: "#F1F5F9", text2: "#94A3B8",
  text3: "#64748B", border: "rgba(255,255,255,0.07)",
};

const TYPE_COLOR: Record<AssetType, string> = {
  mutual_fund: C.teal, stock: C.orange, gold: C.gold,
  fd: C.green, crypto: C.blue, ppf: C.purple,
  real_estate: C.text3, cash: C.text3,
};

function typeIcon(type: AssetType) {
  const sz = 16;
  switch (type) {
    case "mutual_fund":  return <TrendingUp color={C.teal}   size={sz} />;
    case "gold":         return <Circle     color={C.gold}   size={sz} />;
    case "fd":           return <Landmark   color={C.green}  size={sz} />;
    case "ppf":          return <Shield     color={C.purple} size={sz} />;
    case "crypto":       return <Zap        color={C.blue}   size={sz} />;
    case "real_estate":  return <Home       color={C.text3}  size={sz} />;
    case "cash":         return <Wallet     color={C.text3}  size={sz} />;
    default:             return <BarChart2  color={C.blue}   size={sz} />;
  }
}

function AssetRow({
  asset,
  onDelete,
}: {
  asset: Asset;
  onDelete: (id: string, name: string) => void;
}) {
  const pnl = calcPnL(asset);
  const currentVal = asset.quantity * asset.currentPrice;

  return (
    <View style={s.row}>
      <View style={[s.dot, { backgroundColor: TYPE_COLOR[asset.type] }]} />
      <View style={s.iconWrap}>{typeIcon(asset.type)}</View>
      <View style={s.rowMid}>
        <Text style={s.rowName} numberOfLines={1}>{asset.name}</Text>
        <Text style={s.rowType}>{asset.type.replace(/_/g, " ")}</Text>
      </View>
      <View style={s.rowRight}>
        <Text style={s.rowVal}>{formatINR(currentVal)}</Text>
        {asset.buyPrice > 0 && (
          <Text style={[s.rowPnl, { color: pnl.percentage >= 0 ? C.green : C.red }]}>
            {pnl.percentage >= 0 ? "+" : ""}{pnl.percentage.toFixed(1)}%
          </Text>
        )}
      </View>
      <TouchableOpacity
        style={s.deleteBtn}
        onPress={() => onDelete(asset.id, asset.name)}
      >
        <Trash2 color={C.red} size={15} />
      </TouchableOpacity>
    </View>
  );
}

export default function HoldingsScreen() {
  const router    = useRouter();
  const { assets, removeAsset, netWorth } = useAssets();
  const [query, setQuery] = useState("");
  const isPro = false;

  const filtered = query.trim()
    ? assets.filter((a) =>
        a.name.toLowerCase().includes(query.toLowerCase())
      )
    : assets;

  const freeAssets   = filtered.slice(0, FREE_LIMIT);
  const lockedAssets = filtered.slice(FREE_LIMIT);

  function confirmDelete(id: string, name: string) {
    Alert.alert(
      "Delete asset",
      `Remove "${name}" from your portfolio?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => removeAsset(id),
        },
      ]
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Text style={s.title}>Holdings</Text>
        <TouchableOpacity onPress={() => router.push("/add-asset")}>
          <Plus color={C.blue} size={22} />
        </TouchableOpacity>
      </View>

      <View style={s.searchWrap}>
        <Search color={C.text3} size={15} />
        <TextInput
          style={s.searchInput}
          placeholder="Search assets..."
          placeholderTextColor={C.text3}
          value={query}
          onChangeText={setQuery}
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {assets.length === 0 ? (
          <View style={s.empty}>
            <Text style={s.emptyText}>No assets yet.</Text>
            <Text style={s.emptySub}>Tap + to add your first asset.</Text>
          </View>
        ) : (
          <>
            {freeAssets.map((a) => (
              <AssetRow key={a.id} asset={a} onDelete={confirmDelete} />
            ))}

            {/* Locked rows (assets beyond free limit) */}
            {!isPro && lockedAssets.length > 0 && (
              <>
                {lockedAssets.map((a) => (
                  <TouchableOpacity
                    key={a.id}
                    style={s.lockedRow}
                    onPress={() => router.push("/paywall")}
                  >
                    <Lock color={C.blue} size={14} />
                    <Text style={s.lockedText}>Locked — </Text>
                    <Text style={s.lockedCta}>Unlock Pro to view</Text>
                  </TouchableOpacity>
                ))}
              </>
            )}

            {/* Pro users see everything */}
            {isPro && lockedAssets.map((a) => (
              <AssetRow key={a.id} asset={a} onDelete={confirmDelete} />
            ))}

            {/* Total */}
            <View style={s.totalRow}>
              <Text style={s.totalLabel}>Portfolio Total</Text>
              <Text style={s.totalValue}>{formatINR(netWorth)}</Text>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: C.navy },
  header:      { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 18, paddingTop: 12, paddingBottom: 8 },
  title:       { fontSize: 22, fontWeight: "700", color: C.text1 },
  searchWrap:  { flexDirection: "row", alignItems: "center", gap: 8, marginHorizontal: 18, marginBottom: 12, backgroundColor: C.card, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: C.border },
  searchInput: { flex: 1, color: C.text1, fontSize: 14 },
  row:         { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 18, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.border },
  dot:         { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  iconWrap:    { width: 34, height: 34, borderRadius: 8, backgroundColor: C.card2, alignItems: "center", justifyContent: "center" },
  rowMid:      { flex: 1 },
  rowName:     { fontSize: 14, color: C.text1, fontWeight: "500" },
  rowType:     { fontSize: 11, color: C.text3, marginTop: 2, textTransform: "capitalize" },
  rowRight:    { alignItems: "flex-end", marginRight: 8 },
  rowVal:      { fontSize: 14, fontWeight: "700", color: C.gold },
  rowPnl:      { fontSize: 12, marginTop: 2 },
  deleteBtn:   { padding: 6 },
  lockedRow:   { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 18, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.border, backgroundColor: "rgba(59,130,246,0.04)" },
  lockedText:  { fontSize: 13, color: C.text3 },
  lockedCta:   { fontSize: 13, color: C.blue, fontWeight: "600" },
  totalRow:    { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 18, paddingVertical: 16, marginTop: 8, marginHorizontal: 18, backgroundColor: C.card, borderRadius: 12, borderWidth: 1, borderColor: C.border },
  totalLabel:  { fontSize: 13, color: C.text3 },
  totalValue:  { fontSize: 16, fontWeight: "700", color: C.gold },
  empty:       { alignItems: "center", paddingTop: 60 },
  emptyText:   { fontSize: 16, color: C.text2, marginBottom: 6 },
  emptySub:    { fontSize: 13, color: C.text3 },
});