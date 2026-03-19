import {
  View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, ScrollView, TextInput,
  KeyboardAvoidingView, Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { X, Lock, Check, CreditCard, ChevronRight, Key } from "lucide-react-native";
import { usePurchases } from "../src/hooks/usePurchases";
import React, { useEffect, useState } from "react";
import { ConfirmModal } from "../src/components/ui/ConfirmModal";

const C = {
  navy:   "#0A0F1E",
  card:   "#111827",
  card2:  "#1a2236",
  teal:   "#00D4B4",
  blue:   "#3B82F6",
  gold:   "#F5A623",
  text1:  "#F1F5F9",
  text2:  "#94A3B8",
  text3:  "#64748B",
  border: "rgba(255,255,255,0.07)",
};

const BENEFITS = [
  { title: "Unlimited assets",         sub: "Track everything you own"            },
  { title: "Net worth history chart",  sub: "See how your wealth grows over time" },
  { title: "CSV export",               sub: "Your data, always portable"          },
  { title: "All future updates",       sub: "Free forever after unlock"           },
];

export default function PaywallScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isPro, isLoading, error, purchasePro, redeemCode } = usePurchases();
  const [code, setCode] = useState("");

  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState({ title: "", message: "", isDanger: false });

  useEffect(() => {
    if (isPro) router.back();
  }, [isPro]);

  async function handleRedeem() {
    if (code.length !== 8) {
      setModalContent({ title: "Invalid Code", message: "Please enter the 8-digit code.", isDanger: true });
      setModalVisible(true);
      return;
    }
    const success = await redeemCode(code);
    if (success) {
      setModalContent({ title: "Success!", message: "Premium features unlocked.", isDanger: false });
      setModalVisible(true);
    } else {
      setModalContent({ title: "Error", message: error || "Failed to redeem code.", isDanger: true });
      setModalVisible(true);
    }
  }

  return (
    <View style={[s.outer, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <TouchableOpacity style={s.closeBtn} onPress={() => router.back()}>
          <X color={C.text2} size={20} />
        </TouchableOpacity>

        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={s.mainContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={s.lockCircle}>
            <Lock color={C.blue} size={30} />
          </View>

          <Text style={s.title}>Unlock unlimited{"\n"}tracking</Text>
          <Text style={s.sub}>One payment. No subscription.{"\n"}No surprises — ever.</Text>

          <View style={s.benefitCard}>
            {BENEFITS.map((b, i) => (
              <View key={i} style={[s.benefitRow, i < BENEFITS.length - 1 && s.benefitBorder]}>
                <View style={s.checkCircle}><Check color="#fff" size={12} strokeWidth={3} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={s.benefitTitle}>{b.title}</Text>
                  <Text style={s.benefitSub}>{b.sub}</Text>
                </View>
              </View>
            ))}
          </View>

          <TouchableOpacity 
              style={s.purchaseBtn} 
              onPress={() => purchasePro()}
              disabled={isLoading}
          >
              <View style={s.purchaseLeft}>
                  <CreditCard color="#0A0F1E" size={20} />
                  <View>
                      <Text style={s.purchaseTitle}>Buy Lifetime Access</Text>
                      <Text style={s.purchasePrice}>₹49 (One-time)</Text>
                  </View>
              </View>
              <ChevronRight color="#0A0F1E" size={20} />
          </TouchableOpacity>

          <View style={s.redeemSection}>
              <Text style={s.redeemLabel}>ALREADY PURCHASED?</Text>
              <View style={s.codeRow}>
                  <View style={s.inputWrap}>
                      <Key color={C.text3} size={16} />
                      <TextInput 
                          style={s.codeInput}
                          placeholder="8-digit code"
                          placeholderTextColor={C.text3}
                          value={code}
                          onChangeText={setCode}
                          keyboardType="numeric"
                          maxLength={8}
                          autoCorrect={false}
                          disableFullscreenUI={true}
                      />
                  </View>
                  <TouchableOpacity 
                    style={[s.redeemBtn, (isLoading || code.length < 8) && { opacity: 0.7 }]} 
                    onPress={handleRedeem}
                    disabled={isLoading || code.length < 8}
                  >
                      {isLoading ? <ActivityIndicator color={C.navy} size="small" /> : <Text style={s.redeemBtnText}>Redeem</Text>}
                  </TouchableOpacity>
              </View>
          </View>
        </ScrollView>

        <ConfirmModal 
          visible={modalVisible}
          title={modalContent.title}
          message={modalContent.message}
          onConfirm={() => setModalVisible(false)}
          onCancel={() => setModalVisible(false)}
          confirmLabel="OK"
        />
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  outer:              { flex: 1, backgroundColor: C.navy },
  closeBtn:           { alignSelf: "flex-end", margin: 14, width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.07)", alignItems: "center", justifyContent: "center" },
  mainContent:        { paddingHorizontal: 20, paddingBottom: 60, alignItems: "center" },
  lockCircle:         { width: 72, height: 72, borderRadius: 36, backgroundColor: "rgba(59,130,246,0.12)", alignItems: "center", justifyContent: "center", marginBottom: 20 },
  title:              { fontSize: 26, fontWeight: "800", color: C.text1, textAlign: "center", marginBottom: 10 },
  sub:                { fontSize: 14, color: C.text3, textAlign: "center", marginBottom: 24 },
  benefitCard:        { width: "100%", backgroundColor: C.card, borderRadius: 20, borderWidth: 1, borderColor: C.border, marginBottom: 24 },
  benefitRow:         { flexDirection: "row", alignItems: "flex-start", padding: 14, gap: 12 },
  benefitBorder:      { borderBottomWidth: 1, borderBottomColor: C.border },
  checkCircle:        { width: 22, height: 22, borderRadius: 11, backgroundColor: C.blue, alignItems: "center", justifyContent: "center", marginTop: 1 },
  benefitTitle:       { fontSize: 14, fontWeight: "600", color: C.text1 },
  benefitSub:         { fontSize: 12, color: C.text3 },
  purchaseBtn:        { width: "100%", backgroundColor: C.teal, borderRadius: 16, padding: 18, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 32 },
  purchaseLeft:       { flexDirection: "row", alignItems: "center", gap: 14 },
  purchaseTitle:      { fontSize: 15, fontWeight: "800", color: "#0A0F1E" },
  purchasePrice:      { fontSize: 12, color: "rgba(10,15,30,0.6)" },
  redeemSection:      { width: "100%", gap: 12 },
  redeemLabel:        { fontSize: 10, fontWeight: "800", color: C.text3, letterSpacing: 1.5, textAlign: "center" },
  codeRow:            { flexDirection: "row", gap: 10, height: 52 },
  inputWrap:          { flex: 1, flexDirection: "row", alignItems: "center", backgroundColor: C.card, borderRadius: 12, borderWidth: 1, borderColor: C.border, paddingHorizontal: 12 },
  codeInput:          { flex: 1, height: "100%", color: C.text1, fontSize: 15, letterSpacing: 2 },
  redeemBtn:          { width: 100, height: "100%", backgroundColor: C.blue, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  redeemBtnText:      { color: "#fff", fontWeight: "700", fontSize: 14 },
});