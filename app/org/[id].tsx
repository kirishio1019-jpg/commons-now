import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useOrganization } from "../../hooks/useOrganization";
import { Colors } from "../../lib/colors";
import { TrustBadge } from "../../components/TrustBadge";

export default function OrgProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { organization, waves, loading } = useOrganization(id);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const org = organization;

  if (!org) {
    return (
      <View style={styles.center}>
        <Text>団体が見つかりません</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>{org.name[0]}</Text>
        </View>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{org.name}</Text>
          <TrustBadge rank={org.trust_rank} score={org.trust_score} size="large" />
        </View>
        <Text style={styles.type}>
          {org.type === "npo" ? "NPO" : org.type === "community" ? "地域コミュニティ" : org.type}
        </Text>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{org.event_count}</Text>
          <Text style={styles.statLabel}>開催回数</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{org.member_count}</Text>
          <Text style={styles.statLabel}>メンバー</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{org.active_zones.length}</Text>
          <Text style={styles.statLabel}>活動地域</Text>
        </View>
      </View>

      {/* Description */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>団体について</Text>
        <Text style={styles.description}>{org.description}</Text>
      </View>

      {/* Themes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>テーマ</Text>
        <View style={styles.tagsRow}>
          {org.themes.map((theme) => (
            <View key={theme} style={styles.tag}>
              <Text style={styles.tagText}>{theme}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Active zones */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>活動地域</Text>
        {org.active_zones.map((zone) => (
          <Text key={zone} style={styles.zoneText}>
            📍 {zone}
          </Text>
        ))}
      </View>

      {/* Past & upcoming waves */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>この団体の波</Text>
        {waves.map((wave) => (
          <Pressable
            key={wave.id}
            style={styles.waveItem}
            onPress={() => router.push(`/wave/${wave.id}`)}
          >
            <View style={styles.waveDot} />
            <View style={styles.waveInfo}>
              <Text style={styles.waveTitle}>{wave.title}</Text>
              <Text style={styles.waveMeta}>
                {wave.date}・{wave.location.name}
              </Text>
            </View>
            <Text style={styles.waveArrow}>›</Text>
          </Pressable>
        ))}
      </View>

      {/* Trust score breakdown */}
      <View style={styles.trustCard}>
        <Text style={styles.sectionTitle}>信頼スコアの内訳</Text>
        <View style={styles.trustRow}>
          <Text style={styles.trustLabel}>開催実績</Text>
          <View style={styles.trustBar}>
            <View style={[styles.trustFill, { width: "90%" }]} />
          </View>
        </View>
        <View style={styles.trustRow}>
          <Text style={styles.trustLabel}>参加者評価</Text>
          <View style={styles.trustBar}>
            <View style={[styles.trustFill, { width: "85%" }]} />
          </View>
        </View>
        <View style={styles.trustRow}>
          <Text style={styles.trustLabel}>継続開催率</Text>
          <View style={styles.trustBar}>
            <View style={[styles.trustFill, { width: "95%" }]} />
          </View>
        </View>
        <View style={styles.trustRow}>
          <Text style={styles.trustLabel}>キャンセル率（低い方が良い）</Text>
          <View style={styles.trustBar}>
            <View style={[styles.trustFill, { width: "10%", backgroundColor: Colors.going }]} />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  content: {
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    backgroundColor: Colors.primary,
    padding: 24,
    alignItems: "center",
    gap: 8,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  name: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
  },
  type: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 20,
    backgroundColor: Colors.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  statItem: {
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 24,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    backgroundColor: Colors.primaryLight + "15",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 13,
    color: Colors.primaryLight,
    fontWeight: "600",
  },
  zoneText: {
    fontSize: 14,
    color: Colors.text,
    paddingVertical: 4,
  },
  waveItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 12,
  },
  waveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primaryLighter,
  },
  waveInfo: {
    flex: 1,
    gap: 2,
  },
  waveTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text,
  },
  waveMeta: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  waveArrow: {
    fontSize: 22,
    color: Colors.textLight,
  },
  trustCard: {
    margin: 20,
    padding: 16,
    backgroundColor: Colors.bgCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  trustRow: {
    marginBottom: 12,
    gap: 4,
  },
  trustLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  trustBar: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
  },
  trustFill: {
    height: 6,
    backgroundColor: Colors.primaryLighter,
    borderRadius: 3,
  },
});
