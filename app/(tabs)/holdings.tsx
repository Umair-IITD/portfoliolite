import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Plus, Search, TrendingUp, Circle, Landmark, BarChart2, Zap, Shield, Home, Wallet } from "lucide-react-native";

const C = {
  navy: "#0A0F1E", card: "#111827", card2: "#1a2236",
  teal: "#00D4B4", blue: "#3B82F6", gold: "#F5A623",
  green: "#22C55E", red: "#EF4444", orange: "#F97316",
  purple: "#A855F7", text1: "#F1F5F9", text2: "#94A3B8",
  text3: "#64748B", border: "rgba(255,255,255,0.07)",
};

const MOCK_HOLDINGS = [
  { id: "1", name: "HDFC Flexi Cap SIP",  type: "mutual_fund",  value: 594000,  pnlPct: 18.8,  color: C.teal   },
  { id: "2", name: "Nippon ELSS Fund",    type: "mutual_fund",  value: 210000,  pnlPct: 20.0,  color: C.teal   },
  { id: "3", name: "Digital Gold",        type: "gold",         value: 371800,  pnlPct: 6.2,   color: C.gold   },
  { id: "4", name: "SBI FD — 7.2%",      type: "fd",           value: 297350,  pnlPct: 18.9,  color: C.green  },
  { id: "5", name: "PPF Account",         type: "ppf",          value: 180000,  pnlPct: 7.1,   color: C.purple },
  { id: "6", name: "Infosys Ltd",         type: "stock",        value: 78600,   pnlPct: -4.2,  color: C.orange, locked: true },
  { id: "7", name: "TCS Ltd",             type: "stock",        value: 135600,  pnlPct: 12.5,  color: C.orange, locked: true },
];

function typeIcon(type: string) {
  const size = 16;
  if (type === "mutual_fund") return <TrendingUp color={C.teal}   size={size} />;
  if (type === "gold")        return <Circle      color={C.gold}   size={size} />;
  if (type === "fd")          return <Landmark    color={C.green}  size={size} />;
  if (type === "ppf")         return <Shield      color={C.purple} size={size} />;
  if (type === "crypto")      return <Zap         color={C.orange} size={size} />;
  if (type === "real_estate") return <Home        color={C.text3}  size={size} />;
  if (type === "cash")        return <Wallet      color={C.text3}  size={size} />;
  return <BarChart2 color={C.blue} size={size} />;
}

function formatINR(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}

export default function HoldingsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Text style={s.title}>Holdings</Text>
        <TouchableOpacity onPress={() => router.push("/add-asset")}>
          <Plus color={C.blue} size={22} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={s.searchWrap}>
        <Search color={C.text3} size={15} />
        <TextInput
          style={s.searchInput}
          placeholder="Search assets…"
          placeholderTextColor={C.text3}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {MOCK_HOLDINGS.map((h) => (
          <View key={h.id}>
            {h.locked ? (
              /* Blurred locked row */
              <View style={s.lockedWrap}>
                <View style={[s.holdingRow, { opacity: 0.15 }]}>
                  <View style={[s.dot, { backgroundColor: h.color }]} />
                  <View style={s.holdingIcon}>{typeIcon(h.type)}</View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.holdingName}>{h.name}</Text>
                    <Text style={s.holdingType}>{h.type}</Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={s.holdingVal}>{formatINR(h.value)}</Text>
                  </View>
                </View>
                <TouchableOpacity style={s.unlockBadge} onPress={() => router.push("/paywall")}>
                  <Text style={s.unlockText}>🔒 Unlock Pro →</Text>
                </TouchableOpacity>
              </View>
            ) : (
              /* Normal row */
              <View style={s.holdingRow}>
                <View style={[s.dot, { backgroundColor: h.color }]} />
                <View style={s.holdingIcon}>{typeIcon(h.type)}</View>
                <View style={{ flex: 1 }}>
                  <Text style={s.holdingName}>{h.name}</Text>
                  <Text style={s.holdingType}>{h.type.replace("_", " ")}</Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={s.holdingVal}>{formatINR(h.value)}</Text>
                  <Text style={[s.holdingPnl, { color: h.pnlPct >= 0 ? C.green : C.red }]}>
                    {h.pnlPct >= 0 ? "+" : ""}{h.pnlPct}%
                  </Text>
                </View>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: C.navy },
  header:      { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 18, paddingVertical: 12 },
  title:       { fontSize: 22, fontWeight: "700", color: C.text1 },
  searchWrap:  { flexDirection: "row", alignItems: "center", gap: 8, marginHorizontal: 18, marginBottom: 12, backgroundColor: C.card, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: C.border },
  searchInput: { flex: 1, color: C.text1, fontSize: 14 },
  holdingRow:  { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 18, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.border },
  dot:         { width: 8, height: 8, borderRadius: 4 },
  holdingIcon: { width: 34, height: 34, borderRadius: 8, backgroundColor: C.card2, alignItems: "center", justifyContent: "center" },
  holdingName: { fontSize: 14, color: C.text1, fontWeight: "500" },
  holdingType: { fontSize: 11, color: C.text3, marginTop: 2 },
  holdingVal:  { fontSize: 14, fontWeight: "700", color: C.gold },
  holdingPnl:  { fontSize: 12, marginTop: 2 },
  lockedWrap:  { position: "relative" },
  unlockBadge: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center" },
  unlockText:  { backgroundColor: C.blue, color: "#fff", fontSize: 12, fontWeight: "600", paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8, overflow: "hidden" },
});