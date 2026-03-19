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
} from "../../src/hooks/useAssets";
import { usePurchases } from "../../src/hooks/usePurchases";
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
  asset, onDelete,
}: {
  asset: Asset;
  onDelete: (id: string, name: string) => void;
}) {
  const pnl        = calcPnL(asset);
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

function LockedRow({ onUnlock }: { onUnlock: () => void }) {
  return (
    <TouchableOpacity style={s.lockedRow} onPress={onUnlock} activeOpacity={0.85}>
      <Lock color={C.blue} size={14} />
      <Text style={s.lockedText}>Locked — </Text>
      <Text style={s.lockedCta}>Unlock Pro to view this asset</Text>
    </TouchableOpacity>
  );
}

export default function HoldingsScreen() {
  const router                          = useRouter();
  const { assets, removeAsset, netWorth } = useAssets();
  const { isPro }                       = usePurchases();
  const [query, setQuery]               = useState("");

  const filtered = query.trim()
    ? assets.filter((a) => a.name.toLowerCase().includes(query.toLowerCase()))
    : assets;

  // Split into visible (free) and locked (beyond free limit for non-pro users)
  const visibleAssets = isPro ? filtered : filtered.slice(0, FREE_LIMIT);
  const lockedAssets  = isPro ? [] : filtered.slice(FREE_LIMIT);

  function confirmDelete(id: string, name: string) {
    Alert.alert(
      "Delete asset",
      `Remove "${name}" from your portfolio?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => removeAsset(id) },
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

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {assets.length === 0 ? (
          <View style={s.empty}>
            <Text style={s.emptyText}>No assets yet.</Text>
            <Text style={s.emptySub}>Tap + to add your first asset.</Text>
          </View>
        ) : (
          <>
            {visibleAssets.map((a) => (
              <AssetRow key={a.id} asset={a} onDelete={confirmDelete} />
            ))}

            {lockedAssets.map((a) => (
              <LockedRow key={a.id} onUnlock={() => router.push("/paywall")} />
            ))}

            <View style={s.totalRow}>
              <Text style={s.totalLabel}>
                {isPro ? "Portfolio Total" : `Total (${FREE_LIMIT} free assets)`}
              </Text>
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