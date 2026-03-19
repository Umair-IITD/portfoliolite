import {
  View, Text, TouchableOpacity, StyleSheet,
  Switch, ScrollView, Linking, Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Shield, ChevronRight, Info, Star, FileText, Download, Trash2,
} from "lucide-react-native";
import { useAssets } from "../../src/hooks/useAssets";
import { deleteAllData } from "../../src/db/database";
import { usePurchases } from "../../src/hooks/usePurchases";
import { useRouter } from "expo-router";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { ConfirmModal } from "../../src/components/ui/ConfirmModal";
import { useBiometrics } from "../../src/hooks/useBiometrics";
import React, { useState } from "react";

const C = {
  navy:   "#0A0F1E",
  card:   "rgba(17, 24, 39, 0.8)",
  card2:  "#1a2236",
  teal:   "#00D4B4",
  blue:   "#3B82F6",
  gold:   "#F5A623",
  green:  "#22C55E",
  red:    "#EF4444",
  text1:  "#F1F5F9",
  text2:  "#94A3B8",
  text3:  "#64748B",
  border: "rgba(255, 255, 255, 0.08)",
};

interface RowProps {
  icon: React.ReactNode;
  label: string;
  value?: string;
  onPress?: () => void;
  showChevron?: boolean;
  color?: string;
}

const Row = ({ icon, label, value, onPress, showChevron = true, color }: RowProps) => (
  <TouchableOpacity style={s.row} onPress={onPress} activeOpacity={0.7} disabled={!onPress}>
    <View style={s.rowLeft}>
      <View style={s.iconWrap}>{icon}</View>
      <Text style={[s.rowLabel, color ? { color } : {}]}>{label}</Text>
    </View>
    <View style={s.rowRight}>
      {value && <Text style={s.rowValue}>{value}</Text>}
      {showChevron && <ChevronRight color={C.text3} size={20} />}
    </View>
  </TouchableOpacity>
);

export default function SettingsScreen() {
  const router = useRouter();
  const { assets } = useAssets();
  const { isPro } = usePurchases();
  const { isEnabled, isAvailable, enable, disable } = useBiometrics();

  const [modalConfig, setModalConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    confirmLabel?: string;
    isDanger?: boolean;
    showCancel?: boolean;
  }>({ visible: false, title: "", message: "", onConfirm: () => {} });

  const showModal = (cfg: Partial<typeof modalConfig>) => setModalConfig({ ...modalConfig, showCancel: true, confirmLabel: "Confirm", isDanger: false, ...cfg, visible: true });
  const hideModal = () => setModalConfig({ ...modalConfig, visible: false });

  async function handleDeleteAllData() {
    showModal({
      title: "Delete All Data?",
      message: "This will permanently remove all assets and history. This action cannot be undone.",
      isDanger: true,
      confirmLabel: "Delete Everything",
      onConfirm: async () => {
        deleteAllData();
        hideModal();
        setTimeout(() => {
          showModal({
            title: "Data Cleared",
            message: "All portfolio data has been successfully removed.",
            showCancel: false,
            confirmLabel: "OK",
            onConfirm: hideModal
          });
        }, 500);
      }
    });
  }

  async function handleExportCSV() {
    if (!isPro) {
      router.push("/paywall");
      return;
    }
    
    if (assets.length === 0) {
      showModal({ title: "No Data", message: "Add some assets first to export your portfolio.", confirmLabel: "OK", showCancel: false });
      return;
    }

    try {
      const header = "Type,Name,Quantity,Buy Price,Current Price,Value (INR)\n";
      const rows = assets.map(a => 
        `${a.type},${a.name},${a.quantity},${a.buyPrice},${a.currentPrice},${a.quantity * a.currentPrice}`
      ).join("\n");
      
      const csv = header + rows;
      const fileUri = FileSystem.documentDirectory + "portfolio_export.csv";
      
      await FileSystem.writeAsStringAsync(fileUri, csv, { encoding: FileSystem.EncodingType.UTF8 });
      await Sharing.shareAsync(fileUri);
    } catch (e) {
      showModal({ title: "Export Failed", message: "Failed to generate CSV. Please try again.", confirmLabel: "OK", isDanger: true, showCancel: false });
    }
  }

  async function handlePrivacy() {
    router.push("/privacy");
  }

  async function handleRateApp() {
    const androidPackage = "com.umair.portfoliolite";
    const url = `market://details?id=${androidPackage}`;
    try {
      await Linking.openURL(url);
    } catch {
      await Linking.openURL(`https://play.google.com/store/apps/details?id=${androidPackage}`);
    }
  }

  return (
    <SafeAreaView style={s.safe}>
      <Text style={s.title}>Settings</Text>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={s.zeroBadge}>
          <Shield color={C.teal} size={14} />
          <Text style={s.zeroText}>Zero Cloud Storage · 100% Private</Text>
        </View>

        <TouchableOpacity 
           style={s.upgradeCard} 
           onPress={() => !isPro && router.push("/paywall")}
           activeOpacity={0.8}
        >
          <View style={{ flex: 1 }}>
            <Text style={s.upgradeTitle}>{isPro ? "PortfolioLite PRO" : "Upgrade to PRO"}</Text>
            <Text style={s.upgradeSub}>
              {isPro ? "Unlimited assets & history enabled" : "Unlimited assets, CSV export & charts"}
            </Text>
          </View>
          {!isPro && (
            <View style={s.upgradeBtn}>
              <Text style={s.upgradeBtnText}>₹49</Text>
            </View>
          )}
        </TouchableOpacity>

        <Text style={s.sectionLabel}>DATA & SECURITY</Text>
        <View style={s.section}>
          <Row 
             icon={<Download color={C.text2} size={18} />} 
             label="Export Portfolio (CSV)" 
             onPress={handleExportCSV} 
          />
          <Row 
             icon={<Shield color={C.text2} size={18} />} 
             label="Restore Purchase" 
             onPress={() => router.push("/paywall")}
          />
          <Row 
             icon={<Trash2 color="#EF4444" size={18} />} 
             label="Delete All Data" 
             color="#EF4444"
             onPress={handleDeleteAllData}
             showChevron={false}
          />
        </View>

        <Text style={s.sectionLabel}>PRIVACY & LOCK</Text>
        <View style={s.section}>
          <View style={s.row}>
            <View style={s.rowLeft}>
              <View style={s.iconWrap}><Shield color={C.text2} size={18} /></View>
              <Text style={s.rowLabel}>Biometric Lock</Text>
            </View>
            <Switch
              value={isEnabled}
              onValueChange={(val) => val ? enable() : disable()}
              trackColor={{ false: "#1f2937", true: C.teal }}
              thumbColor={Platform.OS === "ios" ? "#fff" : (isEnabled ? "#fff" : "#94a3b8")}
              disabled={!isAvailable}
            />
          </View>
          <Row icon={<FileText color={C.text2} size={18} />} label="Privacy Policy" onPress={handlePrivacy} />
        </View>

        <Text style={s.sectionLabel}>ABOUT</Text>
        <View style={s.section}>
          <Row 
             icon={<Star color={C.text2} size={18} />} 
             label="Rate the App ⭐" 
             onPress={handleRateApp}
          />
          <Row icon={<Info color={C.text2} size={18} />} label="App Version" value="1.1.2" showChevron={false} />
        </View>
      </ScrollView>

      <ConfirmModal
        visible={modalConfig.visible}
        title={modalConfig.title}
        message={modalConfig.message}
        onConfirm={modalConfig.onConfirm}
        onCancel={hideModal}
        confirmLabel={modalConfig.confirmLabel}
        isDanger={modalConfig.isDanger}
        showCancel={modalConfig.showCancel}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:               { flex: 1, backgroundColor: C.navy },
  title:              { fontSize: 24, fontWeight: "800", color: C.text1, paddingHorizontal: 18, paddingTop: 10, marginBottom: 16 },
  zeroBadge:          { flexDirection: "row", alignItems: "center", gap: 8, marginHorizontal: 18, marginBottom: 16, padding: 12, backgroundColor: "rgba(0,212,180,0.05)", borderRadius: 12, borderWidth: 1, borderColor: "rgba(0,212,180,0.1)" },
  zeroText:           { fontSize: 11, color: C.teal, fontWeight: "700", letterSpacing: 0.5, textTransform: "uppercase" },
  upgradeCard:        { marginHorizontal: 18, marginBottom: 24, backgroundColor: C.blue, borderRadius: 20, padding: 22, flexDirection: "row", alignItems: "center", gap: 16, elevation: 4, shadowColor: C.blue, shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width:0, height:4 } },
  upgradeTitle:       { fontSize: 18, fontWeight: "900", color: "#fff", marginBottom: 4 },
  upgradeSub:         { fontSize: 13, color: "rgba(255,255,255,0.85)", lineHeight: 18 },
  upgradeBtn:         { backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.3)" },
  upgradeBtnText:     { color: "#fff", fontWeight: "900", fontSize: 15 },
  sectionLabel:       { fontSize: 10, fontWeight: "800", color: C.text3, letterSpacing: 1.5, marginLeft: 22, marginBottom: 10, textTransform: "uppercase" },
  section:            { marginHorizontal: 18, backgroundColor: C.card, borderRadius: 20, overflow: "hidden", borderWidth: 1, borderColor: C.border, marginBottom: 26 },
  row:                { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.border },
  rowLeft:            { flexDirection: "row", alignItems: "center", gap: 12 },
  iconWrap:           { width: 34, height: 34, borderRadius: 10, backgroundColor: C.card2, alignItems: "center", justifyContent: "center" },
  rowLabel:           { fontSize: 14, color: C.text1, fontWeight: "600" },
  rowRight:           { flexDirection: "row", alignItems: "center", gap: 8 },
  rowValue:           { fontSize: 13, color: C.text3, fontWeight: "500" },
});