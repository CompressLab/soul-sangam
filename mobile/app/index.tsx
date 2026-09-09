import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { colors } from "@/constants/theme";

export default function IndexScreen() {
  const { user, loading, profileComplete } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/(auth)/login");
    } else if (!profileComplete) {
      router.replace("/profile/setup");
    } else {
      router.replace("/(tabs)/browse");
    }
  }, [user, loading, profileComplete]);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.white }}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}
