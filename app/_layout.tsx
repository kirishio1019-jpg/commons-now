import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Platform, View, StyleSheet, ActivityIndicator } from "react-native";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import { AppProvider } from "../contexts/AppContext";
import { Colors } from "../lib/colors";

function PhoneFrame({ children }: { children: React.ReactNode }) {
  if (Platform.OS !== "web") return <>{children}</>;

  return (
    <View style={webStyles.outer}>
      <View style={webStyles.frame}>
        <View style={webStyles.notch} />
        {children}
        <View style={webStyles.homeIndicator}>
          <View style={webStyles.homeBar} />
        </View>
      </View>
    </View>
  );
}

const webStyles = StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
  },
  frame: {
    width: 390,
    height: 844,
    backgroundColor: "#000",
    borderRadius: 44,
    overflow: "hidden",
    borderWidth: 4,
    borderColor: "#333",
    position: "relative",
    // @ts-ignore - web only shadow
    boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
  },
  notch: {
    position: "absolute",
    top: 0,
    left: "50%",
    marginLeft: -62,
    width: 124,
    height: 34,
    backgroundColor: "#000",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    zIndex: 1000,
  },
  homeIndicator: {
    position: "absolute",
    bottom: 6,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 1000,
  },
  homeBar: {
    width: 134,
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
});

function AuthGate() {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthScreen = segments[0] === "auth";

    if (!session && !inAuthScreen) {
      router.replace("/auth");
    } else if (session && inAuthScreen) {
      router.replace("/(tabs)");
    }
  }, [session, loading, segments]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Colors.bg }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.primary },
        headerTintColor: Colors.textOnPrimary,
        headerTitleStyle: { fontWeight: "700" },
        contentStyle: { backgroundColor: Colors.bg },
      }}
    >
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="wave/[id]"
        options={{ title: "波の詳細", presentation: "card" }}
      />
      <Stack.Screen
        name="wave/create"
        options={{ title: "波を起こす", presentation: "modal" }}
      />
      <Stack.Screen
        name="clip/post"
        options={{ title: "クリップ投稿", presentation: "modal" }}
      />
      <Stack.Screen
        name="org/[id]"
        options={{ title: "団体情報", presentation: "card" }}
      />
      <Stack.Screen
        name="user/[id]"
        options={{ title: "プロフィール", presentation: "card" }}
      />
      <Stack.Screen name="settings" options={{ title: "設定" }} />
      <Stack.Screen
        name="organizer/index"
        options={{ title: "団体ダッシュボード" }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AppProvider>
        <StatusBar style="light" />
        <PhoneFrame>
          <AuthGate />
        </PhoneFrame>
      </AppProvider>
    </AuthProvider>
  );
}
