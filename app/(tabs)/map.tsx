import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useWaves } from "../../hooks/useWaves";
import { Colors } from "../../lib/colors";
import { Wave } from "../../types";

function buildLeafletHtml(waves: Wave[]): string {
  const markers = waves
    .filter((w) => w.location?.latitude && w.location?.longitude && !w.location?.is_online)
    .map(
      (w) =>
        `L.marker([${w.location.latitude}, ${w.location.longitude}])
          .addTo(map)
          .bindPopup('<b>${w.title.replace(/'/g, "\\'")}</b><br>${w.location.name.replace(/'/g, "\\'")}<br>${w.date} ${w.time_start}');`
    )
    .join("\n");

  const center =
    waves.length > 0 && waves[0].location?.latitude
      ? `[${waves[0].location.latitude}, ${waves[0].location.longitude}]`
      : "[35.68, 139.76]";

  return `<!DOCTYPE html>
<html><head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no"/>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>html,body,#map{margin:0;padding:0;width:100%;height:100%}</style>
</head><body>
<div id="map"></div>
<script>
var map = L.map('map').setView(${center}, 12);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors',
  maxZoom: 18
}).addTo(map);
${markers}
</script>
</body></html>`;
}

function WebMap({ waves }: { waves: Wave[] }) {
  const html = useMemo(() => buildLeafletHtml(waves), [waves]);

  return (
    <iframe
      srcDoc={html}
      style={{
        width: "100%",
        height: "100%",
        border: "none",
      }}
      title="Map"
    />
  );
}

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
      {/* Map */}
      <View style={styles.mapContainer}>
        {Platform.OS === "web" ? (
          <WebMap waves={waves} />
        ) : (
          <View style={styles.mapPlaceholder}>
            <Text style={styles.mapIcon}>🗺️</Text>
            <Text style={styles.mapText}>ネイティブ版は準備中です</Text>
          </View>
        )}
      </View>

      {/* Bottom sheet - wave list */}
      <View style={styles.bottomSheet}>
        <View style={styles.handle} />
        <Text style={styles.sheetTitle}>近くの波</Text>
        {waves.length === 0 ? (
          <Text style={styles.emptyText}>まだ波がありません</Text>
        ) : (
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
                  {wave.distance_km ? `${wave.distance_km}km・` : ""}
                  {wave.date}
                </Text>
                <Text style={styles.miniParticipants}>
                  👥 {wave.current_participants}/{wave.capacity}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        )}
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
  mapContainer: {
    flex: 1,
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
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    paddingVertical: 12,
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
