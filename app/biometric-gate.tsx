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

function FingerprintIcon({ color = C.teal, size = 72 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 72 72" fill="none">
      {/* Outer ring */}
      <Circle cx="36" cy="36" r="32" stroke={color} strokeWidth="2.5" strokeOpacity="0.3" />
      {/* Middle ring */}
      <Circle cx="36" cy="36" r="22" stroke={color} strokeWidth="2" strokeOpacity="0.5" />
      {/* Fingerprint lines */}
      <Path d="M36 16 C24 16 14 25 14 36" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <Path d="M36 22 C27 22 20 28 20 36" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Path d="M36 28 C30 28 26 31.5 26 36" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Path d="M36 58 C48 58 58 49 58 38" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <Path d="M36 52 C45 52 52 46 52 38" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Path d="M36 46 C42 46 46 42 46 38" stroke={color} strokeWidth="2" strokeLinecap="round" />
      {/* Center dot */}
      <Circle cx="36" cy="36" r="3.5" fill={color} />
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
        setErrorMsg("Authentication failed. Try again.");
      }
    } finally {
      setIsAuthenticating(false);
    }
  }

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.content}>
        {/* Logo */}
        <Text style={s.logo}>
          <Text style={s.logoAccent}>Portfolio</Text>Lite
        </Text>

        {/* Fingerprint ring */}
        <View style={s.iconRing}>
          <FingerprintIcon color={C.teal} size={72} />
        </View>

        {/* Title */}
        <Text style={s.title}>Your wealth.</Text>
        <Text style={s.title}>Your device. Nobody else.</Text>
        <Text style={s.sub}>Touch the sensor to unlock PortfolioLite</Text>

        {/* Error */}
        {errorMsg && (
          <View style={s.errorBox}>
            <Text style={s.errorText}>{errorMsg}</Text>
          </View>
        )}

        {/* Unlock button */}
        <TouchableOpacity
          style={[s.unlockBtn, isAuthenticating && { opacity: 0.6 }]}
          onPress={handleUnlock}
          disabled={isAuthenticating}
        >
          {isAuthenticating ? (
            <ActivityIndicator color="#0A0F1E" size="small" />
          ) : (
            <Text style={s.unlockBtnText}>Unlock with Biometrics</Text>
          )}
        </TouchableOpacity>

        {/* Skip / no biometrics fallback */}
        <TouchableOpacity style={s.skipBtn} onPress={onSkip}>
          <Text style={s.skipText}>
            {isAvailable
              ? "Continue without biometrics"
              : "Biometrics not available — tap to continue"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:           { flex: 1, backgroundColor: C.navy },
  content:        { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 },
  logo:           { fontSize: 22, fontWeight: "800", color: C.text1, marginBottom: 48, letterSpacing: -0.5 },
  logoAccent:     { color: C.teal },
  iconRing:       { width: 120, height: 120, borderRadius: 60, borderWidth: 1.5, borderColor: "rgba(0,212,180,0.25)", alignItems: "center", justifyContent: "center", marginBottom: 32 },
  title:          { fontSize: 22, fontWeight: "700", color: C.text1, textAlign: "center", lineHeight: 30 },
  sub:            { fontSize: 14, color: C.text3, textAlign: "center", marginTop: 10, marginBottom: 36, lineHeight: 20 },
  errorBox:       { backgroundColor: "rgba(239,68,68,0.1)", borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10, marginBottom: 16, borderWidth: 1, borderColor: "rgba(239,68,68,0.25)" },
  errorText:      { fontSize: 13, color: "#EF4444", textAlign: "center" },
  unlockBtn:      { backgroundColor: C.teal, paddingVertical: 15, paddingHorizontal: 48, borderRadius: 12, marginBottom: 16, minWidth: 240, alignItems: "center" },
  unlockBtnText:  { fontSize: 16, fontWeight: "700", color: "#0A0F1E" },
  skipBtn:        { paddingVertical: 10, paddingHorizontal: 24 },
  skipText:       { fontSize: 13, color: C.text3, textAlign: "center" },
});