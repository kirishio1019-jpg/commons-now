import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { useApp } from "../../contexts/AppContext";
import { useProfile } from "../../hooks/useProfile";
import { useWaves } from "../../hooks/useWaves";
import { useCommitments } from "../../hooks/useCommitments";
import { Colors } from "../../lib/colors";
import { Wave } from "../../types";

export default function MyPageScreen() {
  const { user } = useApp();
  const { stats, loading: profileLoading } = useProfile();
  const { waves, loading: wavesLoading } = useWaves();
  const { commitments, loading: commitmentsLoading } = useCommitments();

  const loading = profileLoading || wavesLoading || commitmentsLoading;

  const participatedWaves: Wave[] = commitments
    .filter((c) => c.level === "going")
    .map((c) => waves.find((w) => w.id === c.wave_id))
    .filter((w): w is Wave => w !== undefined);

  if (loading || !user) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile header */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user.nickname[0]}</Text>
        </View>
        <Text style={styles.nickname}>{user.nickname}</Text>
        <Text style={styles.location}>{user.location_zone}</Text>
        {user.bio && <Text style={styles.bio}>{user.bio}</Text>}
        <View style={styles.tagsRow}>
          {user.tags.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Contribution score */}
      <View style={styles.statsCard}>
        <Text style={styles.sectionTitle}>あなたの貢献</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.eventsJoined}</Text>
            <Text style={styles.statLabel}>参加回数</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.treesPlanted}</Text>
            <Text style={styles.statLabel}>本の木</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.clipsPosted}</Text>
            <Text style={styles.statLabel}>クリップ</Text>
          </View>
        </View>
      </View>

      {/* Participation history */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>参加履歴</Text>
        {participatedWaves.length > 0 ? (
          participatedWaves.map((wave) =>
            wave ? (
              <Pressable
                key={wave.id}
                style={styles.historyItem}
                onPress={() => router.push(`/wave/${wave.id}`)}
              >
                <View style={styles.historyDot} />
                <View style={styles.historyInfo}>
                  <Text style={styles.historyTitle}>{wave.title}</Text>
                  <Text style={styles.historyMeta}>
                    {wave.date}・{wave.location.name}
                  </Text>
                </View>
              </Pressable>
            ) : null
          )
        ) : (
          <Text style={styles.emptyText}>
            まだ参加した波はありません
          </Text>
        )}
      </View>

      {/* Settings link */}
      <Pressable
        style={styles.settingsButton}
        onPress={() => router.push("/settings")}
      >
        <Text style={styles.settingsText}>⚙️ 設定</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: Colors.primary,
    padding: 24,
    alignItems: "center",
    gap: 8,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  avatarText: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
  },
  nickname: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
  },
  location: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
  },
  bio: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    textAlign: "center",
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 6,
    marginTop: 4,
  },
  tag: {
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  statsCard: {
    margin: 16,
    padding: 20,
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 12,
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  historyDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.going,
  },
  historyInfo: {
    flex: 1,
    gap: 2,
  },
  historyTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text,
  },
  historyMeta: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: "center",
    paddingVertical: 20,
  },
  settingsButton: {
    marginHorizontal: 16,
    marginTop: 20,
    padding: 16,
    backgroundColor: Colors.bgCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
  },
  settingsText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text,
  },
});
