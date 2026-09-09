import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from "react-native";
import { colors, radius } from "@/constants/theme";

type Variant = "primary" | "outline" | "ghost";

interface Props {
  label:      string;
  onPress:    () => void;
  variant?:   Variant;
  loading?:   boolean;
  disabled?:  boolean;
  style?:     ViewStyle;
  textStyle?: TextStyle;
  icon?:      React.ReactNode;
}

export function Button({
  label, onPress, variant = "primary",
  loading, disabled, style, textStyle, icon,
}: Props) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={[
        styles.base,
        variant === "primary" && styles.primary,
        variant === "outline" && styles.outline,
        variant === "ghost"   && styles.ghost,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading
        ? <ActivityIndicator color={variant === "primary" ? colors.white : colors.primary} size="small" />
        : (
          <>
            {icon}
            <Text
              style={[
                styles.label,
                variant === "primary" && styles.labelPrimary,
                variant === "outline" && styles.labelOutline,
                variant === "ghost"   && styles.labelGhost,
                textStyle,
              ]}
            >
              {label}
            </Text>
          </>
        )
      }
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection:  "row",
    alignItems:     "center",
    justifyContent: "center",
    gap:            8,
    paddingVertical:  12,
    paddingHorizontal: 24,
    borderRadius:   radius.full,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth:     1.5,
    borderColor:     colors.primary,
  },
  ghost: {
    backgroundColor: "transparent",
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    fontSize:   15,
    fontWeight: "600",
  },
  labelPrimary: { color: colors.white },
  labelOutline: { color: colors.primary },
  labelGhost:   { color: colors.gray500 },
});
