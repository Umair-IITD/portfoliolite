import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronLeft, Shield, Lock, EyeOff, Scale } from "lucide-react-native";
import React from "react";

const C = {
  navy:   "#0A0F1E",
  card:   "#111827",
  card2:  "#1a2236",
  teal:   "#00D4B4",
  blue:   "#3B82F6",
  text1:  "#F1F5F9",
  text2:  "#94A3B8",
  text3:  "#64748B",
  border: "rgba(255,255,255,0.07)",
};

const POLICY_SECTIONS = [
  {
    icon: <Lock color={C.blue} size={20} />,
    title: "Data Ownership",
    content: "All your portfolio data—including asset names, quantities, and prices—is stored exclusively on your device's local database. We do not have any access to your data."
  },
  {
    icon: <EyeOff color={C.teal} size={20} />,
    title: "Zero Tracking",
    content: "PortfolioLite does not use trackers, analytics, or background services to monitor your activity. Your financial privacy is our top priority."
  },
  {
    icon: <Shield color={C.blue} size={20} />,
    title: "Security",
    content: "We use standard local encryption and biometric locking (if enabled) to secure your data on-device. No data is ever uploaded to a cloud server."
  },
  {
    icon: <Scale color={C.teal} size={20} />,
    title: "Payments",
    content: "Transactions are handled by Razorpay. We do not store your credit card or bank details. For Pro status verification, only a unique device identifier and a redemption code are used."
  }
];

export default function PrivacyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[s.outer, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <ChevronLeft color={C.text1} size={24} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={s.scrollContent}
      >
        <View style={s.hero}>
          <View style={s.shieldCircle}>
            <Shield color={C.teal} size={40} />
          </View>
          <Text style={s.heroTitle}>Your Private Portfolio</Text>
          <Text style={s.heroSub}>Built on local storage. Focused on privacy.</Text>
        </View>

        {POLICY_SECTIONS.map((section, i) => (
          <View key={i} style={s.section}>
            <View style={s.sectionHeader}>
              <View style={s.sectionIcon}>{section.icon}</View>
              <Text style={s.sectionTitle}>{section.title}</Text>
            </View>
            <Text style={s.sectionText}>{section.content}</Text>
          </View>
        ))}

        <View style={s.footer}>
          <Text style={s.footerText}>Last Updated: March 20, 2026</Text>
          <Text style={s.footerText}>Version 1.1.2</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  outer:              { flex: 1, backgroundColor: C.navy },
  header:             { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, height: 60, borderBottomWidth: 1, borderBottomColor: C.border },
  backBtn:            { width: 40, height: 40, alignItems: "center", justifyContent: "center", borderRadius: 20, backgroundColor: C.card2 },
  headerTitle:        { fontSize: 18, fontWeight: "800", color: C.text1 },
  scrollContent:      { padding: 20 },
  hero:               { alignItems: "center", marginBottom: 32, marginTop: 10 },
  shieldCircle:       { width: 80, height: 80, borderRadius: 40, backgroundColor: "rgba(0,212,180,0.1)", alignItems: "center", justifyContent: "center", marginBottom: 16, borderWidth: 1, borderColor: "rgba(0,212,180,0.2)" },
  heroTitle:          { fontSize: 22, fontWeight: "800", color: C.text1, marginBottom: 6 },
  heroSub:            { fontSize: 14, color: C.text3, textAlign: "center" },
  section:            { backgroundColor: C.card, borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: C.border },
  sectionHeader:      { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  sectionIcon:        { width: 40, height: 40, borderRadius: 12, backgroundColor: C.card2, alignItems: "center", justifyContent: "center" },
  sectionTitle:       { fontSize: 16, fontWeight: "700", color: C.text1 },
  sectionText:        { fontSize: 13, lineHeight: 20, color: C.text2 },
  footer:             { alignItems: "center", marginTop: 20, paddingBottom: 20 },
  footerText:         { fontSize: 11, color: "rgba(148,163,184,0.4)", marginBottom: 4 },
});
