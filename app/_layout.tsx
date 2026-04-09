import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, memo } from "react";
import { View, StyleSheet } from "react-native";
import { initDatabase, getSetting } from "../src/db/database";
import { useBiometrics } from "../src/hooks/useBiometrics";
import { useState } from "react";
import { PurchasesProvider } from "../src/context/PurchasesContext";
import BiometricGateScreen from "./biometric-gate";

const LockOverlay = memo(({ isAvailable, authenticate }: { isAvailable: boolean, authenticate: () => Promise<boolean> }) => (
  <View style={[StyleSheet.absoluteFill, { zIndex: 998 }]}>
    <BiometricGateScreen
      isAvailable={isAvailable}
      authenticate={authenticate}
      onAuthenticated={() => {}}
      onSkip={authenticate}
    />
  </View>
));

function AppGate({ children }: { children: React.ReactNode }) {
  const {
    isAvailable, isEnabled, isAuthenticated,
    isChecking, authenticate,
  } = useBiometrics();
  
  // 1. If we are still checking local DB for settings, show nothing (Prevents Flash)
  // 2. If biometrics are enabled AND user isn't authenticated, show lock
  const showLock = isEnabled && !isAuthenticated;

  if (isChecking) {
    return <View style={{ flex: 1, backgroundColor: "#0A0F1E" }} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#0A0F1E" }}>
      {children}
      {showLock && <LockOverlay isAvailable={isAvailable} authenticate={authenticate} />}
    </View>
  );
}

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        await initDatabase();
        const done = getSetting("onboarding_complete");
        setShowOnboarding(done !== "true");
      } catch (e) {
        console.error("[RootLayout] init failed:", e);
      } finally {
        setIsReady(true);
      }
    }
    init();
  }, []);

  if (!isReady) {
    return <View style={{ flex: 1, backgroundColor: "#0A0F1E" }} />;
  }

  return (
    <PurchasesProvider>
      <StatusBar style="light" backgroundColor="#0A0F1E" translucent={false} />
      <AppGate>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "#0A0F1E" },
          }}
          initialRouteName={showOnboarding ? "onboarding" : "(tabs)"}
        >
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="add-asset"
            options={{ animation: "slide_from_bottom" }}
          />
          <Stack.Screen
            name="paywall"
            options={{ animation: "slide_from_bottom" }}
          />
          <Stack.Screen
            name="privacy"
            options={{ animation: "slide_from_bottom" }}
          />
        </Stack>
      </AppGate>
    </PurchasesProvider>
  );
}