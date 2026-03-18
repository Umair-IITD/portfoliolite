import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" backgroundColor="#0A0F1E" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#0A0F1E" } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="add-asset" options={{ presentation: "modal", animation: "slide_from_bottom" }} />
        <Stack.Screen name="paywall"   options={{ presentation: "modal", animation: "slide_from_bottom" }} />
        <Stack.Screen name="timeline"  options={{ presentation: "modal", animation: "slide_from_bottom" }} />
      </Stack>
    </>
  );
}