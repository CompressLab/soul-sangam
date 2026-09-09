import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import { AuthProvider } from "@/context/AuthContext";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)/login" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="profile/[uid]"
            options={{ headerShown: true, title: "Profile", headerBackTitle: "Back" }}
          />
          <Stack.Screen
            name="profile/setup"
            options={{ headerShown: true, title: "Create Profile", headerBackVisible: false }}
          />
          <Stack.Screen
            name="chat/[convId]"
            options={{ headerShown: true, title: "Chat", headerBackTitle: "Back" }}
          />
        </Stack>
        <StatusBar style="auto" />
        <Toast />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
