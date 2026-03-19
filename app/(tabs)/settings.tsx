import {
  View, Text, TouchableOpacity, StyleSheet,
  Switch, ScrollView, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Fingerprint, Download, Trash2, FileText,
  Star, Info, Shield, ChevronRight, Lock, Unlock,
} from "lucide-react-native";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { deleteAllData, exportToCSV } from "../../src/db/database";
import { useAssets } from "../../src/hooks/useAssets";
import { useBiometrics } from "../../src/hooks/useBiometrics";
import { usePurchases } from "../../src/hooks/usePurchases";
import { useRouter } from "expo-router";

const C = {
  navy: "#0A0F1E", card: "#111827", card2: "#1a2236",
  teal: "#00D4B4", blue: "#3B82F6", red: "#EF4444",
  gold: "#F5A623", green: "#22C55E",
  text1: "#F1F5F9", text2: "#94A3B8", text3: "#64748B",
  border: "rgba(255,255,255,0.07)",
};

function Row({
  icon, label, danger = false, right, onPress, disabled = false,
}: {
  icon: React.ReactNode;
  label: string;
  danger?: boolean;
  right?: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[s.row, disabled && { opacity: 0.45 }]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={disabled}
    >
      <View style={s.rowIcon}>{icon}</View>
      <Text style={[s.rowLabel, danger && { color: C.red }]}>{label}</Text>
      {right ?? <ChevronRight color={C.text3} size={16} />}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const { assets, refresh }                         = useAssets();
  const { isAvailable, isEnabled, enable, disable } = useBiometrics();
  const { isPro, isLoading, purchasePro, restorePro } = usePurchases();

  // ── Biometric toggle ─────────────────────────────────────────────
  async function handleBiometricToggle(val: boolean) {
    if (val) {
      if (!isAvailable) {
        Alert.alert(
          "Not available",
          "No biometrics enrolled on this device. Please set up fingerprint or face unlock in your phone Settings first."
        );
        return;
      }
      await enable();
    } else {
      Alert.alert(
        "Disable lock?",
        "Anyone will be able to open PortfolioLite without biometrics.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Disable", style: "destructive", onPress: disable },
        ]
      );
    }
  }

  // ── CSV export — Pro only ────────────────────────────────────────
  async function handleExportCSV() {
    if (!isPro) {
      Alert.alert(
        "Pro Feature",
        "CSV export is available in PortfolioLite Pro. Unlock for ₹49 — one-time, no subscription.",
        [
          { text: "Not now", style: "cancel" },
          { text: "Unlock Pro", onPress: () => router.push("/paywall") },
        ]
      );
      return;
    }

    if (assets.length === 0) {
      Alert.alert("Nothing to export", "Add some assets first.");
      return;
    }

    try {
      const csv     = exportToCSV();
      const fileUri = FileSystem.documentDirectory + "portfoliolite_export.csv";
      await FileSystem.writeAsStringAsync(fileUri, csv, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(fileUri, {
          mimeType:    "text/csv",
          dialogTitle: "Export PortfolioLite data",
        });
      } else {
        Alert.alert("Saved", `CSV saved to:\n${fileUri}`);
      }
    } catch {
      Alert.alert("Export failed", "Please try again.");
    }
  }

  // ── Delete all data ──────────────────────────────────────────────
  function confirmDeleteAll() {
    Alert.alert(
      "Delete all data",
      "This permanently erases ALL assets, history, and settings from this device. Cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Everything",
          style: "destructive",
          onPress: () => { deleteAllData(); refresh(); },
        },
      ]
    );
  }

  // ── Unlock Pro from settings ─────────────────────────────────────
  async function handleUnlockPro() {
    Alert.alert(
      "Unlock PortfolioLite Pro",
      "Choose how to pay:",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Pay via UPI — ₹45",
          onPress: () => router.push("/paywall"),
        },
        {
          text: "Pay via Google Play — ₹49",
          onPress: async () => {
            await purchasePro();
          },
        },
      ]
    );
  }

  // ── Restore purchase ─────────────────────────────────────────────
  async function handleRestore() {
    try {
      await restorePro();
      Alert.alert("Restored!", "PortfolioLite Pro has been restored.");
    } catch {
      Alert.alert("Not found", "No previous purchase was found for this account.");
    }
  }

  return (
    <SafeAreaView style={s.safe}>
      <Text style={s.title}>Settings</Text>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Zero Cloud badge */}
        <View style={s.zeroBadge}>
          <Shield color={C.teal} size={14} />
          <Text style={s.zeroText}>All data stored only on this device — Zero Cloud</Text>
        </View>

        {/* Pro status banner */}
        <TouchableOpacity
          style={[s.proBanner, { borderColor: isPro ? C.gold : C.border }]}
          onPress={isPro ? undefined : handleUnlockPro}
          activeOpacity={isPro ? 1 : 0.75}
          disabled={isLoading}
        >
          {isPro
            ? <Unlock color={C.gold} size={18} />
            : <Lock   color={C.text3} size={18} />
          }
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[s.proTitle, { color: isPro ? C.gold : C.text2 }]}>
              {isPro ? "PortfolioLite Pro ✓" : "Free Tier"}
            </Text>
            <Text style={s.proSub}>
              {isPro
                ? "Unlimited assets · CSV export · History chart"
                : `${assets.length}/5 assets · Tap to unlock Pro`}
            </Text>
          </View>
          {!isPro && (
            <View style={s.upgradeBtn}>
              <Text style={s.upgradeBtnText}>₹49</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Security */}
        <Text style={s.sectionLabel}>SECURITY</Text>
        <View style={s.section}>
          <Row
            icon={<Fingerprint color={isAvailable ? C.text2 : C.text3} size={18} />}
            label={isAvailable ? "Biometric Lock" : "Biometric Lock (unavailable)"}
            disabled={!isAvailable}
            right={
              <Switch
                value={isEnabled}
                onValueChange={handleBiometricToggle}
                trackColor={{ false: C.card2, true: C.teal }}
                thumbColor="#fff"
                disabled={!isAvailable}
              />
            }
          />
        </View>

        {/* Data */}
        <Text style={s.sectionLabel}>DATA</Text>
        <View style={s.section}>
          <Row
            icon={<Download color={isPro ? C.text2 : C.text3} size={18} />}
            label={isPro
              ? `Export as CSV (${assets.length} assets)`
              : "Export as CSV — Pro feature"
            }
            onPress={handleExportCSV}
          />
          <Row
            icon={<Trash2 color={C.red} size={18} />}
            label="Delete all data"
            danger
            onPress={confirmDeleteAll}
          />
        </View>

        {/* Pro section — only shown when not pro */}
        {!isPro && (
          <>
            <Text style={s.sectionLabel}>PRO</Text>
            <View style={s.section}>
              <Row
                icon={<Unlock color={C.text2} size={18} />}
                label="Unlock Pro — ₹49 one-time"
                onPress={handleUnlockPro}
              />
              <Row
                icon={<ChevronRight color={C.text3} size={18} />}
                label="Restore previous purchase"
                onPress={handleRestore}
              />
            </View>
          </>
        )}

        {/* About */}
        <Text style={s.sectionLabel}>ABOUT</Text>
        <View style={s.section}>
          <Row icon={<FileText color={C.text2} size={18} />} label="Privacy Policy" />
          <Row icon={<Star     color={C.text2} size={18} />} label="Rate the App ⭐" />
          <Row
            icon={<Info color={C.text2} size={18} />}
            label="App Version"
            right={<Text style={s.version}>1.0.0</Text>}
          />
        </View>

        <View style={s.footer}>
          <Text style={s.footerText}>Built by an indie developer in India 🇮🇳</Text>
          <Text style={s.footerSub}>PortfolioLite · Zero Cloud · Zero Tracking</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:           { flex: 1, backgroundColor: C.navy },
  title:          { fontSize: 22, fontWeight: "700", color: C.text1, paddingHorizontal: 18, paddingVertical: 14 },
  zeroBadge:      { flexDirection: "row", alignItems: "center", gap: 8, marginHorizontal: 18, marginBottom: 12, backgroundColor: "rgba(0,212,180,0.08)", borderWidth: 1, borderColor: "rgba(0,212,180,0.2)", borderRadius: 10, padding: 12 },
  zeroText:       { fontSize: 12, color: C.teal, fontWeight: "500", flex: 1 },
  proBanner:      { flexDirection: "row", alignItems: "center", marginHorizontal: 18, marginBottom: 16, backgroundColor: C.card, borderRadius: 12, padding: 14, borderWidth: 1.5 },
  proTitle:       { fontSize: 14, fontWeight: "700" },
  proSub:         { fontSize: 12, color: C.text3, marginTop: 2 },
  upgradeBtn:     { backgroundColor: C.gold, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8 },
  upgradeBtnText: { fontSize: 13, fontWeight: "700", color: "#0A0F1E" },
  sectionLabel:   { fontSize: 11, fontWeight: "600", letterSpacing: 1, color: C.text3, textTransform: "uppercase", paddingHorizontal: 18, paddingBottom: 6, paddingTop: 4 },
  section:        { marginHorizontal: 18, marginBottom: 14, backgroundColor: C.card, borderRadius: 14, overflow: "hidden", borderWidth: 1, borderColor: C.border },
  row:            { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.border },
  rowIcon:        { width: 28, alignItems: "center", marginRight: 10 },
  rowLabel:       { flex: 1, fontSize: 14, color: C.text1 },
  version:        { fontSize: 13, color: C.text3 },
  footer:         { alignItems: "center", paddingTop: 24, gap: 4 },
  footerText:     { fontSize: 12, color: C.text3 },
  footerSub:      { fontSize: 11, color: "#1e2a3a" },
});