import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, TextInput,
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
import { ConfirmModal } from "../../src/components/ui/ConfirmModal";
import { useState } from "react";

const C = {
  navy:   "#0A0F1E",
  card:   "rgba(17, 24, 39, 0.8)",
  card2:  "#1a2236",
  teal:   "#00D4B4",
  blue:   "#3B82F6",
  gold:   "#F5A623",
  green:  "#22C55E",
  red:    "#EF4444",
  orange: "#F97316",
  purple: "#A855F7",
  text1:  "#F1F5F9",
  text2:  "#94A3B8",
  text3:  "#64748B",
  border: "rgba(255, 255, 255, 0.08)",
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
  const isGain     = pnl.percentage >= 0;

  return (
    <View style={s.row}>
      <View style={s.iconWrap}>{typeIcon(asset.type)}</View>
      <View style={s.rowMid}>
        <Text style={s.rowName} numberOfLines={1}>{asset.name}</Text>
        <Text style={s.rowType}>{asset.type.replace(/_/g, " ")}</Text>
      </View>
      <View style={s.rowRight}>
        <Text style={s.rowVal}>{formatINR(currentVal)}</Text>
        {asset.buyPrice > 0 && (
          <View style={[s.pnlBadge, { backgroundColor: isGain ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)" }]}>
            <Text style={[s.pnlBadgeText, { color: isGain ? C.green : C.red }]}>
                {isGain ? "▲" : "▼"} {Math.abs(pnl.percentage).toFixed(1)}%
            </Text>
          </View>
        )}
      </View>
      <TouchableOpacity
        style={s.deleteBtn}
        onPress={() => onDelete(asset.id, asset.name)}
      >
        <Trash2 color={C.text3} size={15} />
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
  const [sortBy, setSortBy]               = useState<"value" | "performance">("value");

  const filtered = query.trim()
    ? assets.filter((a) => a.name.toLowerCase().includes(query.toLowerCase()))
    : assets;

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "value") {
        return (b.quantity * b.currentPrice) - (a.quantity * a.currentPrice);
    } else {
        const pnlA = calcPnL(a).percentage;
        const pnlB = calcPnL(b).percentage;
        return pnlB - pnlA;
    }
  });

  const visibleAssets = isPro ? sorted : sorted.slice(0, FREE_LIMIT);
  const lockedAssets  = isPro ? [] : sorted.slice(FREE_LIMIT);

  const [modalConfig, setModalConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ visible: false, title: "", message: "", onConfirm: () => {} });

  function confirmDelete(id: string, name: string) {
    setModalConfig({
      visible: true,
      title: "Delete asset",
      message: `Remove "${name}" from your portfolio?`,
      onConfirm: () => { removeAsset(id); setModalConfig(p=>({...p, visible: false})); }
    });
  }

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Text style={s.title}>Holdings</Text>
        <TouchableOpacity onPress={() => router.push("/add-asset")}>
          <Plus color={C.blue} size={24} />
        </TouchableOpacity>
      </View>

      <View style={s.searchRow}>
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
        <TouchableOpacity 
            style={[s.sortBtn, sortBy === "performance" && s.sortBtnActive]}
            onPress={() => setSortBy(p => p === "value" ? "performance" : "value")}
        >
            <TrendingUp color={sortBy === "performance" ? "#fff" : C.text2} size={16} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {assets.length === 0 ? (
          <View style={s.empty}>
            <Text style={s.emptyIcon}>📂</Text>
            <Text style={s.emptyTitle}>Nothing here yet</Text>
            <Text style={s.emptySub}>Add assets to see them listed here.</Text>
          </View>
        ) : (
          <View style={s.listCard}>
            {visibleAssets.map((a, i) => (
              <AssetRow 
                key={a.id} 
                asset={a} 
                onDelete={confirmDelete} 
              />
            ))}

            {lockedAssets.map((a) => (
              <LockedRow key={a.id} onUnlock={() => router.push("/paywall")} />
            ))}
            
            <View style={s.footerSummary}>
              <Text style={s.footerLabel}>
                {isPro ? "PORTFOLIO TOTAL" : `TOTAL (${FREE_LIMIT} FREE)`}
              </Text>
              <Text style={s.footerValue}>{formatINR(netWorth)}</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={s.fab}
        onPress={() => router.push("/add-asset")}
      >
        <Plus color="#0A0F1E" size={28} strokeWidth={2.5} />
      </TouchableOpacity>
      <ConfirmModal
        visible={modalConfig.visible}
        title={modalConfig.title}
        message={modalConfig.message}
        onConfirm={modalConfig.onConfirm}
        onCancel={() => setModalConfig(p => ({ ...p, visible: false }))}
        confirmLabel="Delete"
        isDanger={true}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: C.navy },
  header:      { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 18, paddingVertical: 14 },
  title:       { fontSize: 22, fontWeight: "800", color: C.text1 },
  searchRow:   { flexDirection: "row", gap: 10, marginHorizontal: 18, marginBottom: 16 },
  searchWrap:  { flex: 1, flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: C.card, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: C.border },
  sortBtn:     { width: 44, height: 44, borderRadius: 12, backgroundColor: C.card, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: C.border },
  sortBtnActive:{ backgroundColor: C.blue, borderColor: C.blue },
  searchInput: { flex: 1, color: C.text1, fontSize: 13 },
  
  listCard:    { marginHorizontal: 18, backgroundColor: C.card, borderRadius: 20, overflow: "hidden", borderWidth: 1, borderColor: C.border },
  row:         { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: C.border },
  iconWrap:    { width: 40, height: 40, borderRadius: 12, backgroundColor: C.card2, alignItems: "center", justifyContent: "center" },
  rowMid:      { flex: 1 },
  rowName:     { fontSize: 14, color: C.text1, fontWeight: "600" },
  rowType:     { fontSize: 10, color: C.text3, marginTop: 2, textTransform: "uppercase", letterSpacing: 0.5 },
  rowRight:    { alignItems: "flex-end", marginRight: 4 },
  rowVal:      { fontSize: 15, fontWeight: "800", color: C.gold },
  pnlBadge:    { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginTop: 4 },
  pnlBadgeText:{ fontSize: 10, fontWeight: "800" },
  deleteBtn:   { padding: 8 },
  
  lockedRow:   { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 18, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: C.border, backgroundColor: "rgba(59,130,246,0.03)" },
  lockedText:  { fontSize: 13, color: C.text3 },
  lockedCta:   { fontSize: 13, color: C.blue, fontWeight: "600" },
  
  footerSummary: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 18, backgroundColor: "rgba(255,255,255,0.02)" },
  footerLabel:   { fontSize: 10, fontWeight: "700", color: C.text3, letterSpacing: 1 },
  footerValue:   { fontSize: 18, fontWeight: "900", color: C.text1 },
  
  empty:       { alignItems: "center", paddingTop: 80, paddingHorizontal: 40 },
  emptyIcon:   { fontSize: 50, marginBottom: 20 },
  emptyTitle:  { fontSize: 20, fontWeight: "800", color: C.text1, marginBottom: 8 },
  emptySub:    { fontSize: 14, color: C.text3, textAlign: "center", lineHeight: 22 },

  fab:         { position: "absolute", bottom: 20, right: 18, width: 56, height: 56, borderRadius: 28, backgroundColor: C.teal, alignItems: "center", justifyContent: "center", elevation: 8 },
});