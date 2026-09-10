import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, Image, Dimensions,
} from "react-native";
import { useAuth } from "@/context/AuthContext";
import { colors, spacing, radius, typography } from "@/constants/theme";

const { width } = Dimensions.get("window");

export default function LoginScreen() {
  const { signInWithGoogle, signInWithFacebook } = useAuth();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.logo}>💑</Text>
          <Text style={styles.appName}>Familiara</Text>
          <Text style={styles.tagline}>Find your perfect life partner</Text>
          <Text style={styles.sub}>
            Join thousands of families who have found happiness through our trusted platform.
          </Text>
        </View>

        {/* Buttons */}
        <View style={styles.buttons}>
          <TouchableOpacity style={styles.googleBtn} onPress={signInWithGoogle} activeOpacity={0.85}>
            <Text style={styles.googleIcon}>G</Text>
            <Text style={styles.googleLabel}>Continue with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.facebookBtn} onPress={signInWithFacebook} activeOpacity={0.85}>
            <Text style={styles.fbIcon}>f</Text>
            <Text style={styles.facebookLabel}>Continue with Facebook</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.terms}>
          By continuing, you agree to our{" "}
          <Text style={styles.link}>Terms of Service</Text> and{" "}
          <Text style={styles.link}>Privacy Policy</Text>
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.primary },
  container: {
    flex:            1,
    paddingHorizontal: spacing.lg,
    justifyContent:  "space-between",
    paddingBottom:   spacing.xl,
    paddingTop:      spacing.xxl,
  },
  hero: { alignItems: "center", gap: spacing.sm },
  logo: { fontSize: 72 },
  appName: {
    fontSize:   32,
    fontWeight: "800",
    color:      colors.white,
    marginTop:  spacing.sm,
  },
  tagline: {
    fontSize:   18,
    fontWeight: "600",
    color:      colors.white,
    opacity:    0.9,
  },
  sub: {
    fontSize:  14,
    color:     colors.white,
    opacity:   0.75,
    textAlign: "center",
    lineHeight: 22,
    marginTop: spacing.sm,
  },
  buttons: { gap: spacing.sm },
  googleBtn: {
    flexDirection:  "row",
    alignItems:     "center",
    justifyContent: "center",
    gap:            10,
    backgroundColor: colors.white,
    borderRadius:    radius.full,
    paddingVertical: 14,
    shadowColor:    "#000",
    shadowOpacity:  0.1,
    shadowRadius:   8,
    elevation:      3,
  },
  googleIcon: {
    fontSize:   18,
    fontWeight: "900",
    color:      "#4285F4",
  },
  googleLabel: {
    fontSize:   15,
    fontWeight: "600",
    color:      colors.gray700,
  },
  facebookBtn: {
    flexDirection:  "row",
    alignItems:     "center",
    justifyContent: "center",
    gap:            10,
    backgroundColor: "#1877F2",
    borderRadius:    radius.full,
    paddingVertical: 14,
    borderWidth:     1.5,
    borderColor:     "rgba(255,255,255,0.3)",
  },
  fbIcon: {
    fontSize:   18,
    fontWeight: "900",
    color:      colors.white,
  },
  facebookLabel: {
    fontSize:   15,
    fontWeight: "600",
    color:      colors.white,
  },
  terms: {
    fontSize:  12,
    color:     colors.white,
    opacity:   0.7,
    textAlign: "center",
    lineHeight: 18,
  },
  link: { textDecorationLine: "underline", opacity: 1 },
});
