// import {
//   View, Text, TouchableOpacity, StyleSheet,
//   ActivityIndicator, TextInput, Alert,
//   KeyboardAvoidingView, Platform, ScrollView, Linking,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { useRouter } from "expo-router";
// import { X, Lock, Check, Smartphone, CreditCard, ChevronRight } from "lucide-react-native";
// import { useState } from "react";
// import { usePurchases, RAZORPAY_PAYMENT_LINK } from "../src/hooks/usePurchases";

// const C = {
//   navy:   "#0A0F1E",
//   card:   "#111827",
//   card2:  "#1a2236",
//   teal:   "#00D4B4",
//   blue:   "#3B82F6",
//   gold:   "#F5A623",
//   green:  "#22C55E",
//   text1:  "#F1F5F9",
//   text2:  "#94A3B8",
//   text3:  "#64748B",
//   border: "rgba(255,255,255,0.07)",
// };

// const BENEFITS = [
//   { title: "Unlimited assets",         sub: "Track everything you own"            },
//   { title: "Net worth history chart",  sub: "See how your wealth grows over time" },
//   { title: "CSV export",               sub: "Your data, always portable"          },
//   { title: "All future updates",       sub: "Free forever after unlock"           },
// ];

// // ─── Sub-screens ──────────────────────────────────────────────────
// type View = "main" | "upi_steps" | "code_entry";

// export default function PaywallScreen() {
//   const router  = useRouter();
//   const { isPro, isLoading, purchasePro, restorePro, verifyUpiCode } = usePurchases();

//   const [screen,      setScreen]      = useState<View>("main");
//   const [code,        setCode]        = useState("");
//   const [isVerifying, setIsVerifying] = useState(false);
//   const [codeError,   setCodeError]   = useState<string | null>(null);
//   const [codeSuccess, setCodeSuccess] = useState(false);

//   // Already pro — close immediately
//   if (isPro && !codeSuccess) {
//     router.back();
//     return null;
//   }

//   // ── UPI payment handler ─────────────────────────────────────────
//   async function handleUpiPay() {
//     try {
//       const supported = await Linking.canOpenURL(RAZORPAY_PAYMENT_LINK);
//       if (supported) {
//         await Linking.openURL(RAZORPAY_PAYMENT_LINK);
//         // After opening browser, show code entry
//         setScreen("code_entry");
//       } else {
//         Alert.alert("Cannot open link", "Please open this URL in your browser:\n\n" + RAZORPAY_PAYMENT_LINK);
//       }
//     } catch (e) {
//       Alert.alert("Error", "Could not open payment page. Please try again.");
//     }
//   }

//   // ── Code verification handler ───────────────────────────────────
//   async function handleVerifyCode() {
//     if (code.trim().length === 0) {
//       setCodeError("Please enter your 8-digit unlock code.");
//       return;
//     }
//     setIsVerifying(true);
//     setCodeError(null);
//     try {
//       const result = await verifyUpiCode(code);
//       if (result.success) {
//         setCodeSuccess(true);
//         // Show success for 1.5s then close
//         setTimeout(() => router.back(), 1500);
//       } else {
//         setCodeError(result.error ?? "Invalid code. Please try again.");
//       }
//     } finally {
//       setIsVerifying(false);
//     }
//   }

//   // ── Google Play handler ─────────────────────────────────────────
//   async function handleGooglePlay() {
//     await purchasePro();
//     if (!isLoading) router.back();
//   }

//   // ────────────────────────────────────────────────────────────────
//   // SCREEN: Code success
//   // ────────────────────────────────────────────────────────────────
//   if (codeSuccess) {
//     return (
//       <SafeAreaView style={s.safe}>
//         <View style={s.successWrap}>
//           <View style={s.successCircle}>
//             <Check color="#0A0F1E" size={40} strokeWidth={3} />
//           </View>
//           <Text style={s.successTitle}>You're Pro!</Text>
//           <Text style={s.successSub}>
//             Payment verified. All features unlocked forever.
//           </Text>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   // ────────────────────────────────────────────────────────────────
//   // SCREEN: Enter unlock code
//   // ────────────────────────────────────────────────────────────────
//   if (screen === "code_entry") {
//     return (
//       <KeyboardAvoidingView
//         style={{ flex: 1 }}
//         behavior={Platform.OS === "ios" ? "padding" : "height"}
//       >
//         <SafeAreaView style={s.safe}>
//           {/* Header */}
//           <View style={s.codeHeader}>
//             <TouchableOpacity
//               style={s.backBtn}
//               onPress={() => { setScreen("main"); setCodeError(null); setCode(""); }}
//             >
//               <Text style={s.backBtnText}>← Back</Text>
//             </TouchableOpacity>
//             <TouchableOpacity style={s.closeBtn} onPress={() => router.back()}>
//               <X color={C.text2} size={18} />
//             </TouchableOpacity>
//           </View>

//           <ScrollView contentContainerStyle={s.codeContent} keyboardShouldPersistTaps="handled">
//             {/* Icon */}
//             <View style={s.codeIconWrap}>
//               <Smartphone color={C.teal} size={32} />
//             </View>

//             <Text style={s.codeTitle}>Enter your unlock code</Text>
//             <Text style={s.codeSub}>
//               After paying via UPI, you will see an 8-digit code on the payment
//               confirmation page. Enter it below to unlock Pro.
//             </Text>

//             {/* Steps reminder */}
//             <View style={s.stepsCard}>
//               {[
//                 "Complete the UPI payment in your browser",
//                 "Note the 8-digit code shown on the success page",
//                 "Enter the code below",
//               ].map((step, i) => (
//                 <View key={i} style={s.stepRow}>
//                   <View style={s.stepNum}>
//                     <Text style={s.stepNumText}>{i + 1}</Text>
//                   </View>
//                   <Text style={s.stepText}>{step}</Text>
//                 </View>
//               ))}
//             </View>

//             {/* Code input */}
//             <View style={s.codeInputWrap}>
//               <TextInput
//                 style={[
//                   s.codeInput,
//                   codeError  && s.codeInputError,
//                   codeSuccess && s.codeInputSuccess,
//                 ]}
//                 value={code}
//                 onChangeText={(t) => { setCode(t.replace(/\D/g, "").slice(0, 8)); setCodeError(null); }}
//                 placeholder="12345678"
//                 placeholderTextColor={C.text3}
//                 keyboardType="number-pad"
//                 maxLength={8}
//                 autoFocus
//                 textAlign="center"
//               />
//               <Text style={s.codeInputHint}>{code.length}/8 digits</Text>
//             </View>

//             {/* Error */}
//             {codeError && (
//               <View style={s.errorBox}>
//                 <Text style={s.errorText}>{codeError}</Text>
//               </View>
//             )}

//             {/* Verify button */}
//             <TouchableOpacity
//               style={[s.verifyBtn, (isVerifying || code.length < 8) && s.verifyBtnDisabled]}
//               onPress={handleVerifyCode}
//               disabled={isVerifying || code.length < 8}
//             >
//               {isVerifying
//                 ? <ActivityIndicator color="#0A0F1E" size="small" />
//                 : <Text style={s.verifyBtnText}>Verify & Unlock</Text>
//               }
//             </TouchableOpacity>

//             {/* Re-open payment link */}
//             <TouchableOpacity style={s.reopenLink} onPress={handleUpiPay}>
//               <Text style={s.reopenLinkText}>Open payment page again</Text>
//             </TouchableOpacity>
//           </ScrollView>
//         </SafeAreaView>
//       </KeyboardAvoidingView>
//     );
//   }

//   // ────────────────────────────────────────────────────────────────
//   // SCREEN: Main paywall — two payment options
//   // ────────────────────────────────────────────────────────────────
//   return (
//     <SafeAreaView style={s.safe}>
//       {/* Close */}
//       <TouchableOpacity style={s.closeBtn} onPress={() => router.back()}>
//         <X color={C.text2} size={20} />
//       </TouchableOpacity>

//       <ScrollView
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={s.mainContent}
//       >
//         {/* Lock icon */}
//         <View style={s.lockCircle}>
//           <Lock color={C.blue} size={30} />
//         </View>

//         {/* Headline */}
//         <Text style={s.title}>Unlock unlimited{"\n"}tracking</Text>
//         <Text style={s.sub}>One payment. No subscription.{"\n"}No surprises — ever.</Text>

//         {/* Benefits card */}
//         <View style={s.benefitCard}>
//           {BENEFITS.map((b, i) => (
//             <View key={i} style={[s.benefitRow, i < BENEFITS.length - 1 && s.benefitBorder]}>
//               <View style={s.checkCircle}>
//                 <Check color="#fff" size={12} strokeWidth={3} />
//               </View>
//               <View style={{ flex: 1 }}>
//                 <Text style={s.benefitTitle}>{b.title}</Text>
//                 <Text style={s.benefitSub}>{b.sub}</Text>
//               </View>
//             </View>
//           ))}
//         </View>

//         {/* ── Payment options ── */}
//         <Text style={s.payLabel}>CHOOSE HOW TO PAY</Text>

//         {/* Option 1 — UPI (recommended) */}
//         <TouchableOpacity style={s.payOptionPrimary} onPress={handleUpiPay}>
//           <View style={s.payOptionLeft}>
//             <View style={[s.payIconCircle, { backgroundColor: "rgba(0,212,180,0.12)" }]}>
//               <Smartphone color={C.teal} size={20} />
//             </View>
//             <View>
//               <View style={s.payTitleRow}>
//                 <Text style={s.payTitle}>Pay via UPI</Text>
//                 <View style={s.recommendedBadge}>
//                   <Text style={s.recommendedText}>RECOMMENDED</Text>
//                 </View>
//               </View>
//               <Text style={s.paySub}>PhonePe · Google Pay · Paytm · BHIM</Text>
//               <Text style={s.payPrice}>₹45</Text>
//             </View>
//           </View>
//           <ChevronRight color={C.teal} size={18} />
//         </TouchableOpacity>

//         {/* Divider */}
//         <View style={s.dividerRow}>
//           <View style={s.dividerLine} />
//           <Text style={s.dividerText}>or</Text>
//           <View style={s.dividerLine} />
//         </View>

//         {/* Option 2 — Google Play */}
//         <TouchableOpacity style={s.payOptionSecondary} onPress={handleGooglePlay}>
//           <View style={s.payOptionLeft}>
//             <View style={[s.payIconCircle, { backgroundColor: "rgba(59,130,246,0.12)" }]}>
//               <CreditCard color={C.blue} size={20} />
//             </View>
//             <View>
//               <Text style={s.payTitle}>Pay via Google Play</Text>
//               <Text style={s.paySub}>Credit / Debit card · UPI (Google Pay)</Text>
//               <Text style={s.payPrice}>₹49</Text>
//             </View>
//           </View>
//           <ChevronRight color={C.text3} size={18} />
//         </TouchableOpacity>

//         {/* Already paid via UPI */}
//         <TouchableOpacity
//           style={s.alreadyPaid}
//           onPress={() => setScreen("code_entry")}
//         >
//           <Text style={s.alreadyPaidText}>
//             Already paid via UPI? Enter your unlock code →
//           </Text>
//         </TouchableOpacity>

//         {/* Restore */}
//         <TouchableOpacity
//           style={s.restoreBtn}
//           onPress={() => restorePro()}
//         >
//           <Text style={s.restoreText}>Restore Google Play purchase</Text>
//         </TouchableOpacity>

//         <Text style={s.disclaimer}>
//           UPI payment processed by Razorpay · Google Play billing for card payments
//         </Text>
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// const s = StyleSheet.create({
//   safe:               { flex: 1, backgroundColor: C.navy },

//   // ── Shared ──────────────────────────────────────────────────────
//   closeBtn:           { alignSelf: "flex-end", margin: 14, width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.07)", alignItems: "center", justifyContent: "center" },

//   // ── Main screen ─────────────────────────────────────────────────
//   mainContent:        { paddingHorizontal: 20, paddingBottom: 40, alignItems: "center" },
//   lockCircle:         { width: 72, height: 72, borderRadius: 36, backgroundColor: "rgba(59,130,246,0.12)", borderWidth: 1, borderColor: "rgba(59,130,246,0.25)", alignItems: "center", justifyContent: "center", marginBottom: 20, marginTop: 4 },
//   title:              { fontSize: 26, fontWeight: "800", color: C.text1, textAlign: "center", lineHeight: 32, marginBottom: 10 },
//   sub:                { fontSize: 14, color: C.text3, textAlign: "center", lineHeight: 20, marginBottom: 24 },

//   benefitCard:        { width: "100%", backgroundColor: C.card, borderRadius: 16, borderWidth: 1, borderColor: C.border, marginBottom: 24 },
//   benefitRow:         { flexDirection: "row", alignItems: "flex-start", padding: 14, gap: 12 },
//   benefitBorder:      { borderBottomWidth: 1, borderBottomColor: C.border },
//   checkCircle:        { width: 22, height: 22, borderRadius: 11, backgroundColor: C.blue, alignItems: "center", justifyContent: "center", marginTop: 1 },
//   benefitTitle:       { fontSize: 14, fontWeight: "600", color: C.text1, marginBottom: 2 },
//   benefitSub:         { fontSize: 12, color: C.text3 },

//   payLabel:           { fontSize: 11, fontWeight: "600", letterSpacing: 1, color: C.text3, alignSelf: "flex-start", marginBottom: 10 },

//   // UPI option (primary, highlighted)
//   payOptionPrimary:   { width: "100%", flexDirection: "row", alignItems: "center", backgroundColor: C.card, borderRadius: 14, padding: 16, borderWidth: 1.5, borderColor: C.teal, marginBottom: 0 },
//   // Google Play option (secondary)
//   payOptionSecondary: { width: "100%", flexDirection: "row", alignItems: "center", backgroundColor: C.card, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: C.border },

//   payOptionLeft:      { flex: 1, flexDirection: "row", alignItems: "center", gap: 14 },
//   payIconCircle:      { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
//   payTitleRow:        { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 3 },
//   payTitle:           { fontSize: 15, fontWeight: "700", color: C.text1 },
//   recommendedBadge:   { backgroundColor: "rgba(0,212,180,0.15)", borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
//   recommendedText:    { fontSize: 9, fontWeight: "700", color: C.teal, letterSpacing: 0.5 },
//   paySub:             { fontSize: 12, color: C.text3, marginBottom: 4 },
//   payPrice:           { fontSize: 18, fontWeight: "800", color: C.gold },

//   dividerRow:         { width: "100%", flexDirection: "row", alignItems: "center", gap: 12, marginVertical: 14 },
//   dividerLine:        { flex: 1, height: 1, backgroundColor: C.border },
//   dividerText:        { fontSize: 13, color: C.text3 },

//   alreadyPaid:        { marginTop: 20, paddingVertical: 10 },
//   alreadyPaidText:    { fontSize: 13, color: C.teal, textDecorationLine: "underline", textAlign: "center" },
//   restoreBtn:         { paddingVertical: 8 },
//   restoreText:        { fontSize: 13, color: C.text3, textDecorationLine: "underline", textAlign: "center" },
//   disclaimer:         { fontSize: 11, color: "#334155", textAlign: "center", marginTop: 16, lineHeight: 16 },

//   // ── Code entry screen ────────────────────────────────────────────
//   codeHeader:         { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 18, paddingTop: 4, paddingBottom: 8 },
//   backBtn:            { paddingVertical: 8, paddingHorizontal: 4 },
//   backBtnText:        { fontSize: 14, color: C.teal },
//   codeContent:        { paddingHorizontal: 20, paddingBottom: 40 },
//   codeIconWrap:       { width: 64, height: 64, borderRadius: 32, backgroundColor: "rgba(0,212,180,0.1)", alignItems: "center", justifyContent: "center", alignSelf: "center", marginBottom: 16, borderWidth: 1, borderColor: "rgba(0,212,180,0.2)" },
//   codeTitle:          { fontSize: 22, fontWeight: "700", color: C.text1, textAlign: "center", marginBottom: 10 },
//   codeSub:            { fontSize: 14, color: C.text3, textAlign: "center", lineHeight: 20, marginBottom: 20 },

//   stepsCard:          { backgroundColor: C.card, borderRadius: 12, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: C.border, gap: 14 },
//   stepRow:            { flexDirection: "row", alignItems: "flex-start", gap: 12 },
//   stepNum:            { width: 24, height: 24, borderRadius: 12, backgroundColor: C.teal, alignItems: "center", justifyContent: "center", flexShrink: 0 },
//   stepNumText:        { fontSize: 13, fontWeight: "700", color: "#0A0F1E" },
//   stepText:           { flex: 1, fontSize: 13, color: C.text2, lineHeight: 20 },

//   codeInputWrap:      { marginBottom: 12, alignItems: "center" },
//   codeInput:          { backgroundColor: C.card, borderWidth: 1.5, borderColor: C.border, borderRadius: 12, paddingHorizontal: 20, paddingVertical: 16, color: C.text1, fontSize: 32, fontWeight: "700", letterSpacing: 8, width: "100%", textAlign: "center" },
//   codeInputError:     { borderColor: "#EF4444" },
//   codeInputSuccess:   { borderColor: C.green },
//   codeInputHint:      { fontSize: 12, color: C.text3, marginTop: 6 },

//   errorBox:           { backgroundColor: "rgba(239,68,68,0.1)", borderRadius: 8, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: "rgba(239,68,68,0.25)" },
//   errorText:          { fontSize: 13, color: "#EF4444", textAlign: "center" },

//   verifyBtn:          { backgroundColor: C.teal, paddingVertical: 15, borderRadius: 12, alignItems: "center", marginBottom: 14 },
//   verifyBtnDisabled:  { opacity: 0.45 },
//   verifyBtnText:      { fontSize: 16, fontWeight: "700", color: "#0A0F1E" },
//   reopenLink:         { alignItems: "center", paddingVertical: 8 },
//   reopenLinkText:     { fontSize: 13, color: C.text3, textDecorationLine: "underline" },

//   // ── Success screen ───────────────────────────────────────────────
//   successWrap:        { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 },
//   successCircle:      { width: 88, height: 88, borderRadius: 44, backgroundColor: C.green, alignItems: "center", justifyContent: "center", marginBottom: 24 },
//   successTitle:       { fontSize: 28, fontWeight: "800", color: C.text1, marginBottom: 10 },
//   successSub:         { fontSize: 15, color: C.text3, textAlign: "center", lineHeight: 22 },
// });



































import {
  View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, TextInput, Alert,
  KeyboardAvoidingView, Platform, ScrollView, Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { X, Lock, Check, Smartphone, CreditCard, ChevronRight } from "lucide-react-native";
import { useState, useEffect } from "react";
import { usePurchases, RAZORPAY_PAYMENT_LINK } from "../src/hooks/usePurchases";

const C = {
  navy:   "#0A0F1E",
  card:   "#111827",
  card2:  "#1a2236",
  teal:   "#00D4B4",
  blue:   "#3B82F6",
  gold:   "#F5A623",
  green:  "#22C55E",
  red:    "#EF4444",
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

type ScreenView = "main" | "code_entry";

export default function PaywallScreen() {
  const router = useRouter();
  const { isPro, isLoading, purchasePro, restorePro, verifyUpiCode } = usePurchases();

  const [screen,      setScreen]      = useState<ScreenView>("main");
  const [code,        setCode]        = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [codeError,   setCodeError]   = useState<string | null>(null);
  const [codeSuccess, setCodeSuccess] = useState(false);

  // ── Fix: never call router.back() during render ──────────────────
  // Use useEffect so navigation happens AFTER render completes
  useEffect(() => {
    if (isPro && !codeSuccess) {
      router.back();
    }
  }, [isPro]);

  useEffect(() => {
    if (codeSuccess) {
      const timer = setTimeout(() => router.back(), 1500);
      return () => clearTimeout(timer);
    }
  }, [codeSuccess]);

  async function handleUpiPay() {
    try {
      const supported = await Linking.canOpenURL(RAZORPAY_PAYMENT_LINK);
      if (supported) {
        await Linking.openURL(RAZORPAY_PAYMENT_LINK);
      } else {
        Alert.alert("Cannot open link", "Please open in your browser:\n\n" + RAZORPAY_PAYMENT_LINK);
      }
      // Switch to code entry after opening payment page
      setScreen("code_entry");
    } catch {
      Alert.alert("Error", "Could not open payment page. Please try again.");
    }
  }

  async function handleVerifyCode() {
    if (code.trim().length === 0) {
      setCodeError("Please enter your 8-digit unlock code.");
      return;
    }
    setIsVerifying(true);
    setCodeError(null);
    try {
      const result = await verifyUpiCode(code);
      if (result.success) {
        setCodeSuccess(true);
      } else {
        setCodeError(result.error ?? "Invalid code. Please try again.");
      }
    } finally {
      setIsVerifying(false);
    }
  }

  async function handleGooglePlay() {
    await purchasePro();
  }

  // ── Success screen ───────────────────────────────────────────────
  if (codeSuccess) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.successWrap}>
          <View style={s.successCircle}>
            <Check color="#0A0F1E" size={40} strokeWidth={3} />
          </View>
          <Text style={s.successTitle}>You're Pro!</Text>
          <Text style={s.successSub}>Payment verified. All features unlocked forever.</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Code entry screen ────────────────────────────────────────────
  if (screen === "code_entry") {
    return (
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <SafeAreaView style={s.safe}>
          <View style={s.codeHeader}>
            <TouchableOpacity style={s.backBtn} onPress={() => { setScreen("main"); setCodeError(null); setCode(""); }}>
              <Text style={s.backBtnText}>← Back</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.closeBtn} onPress={() => router.back()}>
              <X color={C.text2} size={18} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={s.codeContent} keyboardShouldPersistTaps="handled">
            <View style={s.codeIconWrap}>
              <Smartphone color={C.teal} size={32} />
            </View>
            <Text style={s.codeTitle}>Enter your unlock code</Text>
            <Text style={s.codeSub}>
              After paying via UPI, you will receive an 8-digit code by email within 10 minutes. Enter it below.
            </Text>

            <View style={s.stepsCard}>
              {[
                "Complete the UPI payment in your browser",
                "Wait for the unlock code email (within 10 min)",
                "Enter the 8-digit code below",
              ].map((step, i) => (
                <View key={i} style={s.stepRow}>
                  <View style={s.stepNum}><Text style={s.stepNumText}>{i + 1}</Text></View>
                  <Text style={s.stepText}>{step}</Text>
                </View>
              ))}
            </View>

            <View style={s.codeInputWrap}>
              <TextInput
                style={[s.codeInput, codeError !== null && s.codeInputError]}
                value={code}
                onChangeText={(t) => { setCode(t.replace(/\D/g, "").slice(0, 8)); setCodeError(null); }}
                placeholder="12345678"
                placeholderTextColor={C.text3}
                keyboardType="number-pad"
                maxLength={8}
                autoFocus
                textAlign="center"
              />
              <Text style={s.codeInputHint}>{code.length}/8 digits</Text>
            </View>

            {codeError !== null && (
              <View style={s.errorBox}>
                <Text style={s.errorText}>{codeError}</Text>
              </View>
            )}

            <TouchableOpacity
              style={[s.verifyBtn, (isVerifying || code.length < 8) && s.verifyBtnDisabled]}
              onPress={handleVerifyCode}
              disabled={isVerifying || code.length < 8}
            >
              {isVerifying
                ? <ActivityIndicator color="#0A0F1E" size="small" />
                : <Text style={s.verifyBtnText}>Verify & Unlock</Text>
              }
            </TouchableOpacity>

            <TouchableOpacity style={s.reopenLink} onPress={handleUpiPay}>
              <Text style={s.reopenLinkText}>Open payment page again</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    );
  }

  // ── Main paywall — original beautiful UI restored ────────────────
  return (
    <SafeAreaView style={s.safe}>
      {/* Close button */}
      <TouchableOpacity style={s.closeBtn} onPress={() => router.back()}>
        <X color={C.text2} size={20} />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.mainContent}>

        {/* Lock icon in blue circle — original design */}
        <View style={s.lockCircle}>
          <Lock color={C.blue} size={30} />
        </View>

        {/* Headline */}
        <Text style={s.title}>Unlock unlimited{"\n"}tracking</Text>
        <Text style={s.sub}>One payment. No subscription.{"\n"}No surprises — ever.</Text>

        {/* Benefits white card */}
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

        {/* Payment options label */}
        <Text style={s.payLabel}>CHOOSE HOW TO PAY</Text>

        {/* UPI — recommended, teal border */}
        <TouchableOpacity style={s.payOptionPrimary} onPress={handleUpiPay}>
          <View style={s.payOptionLeft}>
            <View style={[s.payIconCircle, { backgroundColor: "rgba(0,212,180,0.12)" }]}>
              <Smartphone color={C.teal} size={20} />
            </View>
            <View>
              <View style={s.payTitleRow}>
                <Text style={s.payTitle}>Pay via UPI</Text>
                <View style={s.recommendedBadge}>
                  <Text style={s.recommendedText}>RECOMMENDED</Text>
                </View>
              </View>
              <Text style={s.paySub}>PhonePe · Google Pay · Paytm · BHIM</Text>
              <Text style={s.payPrice}>₹45</Text>
            </View>
          </View>
          <ChevronRight color={C.teal} size={18} />
        </TouchableOpacity>

        {/* Divider */}
        <View style={s.dividerRow}>
          <View style={s.dividerLine} />
          <Text style={s.dividerText}>or</Text>
          <View style={s.dividerLine} />
        </View>

        {/* Google Play */}
        <TouchableOpacity style={s.payOptionSecondary} onPress={handleGooglePlay} disabled={isLoading}>
          <View style={s.payOptionLeft}>
            <View style={[s.payIconCircle, { backgroundColor: "rgba(59,130,246,0.12)" }]}>
              <CreditCard color={C.blue} size={20} />
            </View>
            <View>
              <Text style={s.payTitle}>Pay via Google Play</Text>
              <Text style={s.paySub}>Credit / Debit card · UPI (Google Pay)</Text>
              <Text style={s.payPrice}>₹49</Text>
            </View>
          </View>
          {isLoading
            ? <ActivityIndicator color={C.text3} size="small" />
            : <ChevronRight color={C.text3} size={18} />
          }
        </TouchableOpacity>

        {/* Already paid link */}
        <TouchableOpacity style={s.alreadyPaid} onPress={() => setScreen("code_entry")}>
          <Text style={s.alreadyPaidText}>Already paid via UPI? Enter your unlock code →</Text>
        </TouchableOpacity>

        {/* Restore */}
        <TouchableOpacity style={s.restoreBtn} onPress={() => restorePro()}>
          <Text style={s.restoreText}>Restore Google Play purchase</Text>
        </TouchableOpacity>

        <Text style={s.disclaimer}>
          UPI processed by Razorpay · Google Play billing for card payments
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:               { flex: 1, backgroundColor: C.navy },
  closeBtn:           { alignSelf: "flex-end", margin: 14, width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.07)", alignItems: "center", justifyContent: "center" },

  // Main screen
  mainContent:        { paddingHorizontal: 20, paddingBottom: 40, alignItems: "center" },
  lockCircle:         { width: 72, height: 72, borderRadius: 36, backgroundColor: "rgba(59,130,246,0.12)", borderWidth: 1, borderColor: "rgba(59,130,246,0.25)", alignItems: "center", justifyContent: "center", marginBottom: 20, marginTop: 4 },
  title:              { fontSize: 26, fontWeight: "800", color: C.text1, textAlign: "center", lineHeight: 32, marginBottom: 10 },
  sub:                { fontSize: 14, color: C.text3, textAlign: "center", lineHeight: 20, marginBottom: 24 },

  benefitCard:        { width: "100%", backgroundColor: C.card, borderRadius: 16, borderWidth: 1, borderColor: C.border, marginBottom: 24 },
  benefitRow:         { flexDirection: "row", alignItems: "flex-start", padding: 14, gap: 12 },
  benefitBorder:      { borderBottomWidth: 1, borderBottomColor: C.border },
  checkCircle:        { width: 22, height: 22, borderRadius: 11, backgroundColor: C.blue, alignItems: "center", justifyContent: "center", marginTop: 1 },
  benefitTitle:       { fontSize: 14, fontWeight: "600", color: C.text1, marginBottom: 2 },
  benefitSub:         { fontSize: 12, color: C.text3 },

  payLabel:           { fontSize: 11, fontWeight: "600", letterSpacing: 1, color: C.text3, alignSelf: "flex-start", marginBottom: 10 },
  payOptionPrimary:   { width: "100%", flexDirection: "row", alignItems: "center", backgroundColor: C.card, borderRadius: 14, padding: 16, borderWidth: 1.5, borderColor: C.teal, marginBottom: 0 },
  payOptionSecondary: { width: "100%", flexDirection: "row", alignItems: "center", backgroundColor: C.card, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: C.border },
  payOptionLeft:      { flex: 1, flexDirection: "row", alignItems: "center", gap: 14 },
  payIconCircle:      { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  payTitleRow:        { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 3 },
  payTitle:           { fontSize: 15, fontWeight: "700", color: C.text1 },
  recommendedBadge:   { backgroundColor: "rgba(0,212,180,0.15)", borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  recommendedText:    { fontSize: 9, fontWeight: "700", color: C.teal, letterSpacing: 0.5 },
  paySub:             { fontSize: 12, color: C.text3, marginBottom: 4 },
  payPrice:           { fontSize: 18, fontWeight: "800", color: C.gold },
  dividerRow:         { width: "100%", flexDirection: "row", alignItems: "center", gap: 12, marginVertical: 14 },
  dividerLine:        { flex: 1, height: 1, backgroundColor: C.border },
  dividerText:        { fontSize: 13, color: C.text3 },
  alreadyPaid:        { marginTop: 20, paddingVertical: 10 },
  alreadyPaidText:    { fontSize: 13, color: C.teal, textDecorationLine: "underline", textAlign: "center" },
  restoreBtn:         { paddingVertical: 8 },
  restoreText:        { fontSize: 13, color: C.text3, textDecorationLine: "underline", textAlign: "center" },
  disclaimer:         { fontSize: 11, color: "#334155", textAlign: "center", marginTop: 16, lineHeight: 16 },

  // Code entry screen
  codeHeader:         { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 18, paddingTop: 4, paddingBottom: 8 },
  backBtn:            { paddingVertical: 8, paddingHorizontal: 4 },
  backBtnText:        { fontSize: 14, color: C.teal },
  codeContent:        { paddingHorizontal: 20, paddingBottom: 40 },
  codeIconWrap:       { width: 64, height: 64, borderRadius: 32, backgroundColor: "rgba(0,212,180,0.1)", alignItems: "center", justifyContent: "center", alignSelf: "center", marginBottom: 16, borderWidth: 1, borderColor: "rgba(0,212,180,0.2)" },
  codeTitle:          { fontSize: 22, fontWeight: "700", color: C.text1, textAlign: "center", marginBottom: 10 },
  codeSub:            { fontSize: 14, color: C.text3, textAlign: "center", lineHeight: 20, marginBottom: 20 },
  stepsCard:          { backgroundColor: C.card, borderRadius: 12, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: C.border, gap: 14 },
  stepRow:            { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  stepNum:            { width: 24, height: 24, borderRadius: 12, backgroundColor: C.teal, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  stepNumText:        { fontSize: 13, fontWeight: "700", color: "#0A0F1E" },
  stepText:           { flex: 1, fontSize: 13, color: C.text2, lineHeight: 20 },
  codeInputWrap:      { marginBottom: 12, alignItems: "center" },
  codeInput:          { backgroundColor: C.card, borderWidth: 1.5, borderColor: C.border, borderRadius: 12, paddingHorizontal: 20, paddingVertical: 16, color: C.text1, fontSize: 32, fontWeight: "700", letterSpacing: 8, width: "100%", textAlign: "center" },
  codeInputError:     { borderColor: C.red },
  codeInputHint:      { fontSize: 12, color: C.text3, marginTop: 6 },
  errorBox:           { backgroundColor: "rgba(239,68,68,0.1)", borderRadius: 8, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: "rgba(239,68,68,0.25)" },
  errorText:          { fontSize: 13, color: C.red, textAlign: "center" },
  verifyBtn:          { backgroundColor: C.teal, paddingVertical: 15, borderRadius: 12, alignItems: "center", marginBottom: 14 },
  verifyBtnDisabled:  { opacity: 0.45 },
  verifyBtnText:      { fontSize: 16, fontWeight: "700", color: "#0A0F1E" },
  reopenLink:         { alignItems: "center", paddingVertical: 8 },
  reopenLinkText:     { fontSize: 13, color: C.text3, textDecorationLine: "underline" },

  // Success screen
  successWrap:        { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 },
  successCircle:      { width: 88, height: 88, borderRadius: 44, backgroundColor: C.green, alignItems: "center", justifyContent: "center", marginBottom: 24 },
  successTitle:       { fontSize: 28, fontWeight: "800", color: C.text1, marginBottom: 10 },
  successSub:         { fontSize: 15, color: C.text3, textAlign: "center", lineHeight: 22 },
});