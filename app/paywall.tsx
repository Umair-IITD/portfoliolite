import {
  View, Text, TouchableOpacity, StyleSheet, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { X, Lock, Check } from "lucide-react-native";

const C = {
  navy: "#0A0F1E", card: "#111827",
  blue: "#3B82F6", text1: "#F1F5F9",
  text2: "#94A3B8", text3: "#64748B",
  border: "rgba(255,255,255,0.07)",
};

const BENEFITS = [
  { title: "Unlimited assets",          sub: "Track everything you own"          },
  { title: "Net worth history chart",   sub: "See how your wealth grows over time" },
  { title: "CSV export",                sub: "Your data, always portable"         },
  { title: "All future updates",        sub: "Free forever after unlock"          },
];

export default function PaywallScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={s.safe}>
      {/* Close */}
      <TouchableOpacity style={s.closeBtn} onPress={() => router.back()}>
        <X color={C.text2} size={20} />
      </TouchableOpacity>

      {/* Lock icon */}
      <View style={s.lockCircle}>
        <Lock color={C.blue} size={30} />
      </View>

      {/* Headline */}
      <Text style={s.title}>Unlock unlimited{"\n"}tracking</Text>
      <Text style={s.sub}>One payment. No subscription.{"\n"}No surprises — ever.</Text>

      {/* Benefits card */}
      <View style={s.benefitCard}>
        {BENEFITS.map((b, i) => (
          <View key={i} style={[s.benefitRow, i < BENEFITS.length - 1 && s.benefitBorder]}>
            <View style={s.checkCircle}>
              <Check color="#fff" size={12} strokeWidth={3} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.benefitTitle}>{b.title}</Text>
              <Text style={s.benefitSub}>{b.sub}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* CTA */}
      <TouchableOpacity
        style={s.unlockBtn}
        onPress={() => Alert.alert("Purchase", "Google Play purchase sheet opens here (RevenueCat wired in step 08).")}
      >
        <Text style={s.unlockBtnText}>Unlock for ₹49</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => Alert.alert("Restore", "Checking previous purchases…")}>
        <Text style={s.restoreText}>Restore previous purchase</Text>
      </TouchableOpacity>

      <Text style={s.disclaimer}>One-time purchase via Google Play · No subscription</Text>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: C.navy, alignItems: "center", paddingTop: 16 },
  closeBtn:      { alignSelf: "flex-end", marginRight: 18, width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.07)", alignItems: "center", justifyContent: "center", marginBottom: 28 },
  lockCircle:    { width: 72, height: 72, borderRadius: 36, backgroundColor: "rgba(59,130,246,0.12)", borderWidth: 1, borderColor: "rgba(59,130,246,0.25)", alignItems: "center", justifyContent: "center", marginBottom: 20 },
  title:         { fontSize: 26, fontWeight: "800", color: C.text1, textAlign: "center", lineHeight: 32, marginBottom: 10 },
  sub:           { fontSize: 14, color: C.text3, textAlign: "center", lineHeight: 20, marginBottom: 28 },
  benefitCard:   { width: "88%", backgroundColor: C.card, borderRadius: 16, borderWidth: 1, borderColor: C.border, marginBottom: 28 },
  benefitRow:    { flexDirection: "row", alignItems: "flex-start", padding: 14, gap: 12 },
  benefitBorder: { borderBottomWidth: 1, borderBottomColor: C.border },
  checkCircle:   { width: 22, height: 22, borderRadius: 11, backgroundColor: C.blue, alignItems: "center", justifyContent: "center", marginTop: 1 },
  benefitTitle:  { fontSize: 14, fontWeight: "600", color: C.text1, marginBottom: 2 },
  benefitSub:    { fontSize: 12, color: C.text3 },
  unlockBtn:     { width: "88%", paddingVertical: 16, backgroundColor: C.blue, borderRadius: 12, alignItems: "center", marginBottom: 14 },
  unlockBtnText: { fontSize: 17, fontWeight: "700", color: "#fff" },
  restoreText:   { fontSize: 13, color: C.text3, textDecorationLine: "underline", marginBottom: 14 },
  disclaimer:    { fontSize: 11, color: "#334155", textAlign: "center" },
});