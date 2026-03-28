import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../contexts/AuthContext";
import { Colors } from "../lib/colors";

export default function AuthScreen() {
  const { signInWithGoogle, signInWithApple } = useAuth();

  return (
    <LinearGradient
      colors={[Colors.primary, Colors.primaryLight, Colors.primaryLighter]}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.logo}>🌊</Text>
        <Text style={styles.title}>Commons Now</Text>
        <Text style={styles.subtitle}>
          地域の波に乗ろう。{"\n"}小さな行動が、大きなうねりになる。
        </Text>

        <View style={styles.buttons}>
          <TouchableOpacity
            style={[styles.button, styles.googleButton]}
            onPress={signInWithGoogle}
          >
            <Text style={styles.googleIcon}>G</Text>
            <Text style={styles.googleText}>Googleでログイン</Text>
          </TouchableOpacity>

          {Platform.OS !== "android" && (
            <TouchableOpacity
              style={[styles.button, styles.appleButton]}
              onPress={signInWithApple}
            >
              <Text style={styles.appleIcon}></Text>
              <Text style={styles.appleText}>Appleでログイン</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.terms}>
          ログインすることで、利用規約とプライバシーポリシーに同意します
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  logo: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 48,
  },
  buttons: {
    width: "100%",
    gap: 12,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 10,
  },
  googleButton: {
    backgroundColor: "#fff",
  },
  googleIcon: {
    fontSize: 20,
    fontWeight: "700",
    color: "#4285F4",
  },
  googleText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  appleButton: {
    backgroundColor: "#000",
  },
  appleIcon: {
    fontSize: 20,
    color: "#fff",
  },
  appleText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  terms: {
    marginTop: 24,
    fontSize: 11,
    color: "rgba(255,255,255,0.5)",
    textAlign: "center",
  },
});
