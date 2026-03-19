import { useState, useEffect, useCallback, useMemo } from "react";
import * as LocalAuthentication from "expo-local-authentication";
import { getSetting, setSetting } from "../db/database";

interface UseBiometricsReturn {
  isAvailable:     boolean;   // device has enrolled biometrics
  isEnabled:       boolean;   // user turned on the lock
  isAuthenticated: boolean;   // currently unlocked
  isChecking:      boolean;   // initial check in progress
  authenticate:    () => Promise<boolean>;
  enable:          () => Promise<void>;
  disable:         () => Promise<void>;
}

export function useBiometrics(): UseBiometricsReturn {
  const [isAvailable,     setIsAvailable]     = useState(false);
  const [isEnabled,       setIsEnabled]       = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking,      setIsChecking]      = useState(true);

  // On mount: check hardware + read saved preference
  useEffect(() => {
    async function init() {
      try {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled  = await LocalAuthentication.isEnrolledAsync();
        const available   = hasHardware && isEnrolled;
        setIsAvailable(available);

        if (available) {
          const saved = getSetting("biometric_enabled");
          setIsEnabled(saved === "true");
        }
      } catch (e) {
        console.error("[useBiometrics] init error:", e);
      } finally {
        setIsChecking(false);
      }
    }
    init();
  }, []);

  const authenticate = useCallback(async (): Promise<boolean> => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage:  "Unlock PortfolioLite",
        cancelLabel:    "Cancel",
        fallbackLabel:  "Use passcode",
        disableDeviceFallback: false,
      });
      if (result.success) {
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (e) {
      console.error("[useBiometrics] authenticate error:", e);
      return false;
    }
  }, []);

  const enable = useCallback(async (): Promise<void> => {
    // Verify biometrics work before enabling
    const ok = await authenticate();
    if (ok) {
      setSetting("biometric_enabled", "true");
      setIsEnabled(true);
    }
  }, [authenticate]);

  const disable = useCallback(async (): Promise<void> => {
    setSetting("biometric_enabled", "false");
    setIsEnabled(false);
    setIsAuthenticated(false);
  }, []);

  return useMemo(() => ({
    isAvailable,
    isEnabled,
    isAuthenticated,
    isChecking,
    authenticate,
    enable,
    disable,
  }), [isAvailable, isEnabled, isAuthenticated, isChecking, authenticate, enable, disable]);
}