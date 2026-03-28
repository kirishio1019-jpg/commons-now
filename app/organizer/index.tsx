import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { Colors } from "../../lib/colors";
import { TrustBadge } from "../../components/TrustBadge";
import { useOrganizerDashboard } from "../../hooks/useOrganizerDashboard";

export default function OrganizerDashboardScreen() {
  const { organization, waves, stats, loading } = useOrganizerDashboard();
  const [activeTab, setActiveTab] = useState<"waves" | "impact">("waves");

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!organization) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>団体が見つかりません</Text>
      </View>
    );
  }

  const org = organization;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Org header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>{org.name[0]}</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.orgName}>{org.name}</Text>
            <TrustBadge rank={org.trust_rank} score={org.trust_score} size="medium" />
          </View>
        </View>
      </View>

      {/* Tab switch */}
      <View style={styles.tabRow}>
        <Pressable
          style={[styles.tab, activeTab === "waves" && styles.tabActive]}
          onPress={() => setActiveTab("waves")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "waves" && styles.tabTextActive,
            ]}
          >
            波の管理
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === "impact" && styles.tabActive]}
          onPress={() => setActiveTab("impact")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "impact" && styles.tabTextActive,
            ]}
          >
            インパクト
          </Text>
        </Pressable>
      </View>

      {activeTab === "waves" ? (
        /* Wave Management */
        <View style={styles.section}>
          {/* AI assignment notification */}
          <View style={styles.assignCard}>
            <Text style={styles.assignIcon}>🤖</Text>
            <View style={styles.assignInfo}>
              <Text style={styles.assignTitle}>AIからの波アサイン</Text>
              <Text style={styles.assignBody}>
                世田谷区で空白が検知されました。植樹イベントの開催を提案します。
              </Text>
            </View>
            <View style={styles.assignActions}>
              <Pressable style={styles.acceptBtn}>
                <Text style={styles.acceptText}>承諾</Text>
              </Pressable>
              <Pressable style={styles.declineBtn}>
                <Text style={styles.declineText}>辞退</Text>
              </Pressable>
            </View>
          </View>

          {/* Wave list */}
          {waves.map((wave) => (
            <Pressable
              key={wave.id}
              style={styles.waveCard}
              onPress={() => router.push(`/wave/${wave.id}`)}
            >
              <View style={styles.waveHeader}>
                <Text style={styles.waveTitle}>{wave.title}</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>予定</Text>
                </View>
              </View>
              <Text style={styles.waveMeta}>
                {wave.date}・{wave.location.name}
              </Text>
              <View style={styles.waveStatsRow}>
                <Text style={styles.waveStat}>
                  👥 {wave.current_participants}/{wave.capacity}
                </Text>
              </View>
            </Pressable>
          ))}

          {waves.length === 0 && (
            <Text style={styles.emptyText}>まだ波がありません</Text>
          )}

          {/* New wave proposal */}
          <Pressable style={styles.newWaveBtn}>
            <Text style={styles.newWaveText}>+ 新しい波を提案する</Text>
          </Pressable>
        </View>
      ) : (
        /* Impact Dashboard */
        <View style={styles.section}>
          {/* Summary stats */}
          <View style={styles.impactGrid}>
            <View style={styles.impactItem}>
              <Text style={styles.impactValue}>{stats.totalEvents}</Text>
              <Text style={styles.impactLabel}>総開催数</Text>
            </View>
            <View style={styles.impactItem}>
              <Text style={styles.impactValue}>{stats.totalParticipants}</Text>
              <Text style={styles.impactLabel}>延べ参加者</Text>
            </View>
            <View style={styles.impactItem}>
              <Text style={styles.impactValue}>{stats.repeatRate}%</Text>
              <Text style={styles.impactLabel}>リピート率</Text>
            </View>
          </View>

          {/* Eco impact */}
          <View style={styles.ecoCard}>
            <Text style={styles.ecoTitle}>生態系インパクト</Text>
            <View style={styles.ecoRow}>
              <View style={styles.ecoItem}>
                <Text style={styles.ecoValue}>{stats.treesPlanted}</Text>
                <Text style={styles.ecoLabel}>本の木を植樹</Text>
              </View>
              <View style={styles.ecoItem}>
                <Text style={styles.ecoValue}>
                  {stats.waterCollected.toLocaleString()}L
                </Text>
                <Text style={styles.ecoLabel}>雨水を収集</Text>
              </View>
              <View style={styles.ecoItem}>
                <Text style={styles.ecoValue}>{stats.mealsShared}</Text>
                <Text style={styles.ecoLabel}>食事を共有</Text>
              </View>
            </View>
          </View>
        </View>
      )}
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
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.bg,
  },
  emptyText: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: "center",
    paddingVertical: 20,
  },
  header: {
    backgroundColor: Colors.primary,
    padding: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  headerInfo: {
    gap: 4,
  },
  orgName: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  tabRow: {
    flexDirection: "row",
    backgroundColor: Colors.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.primary,
  },
  section: {
    padding: 16,
  },
  assignCard: {
    backgroundColor: "#FFFBEB",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#FDE68A",
    marginBottom: 16,
    gap: 12,
  },
  assignIcon: {
    fontSize: 24,
  },
  assignInfo: {
    gap: 4,
  },
  assignTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text,
  },
  assignBody: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  assignActions: {
    flexDirection: "row",
    gap: 10,
  },
  acceptBtn: {
    backgroundColor: Colors.going,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  acceptText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },
  declineBtn: {
    backgroundColor: Colors.border,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  declineText: {
    color: Colors.textSecondary,
    fontWeight: "600",
    fontSize: 13,
  },
  waveCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  waveHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  waveTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text,
    flex: 1,
  },
  statusBadge: {
    backgroundColor: Colors.curious + "20",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.curious,
  },
  waveMeta: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  waveStatsRow: {
    flexDirection: "row",
    gap: 12,
  },
  waveStat: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  newWaveBtn: {
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  newWaveText: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: "600",
  },
  impactGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  impactItem: {
    width: "30%",
    backgroundColor: Colors.bgCard,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
  },
  impactValue: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.primary,
  },
  impactLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  ecoCard: {
    backgroundColor: "#F0FDF4",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#BBF7D0",
    marginBottom: 16,
  },
  ecoTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 12,
  },
  ecoRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  ecoItem: {
    alignItems: "center",
    gap: 4,
  },
  ecoValue: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.primary,
  },
  ecoLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});
