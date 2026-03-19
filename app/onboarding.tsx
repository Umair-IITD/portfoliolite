import {
  View, Text, StyleSheet, Dimensions,
  TouchableOpacity, ScrollView, NativeScrollEvent,
  NativeSyntheticEvent, Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Shield, TrendingUp, Zap, ChevronRight } from "lucide-react-native";
import { useState, useRef } from "react";
import { setSetting } from "../src/db/database";

const { width: SCREEN_W } = Dimensions.get("window");

const C = {
  navy:   "#0A0F1E",
  teal:   "#00D4B4",
  blue:   "#3B82F6",
  text1:  "#F1F5F9",
  text2:  "#94A3B8",
  text3:  "#64748B",
  card:   "rgba(17, 24, 39, 0.8)",
  border: "rgba(255, 255, 255, 0.1)",
};

const SLIDES = [
  {
    id: 1,
    title: "Portfolio Tracker\nSimplified.",
    sub: "Manage all your Indian assets—Stocks, Mutual Funds, Gold, and more—in one unified dashboard.",
    icon: <TrendingUp color={C.teal} size={84} strokeWidth={1.5} />,
  },
  {
    id: 2,
    title: "Privacy is our\nCore Engine.",
    sub: "Zero Cloud. 100% Offline. Your financial data is stored securely on your device and never leaves it.",
    icon: <Shield color={C.blue} size={84} strokeWidth={1.5} />,
  },
  {
    id: 3,
    title: "Unlock Senior\nInsights.",
    sub: "Go Pro to access advanced Timeline history, CSV exports, and unlimited asset entries.",
    icon: <Zap color="#F5A623" size={84} strokeWidth={1.5} />,
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [activeIdx, setActiveIdx] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const idx = Math.round(x / SCREEN_W);
    if (idx !== activeIdx) setActiveIdx(idx);
  };

  const next = () => {
    if (activeIdx < SLIDES.length - 1) {
      scrollRef.current?.scrollTo({ x: (activeIdx + 1) * SCREEN_W, animated: true });
    } else {
      finish();
    }
  };

  const finish = () => {
    setSetting("onboarding_complete", "true");
    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.top}>
        <Text style={s.logo}>Portfolio<Text style={{ color: C.teal }}>Lite</Text></Text>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={{ flex: 1 }}
      >
        {SLIDES.map((slide) => (
          <View key={slide.id} style={s.slide}>
            <View style={s.iconWrap}>
                <View style={s.ring} />
                {slide.icon}
            </View>
            <View style={s.textWrap}>
                <Text style={s.title}>{slide.title}</Text>
                <Text style={s.sub}>{slide.sub}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={s.bottom}>
        <View style={s.pager}>
            {SLIDES.map((_, i) => (
                <View 
                    key={i} 
                    style={[s.dot, activeIdx === i && s.dotActive]} 
                />
            ))}
        </View>

        <TouchableOpacity style={s.btn} onPress={next}>
            <Text style={s.btnText}>
                {activeIdx === SLIDES.length - 1 ? "Get Started" : "Continue"}
            </Text>
            {activeIdx < SLIDES.length - 1 && <ChevronRight color="#0A0F1E" size={18} strokeWidth={3} />}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:     { flex: 1, backgroundColor: C.navy },
  top:      { padding: 24, alignItems: "center" },
  logo:     { fontSize: 20, fontWeight: "900", color: C.text1, letterSpacing: -0.5 },
  
  slide:    { width: SCREEN_W, flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 40 },
  iconWrap: { width: 200, height: 200, alignItems: "center", justifyContent: "center", marginBottom: 60 },
  ring:     { position: "absolute", width: 140, height: 140, borderRadius: 70, borderStyle: "dashed", borderWidth: 2, borderColor: "rgba(255,255,255,0.05)" },
  
  textWrap: { alignItems: "center" },
  title:    { fontSize: 36, fontWeight: "900", color: C.text1, textAlign: "center", marginBottom: 20, lineHeight: 42, letterSpacing: -1 },
  sub:      { fontSize: 16, color: C.text3, textAlign: "center", lineHeight: 26 },
  
  bottom:   { padding: 40, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  pager:    { flexDirection: "row", gap: 8 },
  dot:      { width: 6, height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.1)" },
  dotActive:{ width: 24, backgroundColor: C.teal },
  
  btn:      { backgroundColor: C.teal, paddingVertical: 16, paddingHorizontal: 28, borderRadius: 16, flexDirection: "row", alignItems: "center", gap: 8, elevation: 8, shadowColor: C.teal, shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width:0, height:5 } },
  btnText:  { fontSize: 16, fontWeight: "900", color: "#0A0F1E" },
});
