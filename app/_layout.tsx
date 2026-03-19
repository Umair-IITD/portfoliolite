import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { initDatabase } from "../src/db/database";
import { useBiometrics } from "../src/hooks/useBiometrics";
import BiometricGateScreen from "./biometric-gate";

function AppGate({ children }: { children: React.ReactNode }) {
  const {
    isAvailable, isEnabled, isAuthenticated,
    isChecking, authenticate,
  } = useBiometrics();

  // Show loader while checking biometric settings
  if (isChecking) {
    return (
      <View style={{ flex: 1, backgroundColor: "#0A0F1E", alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color="#00D4B4" size="large" />
      </View>
    );
  }

  // Show lock screen if enabled and not yet authenticated
  if (isEnabled && !isAuthenticated) {
    return (
      <BiometricGateScreen
        isAvailable={isAvailable}
        authenticate={authenticate}
        onAuthenticated={() => {/* state updates inside hook */}}
        onSkip={() => {/* skip allowed if device has no biometrics */}}
      />
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  useEffect(() => {
    initDatabase().catch((e) =>
      console.error("[RootLayout] DB init failed:", e)
    );
  }, []);

  return (
    <AppGate>
      <StatusBar style="light" backgroundColor="#0A0F1E" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#0A0F1E" },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="add-asset"
          options={{ presentation: "modal", animation: "slide_from_bottom" }}
        />
        <Stack.Screen
          name="paywall"
          options={{ presentation: "modal", animation: "slide_from_bottom" }}
        />
        <Stack.Screen
          name="timeline"
          options={{ presentation: "modal", animation: "slide_from_bottom" }}
        />
      </Stack>
    </AppGate>
  );
}