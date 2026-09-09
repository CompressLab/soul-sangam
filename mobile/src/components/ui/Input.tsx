import React from "react";
import { View, Text, TextInput, TextInputProps, StyleSheet } from "react-native";
import { colors, radius, typography } from "@/constants/theme";

interface Props extends TextInputProps {
  label?:    string;
  error?:    string;
}

export function Input({ label, error, style, ...rest }: Props) {
  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, error ? styles.inputError : null, style]}
        placeholderTextColor={colors.gray400}
        {...rest}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 4 },
  label:   { ...typography.label, marginBottom: 4 },
  input: {
    borderWidth:       1,
    borderColor:       colors.gray200,
    borderRadius:      radius.md,
    paddingHorizontal: 14,
    paddingVertical:   11,
    fontSize:          14,
    color:             colors.gray900,
    backgroundColor:   colors.white,
  },
  inputError: { borderColor: colors.red },
  error:      { fontSize: 11, color: colors.red, marginTop: 3 },
});
