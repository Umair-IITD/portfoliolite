import React from "react";
import { 
  View, Text, TouchableOpacity, StyleSheet, 
  Modal, Animated, Dimensions 
} from "react-native";
import { Check, X, AlertCircle } from "lucide-react-native";

const { height } = Dimensions.get("window");

const C = {
  navy:   "#0A0F1E",
  card:   "#111827",
  card2:  "#1a2236",
  teal:   "#00D4B4",
  blue:   "#3B82F6",
  red:    "#EF4444",
  text1:  "#F1F5F9",
  text2:  "#94A3B8",
  text3:  "#64748B",
  border: "rgba(255,255,255,0.07)",
};

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  isDanger?: boolean;
  showCancel?: boolean;
}

export const ConfirmModal = React.memo(({
  visible,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isDanger = false,
  showCancel = true
}: ConfirmModalProps) => {
  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={s.overlay}>
        <View style={s.modalContainer}>
          <View style={[s.iconBox, isDanger ? s.dangerIcon : s.infoIcon]}>
            {isDanger ? (
              <AlertCircle color={C.red} size={28} />
            ) : (
              <Check color={C.blue} size={28} />
            )}
          </View>
          
          <Text style={s.title}>{title}</Text>
          <Text style={s.message}>{message}</Text>
          
          <View style={s.footer}>
            {showCancel && (
              <TouchableOpacity 
                style={s.cancelBtn} 
                onPress={onCancel}
              >
                <Text style={s.cancelText}>{cancelLabel}</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={[s.confirmBtn, isDanger ? s.dangerBtn : s.successBtn]} 
              onPress={onConfirm}
            >
              <Text style={s.confirmText}>{confirmLabel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
});

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContainer: {
    width: "100%",
    backgroundColor: C.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: C.border,
    padding: 24,
    alignItems: "center",
  },
  iconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  infoIcon: {
    backgroundColor: "rgba(59,130,246,0.1)",
  },
  dangerIcon: {
    backgroundColor: "rgba(239,68,68,0.1)",
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: C.text1,
    textAlign: "center",
    marginBottom: 12,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    color: C.text3,
    textAlign: "center",
    marginBottom: 32,
    paddingHorizontal: 10,
  },
  footer: {
    width: "100%",
    flexDirection: "row",
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    backgroundColor: C.card2,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: C.border,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: "700",
    color: C.text2,
  },
  confirmBtn: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  successBtn: {
    backgroundColor: C.blue,
  },
  dangerBtn: {
    backgroundColor: C.red,
  },
  confirmText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#fff",
  },
});
