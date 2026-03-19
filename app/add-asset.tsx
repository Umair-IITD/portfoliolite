import {
  View, Text, TouchableOpacity, StyleSheet,
  TextInput, ScrollView, KeyboardAvoidingView, Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { X } from "lucide-react-native";
import { useState } from "react";
import { useAssets, canAddAsset, formatINR, FREE_LIMIT } from "../src/hooks/useAssets";
import { usePurchases } from "../src/hooks/usePurchases";
import { AssetType } from "../src/db/database";
import { ConfirmModal } from "../src/components/ui/ConfirmModal";

const C = {
  navy: "#0A0F1E", card: "#111827", card2: "#1a2236",
  teal: "#00D4B4", blue: "#3B82F6", gold: "#F5A623",
  text1: "#F1F5F9", text2: "#94A3B8", text3: "#64748B",
  border: "rgba(255,255,255,0.07)",
};

const ASSET_TYPES: { key: AssetType; label: string }[] = [
  { key: "mutual_fund", label: "Mutual Fund" },
  { key: "stock",       label: "Stocks"      },
  { key: "gold",        label: "Gold"        },
  { key: "fd",          label: "FD"          },
  { key: "crypto",      label: "Crypto"      },
  { key: "ppf",         label: "PPF"         },
  { key: "real_estate", label: "Real Estate" },
  { key: "cash",        label: "Cash"        },
];

export default function AddAssetScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addAsset, assetCount } = useAssets();
  const { isPro } = usePurchases();

  const [selectedType, setSelectedType] = useState<AssetType>("mutual_fund");
  const [name,         setName]         = useState("");
  const [qty,          setQty]          = useState("1");
  const [buyPrice,     setBuyPrice]     = useState("");
  const [curPrice,     setCurPrice]     = useState("");
  const [isSaving,     setIsSaving]     = useState(false);

  const currentValue = (parseFloat(qty) || 1) * (parseFloat(curPrice) || 0);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState({ title: "", message: "", isDanger: false });

  async function handleSave() {
    if (!name.trim()) {
      setModalContent({ title: "Missing name", message: "Please enter an asset name.", isDanger: true });
      setModalVisible(true);
      return;
    }
    if (!curPrice || parseFloat(curPrice) <= 0) {
      setModalContent({ title: "Missing price", message: "Please enter the current price.", isDanger: true });
      setModalVisible(true);
      return;
    }
    if (!canAddAsset(assetCount, isPro)) {
      router.push("/paywall");
      return;
    }
    try {
      setIsSaving(true);
      await addAsset({
        name:         name.trim(),
        type:         selectedType,
        quantity:     parseFloat(qty) || 1,
        buyPrice:     parseFloat(buyPrice) || 0,
        currentPrice: parseFloat(curPrice),
        currency:     "INR",
        notes:        null,
      });
      router.back();
    } catch (e) {
      setModalContent({ title: "Error", message: "Could not save asset. Please try again.", isDanger: true });
      setModalVisible(true);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={[s.safe, { paddingTop: insets.top }]}>
        <View style={s.handle} />
        <View style={s.header}>
          <View>
            <Text style={s.headerTitle}>Add Asset</Text>
            <Text style={s.headerSub}>All data stays on your device</Text>
          </View>
          <TouchableOpacity style={s.closeBtn} onPress={() => router.back()}>
            <X color={C.text2} size={18} />
          </TouchableOpacity>
        </View>

        {!isPro && (
          <View style={s.tierNotice}>
            <Text style={s.tierText}>
              Free: {assetCount}/{FREE_LIMIT} assets
              {assetCount >= FREE_LIMIT ? " · Unlock Pro for unlimited" : ""}
            </Text>
          </View>
        )}

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chipRow}>
            {ASSET_TYPES.map((t) => (
              <TouchableOpacity
                key={t.key}
                style={[s.chip, selectedType === t.key && s.chipActive]}
                onPress={() => setSelectedType(t.key)}
              >
                <Text style={[s.chipText, selectedType === t.key && s.chipTextActive]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={s.fieldWrap}>
            <Text style={s.label}>Asset Name *</Text>
            <TextInput style={s.input} placeholder="e.g. HDFC Equity Fund" placeholderTextColor={C.text3} value={name} onChangeText={setName} />
          </View>

          <View style={s.row2}>
            <View style={[s.fieldWrap, { flex: 1 }]}>
              <Text style={s.label}>Quantity</Text>
              <TextInput style={s.input} placeholder="1" placeholderTextColor={C.text3} keyboardType="decimal-pad" value={qty} onChangeText={setQty} />
            </View>
            <View style={[s.fieldWrap, { flex: 1 }]}>
              <Text style={s.label}>Buy Price (₹)</Text>
              <TextInput style={s.input} placeholder="0" placeholderTextColor={C.text3} keyboardType="decimal-pad" value={buyPrice} onChangeText={setBuyPrice} />
            </View>
          </View>

          <View style={s.fieldWrap}>
            <Text style={s.label}>Current Price (₹) *</Text>
            <TextInput style={s.input} placeholder="0" placeholderTextColor={C.text3} keyboardType="decimal-pad" value={curPrice} onChangeText={setCurPrice} />
          </View>

          {currentValue > 0 && (
            <View style={s.calcBox}>
              <Text style={s.calcLabel}>Current Value: </Text>
              <Text style={s.calcValue}>{formatINR(currentValue)}</Text>
            </View>
          )}

          <TouchableOpacity style={[s.saveBtn, isSaving && { opacity: 0.6 }]} onPress={handleSave} disabled={isSaving}>
            <Text style={s.saveBtnText}>{isSaving ? "Saving…" : "Save Asset"}</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <ConfirmModal 
        visible={modalVisible}
        title={modalContent.title}
        message={modalContent.message}
        onConfirm={() => setModalVisible(false)}
        onCancel={() => setModalVisible(false)}
        confirmLabel="OK"
        isDanger={modalContent.isDanger}
      />
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  safe:           { flex: 1, backgroundColor: "#0d1120", borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  handle:         { width: 36, height: 4, backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 2, alignSelf: "center", marginTop: 10, marginBottom: 4 },
  header:         { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", paddingHorizontal: 18, paddingVertical: 12 },
  headerTitle:    { fontSize: 18, fontWeight: "700", color: C.text1 },
  headerSub:      { fontSize: 12, color: C.text3, marginTop: 2 },
  closeBtn:       { width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.07)", alignItems: "center", justifyContent: "center" },
  tierNotice:     { marginHorizontal: 18, marginBottom: 8, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: "rgba(0,212,180,0.07)", borderRadius: 8, borderWidth: 1, borderColor: "rgba(0,212,180,0.15)" },
  tierText:       { fontSize: 12, color: C.teal },
  chipRow:        { paddingHorizontal: 18, paddingBottom: 16, gap: 8 },
  chip:           { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", backgroundColor: C.card2 },
  chipActive:     { backgroundColor: C.teal, borderColor: C.teal },
  chipText:       { fontSize: 13, color: C.text2 },
  chipTextActive: { fontSize: 13, color: "#0A0F1E", fontWeight: "600" },
  fieldWrap:      { paddingHorizontal: 18, marginBottom: 14 },
  label:          { fontSize: 12, color: C.text3, marginBottom: 6 },
  input:          { backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, color: C.text1, fontSize: 14 },
  row2:           { flexDirection: "row", gap: 12, paddingHorizontal: 18, marginBottom: 14 },
  calcBox:        { flexDirection: "row", alignItems: "center", marginHorizontal: 18, marginBottom: 20, padding: 12, backgroundColor: "rgba(245,166,35,0.08)", borderRadius: 10, borderWidth: 1, borderColor: "rgba(245,166,35,0.2)" },
  calcLabel:      { fontSize: 13, color: C.text3 },
  calcValue:      { fontSize: 15, fontWeight: "700", color: C.gold },
  saveBtn:        { marginHorizontal: 18, paddingVertical: 15, backgroundColor: C.teal, borderRadius: 12, alignItems: "center" },
  saveBtnText:    { fontSize: 16, fontWeight: "700", color: "#0A0F1E" },
});