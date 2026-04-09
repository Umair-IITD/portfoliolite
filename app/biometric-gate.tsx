import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path, Circle } from "react-native-svg";
import { useState } from "react";

const C = {
  navy: "#0A0F1E", card: "#111827",
  teal: "#00D4B4", blue: "#3B82F6",
  text1: "#F1F5F9", text2: "#94A3B8", text3: "#64748B",
};

// ─── Fingerprint SVG icon ─────────────────────────────────────────

function FingerprintIcon({ color = C.teal, size = 80 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 72 72" fill="none">
      {/* Outer ring */}
      <Circle cx="36" cy="36" r="32" stroke={color} strokeWidth="1.5" strokeOpacity="0.2" />
      {/* Middle ring */}
      <Circle cx="36" cy="36" r="24" stroke={color} strokeWidth="1" strokeOpacity="0.4" />
      {/* Fingerprint lines */}
      <Path d="M36 12 C22 12 10 23 10 36" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <Path d="M36 20 C27 20 18 28 18 36" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <Path d="M36 28 C30 28 26 31.5 26 36" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <Path d="M36 60 C50 60 62 48 62 36" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <Path d="M36 52 C45 52 54 44 54 36" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <Path d="M36 44 C41 44 46 40 46 36" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      {/* Center dot */}
      <Circle cx="36" cy="36" r="4" fill={color} />
    </Svg>
  );
}

// ─── Props ────────────────────────────────────────────────────────

interface BiometricGateProps {
  onAuthenticated: () => void;
  onSkip:          () => void;
  authenticate:    () => Promise<boolean>;
  isAvailable:     boolean;
}

// ─── Screen ──────────────────────────────────────────────────────

export default function BiometricGateScreen({
  onAuthenticated,
  onSkip,
  authenticate,
  isAvailable,
}: BiometricGateProps) {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [errorMsg,         setErrorMsg]         = useState<string | null>(null);

  async function handleUnlock() {
    setIsAuthenticating(true);
    setErrorMsg(null);
    try {
      const success = await authenticate();
      if (success) {
        onAuthenticated();
      } else {
        setErrorMsg("Authentication failed. Please try again.");
      }
    } finally {
      setIsAuthenticating(false);
    }
  }

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.content}>
        {/* Logo */}
        <View style={s.logoWrap}>
            <Text style={s.logo}>
                <Text style={s.logoAccent}>Portfolio</Text>Lite
            </Text>
            <View style={s.shieldBadge}>
                <Text style={s.shieldText}>PRIVATE</Text>
            </View>
        </View>

        {/* Lock Illustration */}
        <View style={s.illustration}>
            <View style={s.iconRing}>
                <FingerprintIcon color={C.teal} size={80} />
            </View>
            <View style={s.pingCircle} />
        </View>

        {/* Text */}
        <View style={s.textWrap}>
            <Text style={s.title}>Locked Dashboard</Text>
            <Text style={s.sub}>Touch the fingerprint sensor to unlock your private portfolio data.</Text>
        </View>

        {/* Error */}
        {errorMsg && (
          <View style={s.errorBox}>
            <Text style={s.errorText}>{errorMsg}</Text>
          </View>
        )}

        {/* Actions */}
        <View style={s.actions}>
            <TouchableOpacity
                style={[s.unlockBtn, isAuthenticating && { opacity: 0.7 }]}
                onPress={handleUnlock}
                disabled={isAuthenticating}
            >
                {isAuthenticating ? (
                    <ActivityIndicator color="#0A0F1E" size="small" />
                ) : (
                    <Text style={s.unlockBtnText}>Unlock Now</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity style={s.skipBtn} onPress={onSkip}>
                <Text style={s.skipText}>
                    {isAvailable
                    ? "Use Device Passcode Instead"
                    : "Use Device Passcode"}
                </Text>
            </TouchableOpacity>
        </View>

        <Text style={s.footerTip}>All biometric data is handled by your device's secure enclave and never stored by this app.</Text>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:           { flex: 1, backgroundColor: C.navy },
  content:        { flex: 1, alignItems: "center", justifyContent: "space-between", paddingHorizontal: 32, paddingVertical: 60 },
  
  logoWrap:       { alignItems: "center", gap: 8 },
  logo:           { fontSize: 24, fontWeight: "900", color: C.text1, letterSpacing: -0.5 },
  logoAccent:     { color: C.teal },
  shieldBadge:    { backgroundColor: "rgba(0,212,180,0.1)", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: "rgba(0,212,180,0.2)" },
  shieldText:     { fontSize: 10, fontWeight: "800", color: C.teal, letterSpacing: 1 },

  illustration:   { width: 160, height: 160, alignItems: "center", justifyContent: "center" },
  iconRing:       { width: 130, height: 130, borderRadius: 65, backgroundColor: "rgba(0,212,180,0.03)", borderWidth: 1, borderColor: "rgba(0,212,180,0.15)", alignItems: "center", justifyContent: "center", zIndex: 2 },
  pingCircle:     { position: "absolute", width: 150, height: 150, borderRadius: 75, borderWidth: 1, borderColor: "rgba(0,212,180,0.1)", opacity: 0.5 },

  textWrap:       { alignItems: "center" },
  title:          { fontSize: 26, fontWeight: "800", color: C.text1, textAlign: "center", marginBottom: 12 },
  sub:            { fontSize: 15, color: C.text3, textAlign: "center", lineHeight: 22 },
  
  errorBox:       { backgroundColor: "rgba(239,68,68,0.1)", borderRadius: 10, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1, borderColor: "rgba(239,68,68,0.25)", width: "100%" },
  errorText:      { fontSize: 13, color: "#EF4444", textAlign: "center", fontWeight: "600" },
  
  actions:        { width: "100%", gap: 12 },
  unlockBtn:      { backgroundColor: C.teal, paddingVertical: 18, borderRadius: 16, alignItems: "center", width: "100%", shadowColor: C.teal, shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width:0, height:5 } },
  unlockBtnText:  { fontSize: 16, fontWeight: "800", color: "#0A0F1E" },
  skipBtn:        { paddingVertical: 12, alignItems: "center" },
  skipText:       { fontSize: 14, color: C.text3, fontWeight: "500" },
  
  footerTip:      { fontSize: 11, color: "rgba(255,255,255,0.2)", textAlign: "center", lineHeight: 18 },
});