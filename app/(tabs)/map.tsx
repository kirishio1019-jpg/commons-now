import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { useWaves } from "../../hooks/useWaves";
import { Colors } from "../../lib/colors";

export default function MapScreen() {
  const { waves, loading } = useWaves();

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={Colors.text} />
        <Text style={styles.loadingText}>地図を読み込み中...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Map placeholder */}
      <View style={styles.mapPlaceholder}>
        <Text style={styles.mapIcon}>🗺️</Text>
        <Text style={styles.mapText}>
          地図表示{"\n"}（react-native-maps 接続後に有効）
        </Text>
        {/* Wave pins preview - positioned using real lat/lng mapped to screen */}
        {waves.map((wave) => {
          // Map latitude/longitude to relative screen positions
          // This is a placeholder mapping until react-native-maps is integrated
          const lat = wave.location?.latitude ?? 35.68;
          const lng = wave.location?.longitude ?? 139.76;
          // Normalize around Tokyo center (rough approximation for preview)
          const top = 80 + ((35.72 - lat) / 0.05) * 100;
          const left = 40 + ((lng - 139.70) / 0.10) * 200;
          return (
            <View
              key={wave.id}
              style={[
                styles.pin,
                {
                  top: Math.max(40, Math.min(top, 400)),
                  left: Math.max(20, Math.min(left, 340)),
                },
              ]}
            >
              <Text style={styles.pinEmoji}>🌊</Text>
            </View>
          );
        })}
      </View>

      {/* Bottom sheet - wave list */}
      <View style={styles.bottomSheet}>
        <View style={styles.handle} />
        <Text style={styles.sheetTitle}>近くの波</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {waves.map((wave) => (
            <Pressable
              key={wave.id}
              style={styles.miniCard}
              onPress={() => router.push(`/wave/${wave.id}`)}
            >
              <View
                style={[
                  styles.miniCardColor,
                  { backgroundColor: Colors.primaryLight },
                ]}
              />
              <Text style={styles.miniTitle} numberOfLines={1}>
                {wave.title}
              </Text>
              <Text style={styles.miniMeta}>
                {wave.distance_km}km・{wave.date}
              </Text>
              <Text style={styles.miniParticipants}>
                👥 {wave.current_participants}/{wave.capacity}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E8E8E0",
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 12,
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  mapIcon: {
    fontSize: 48,
    opacity: 0.5,
  },
  mapText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 8,
  },
  pin: {
    position: "absolute",
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.bgCard,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  pinEmoji: {
    fontSize: 18,
  },
  bottomSheet: {
    backgroundColor: Colors.bgCard,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    paddingBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: "center",
    marginBottom: 12,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 12,
  },
  miniCard: {
    width: 160,
    padding: 12,
    marginRight: 10,
    backgroundColor: Colors.bg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  miniCardColor: {
    height: 4,
    borderRadius: 2,
    marginBottom: 8,
  },
  miniTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 4,
  },
  miniMeta: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  miniParticipants: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
});
