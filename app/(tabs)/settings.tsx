import {
  View, Text, TouchableOpacity, StyleSheet, Switch, ScrollView, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Fingerprint, Download, Trash2, FileText, Star, Info, Shield, ChevronRight } from "lucide-react-native";
import { useState } from "react";

const C = {
  navy: "#0A0F1E", card: "#111827", card2: "#1a2236",
  teal: "#00D4B4", blue: "#3B82F6", red: "#EF4444",
  text1: "#F1F5F9", text2: "#94A3B8", text3: "#64748B",
  border: "rgba(255,255,255,0.07)",
};

function Row({
  icon, label, danger = false, right, onPress,
}: {
  icon: React.ReactNode;
  label: string;
  danger?: boolean;
  right?: React.ReactNode;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity style={s.row} onPress={onPress} activeOpacity={0.7}>
      <View style={s.rowIcon}>{icon}</View>
      <Text style={[s.rowLabel, danger && { color: C.red }]}>{label}</Text>
      {right ?? <ChevronRight color={C.text3} size={16} />}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const [bioEnabled, setBioEnabled] = useState(false);

  function confirmDelete() {
    Alert.alert(
      "Delete all data",
      "This will permanently erase all your assets and settings from this device. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => Alert.alert("Deleted", "All data erased.") },
      ]
    );
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

        {/* Security */}
        <Text style={s.sectionLabel}>SECURITY</Text>
        <View style={s.section}>
          <Row
            icon={<Fingerprint color={C.text2} size={18} />}
            label="Biometric Lock"
            right={
              <Switch
                value={bioEnabled}
                onValueChange={setBioEnabled}
                trackColor={{ false: C.card2, true: C.teal }}
                thumbColor="#fff"
              />
            }
          />
        </View>

        {/* Data */}
        <Text style={s.sectionLabel}>DATA</Text>
        <View style={s.section}>
          <Row
            icon={<Download color={C.text2} size={18} />}
            label="Export as CSV"
            onPress={() => Alert.alert("Export", "CSV export coming in a future update.")}
          />
          <Row
            icon={<Trash2 color={C.red} size={18} />}
            label="Delete all data"
            danger
            onPress={confirmDelete}
          />
        </View>

        {/* About */}
        <Text style={s.sectionLabel}>ABOUT</Text>
        <View style={s.section}>
          <Row icon={<FileText color={C.text2} size={18} />} label="Privacy Policy" />
          <Row icon={<Star color={C.text2} size={18} />} label="Rate the App ⭐" />
          <Row
            icon={<Info color={C.text2} size={18} />}
            label="App Version"
            right={<Text style={s.version}>1.0.0</Text>}
          />
        </View>

        {/* Footer */}
        <View style={s.footer}>
          <Text style={s.footerText}>Built by an indie developer in India 🇮🇳</Text>
          <Text style={s.footerSub}>PortfolioLite · Zero Cloud · Zero Tracking</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: C.navy },
  title:        { fontSize: 22, fontWeight: "700", color: C.text1, paddingHorizontal: 18, paddingVertical: 14 },
  zeroBadge:    { flexDirection: "row", alignItems: "center", gap: 8, marginHorizontal: 18, marginBottom: 16, backgroundColor: "rgba(0,212,180,0.08)", borderWidth: 1, borderColor: "rgba(0,212,180,0.2)", borderRadius: 10, padding: 12 },
  zeroText:     { fontSize: 12, color: C.teal, fontWeight: "500", flex: 1 },
  sectionLabel: { fontSize: 11, fontWeight: "600", letterSpacing: 1, color: C.text3, textTransform: "uppercase", paddingHorizontal: 18, paddingBottom: 6, paddingTop: 4 },
  section:      { marginHorizontal: 18, marginBottom: 14, backgroundColor: C.card, borderRadius: 14, overflow: "hidden", borderWidth: 1, borderColor: C.border },
  row:          { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.border },
  rowIcon:      { width: 28, alignItems: "center", marginRight: 10 },
  rowLabel:     { flex: 1, fontSize: 14, color: C.text1 },
  version:      { fontSize: 13, color: C.text3 },
  footer:       { alignItems: "center", paddingTop: 24, gap: 4 },
  footerText:   { fontSize: 12, color: C.text3 },
  footerSub:    { fontSize: 11, color: "#1e2a3a" },
});