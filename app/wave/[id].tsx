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
import { useWave } from "../../hooks/useWave";
import { Colors } from "../../lib/colors";
import { CommitButton } from "../../components/CommitButton";
import { ParticipantList } from "../../components/ParticipantList";
import { TrustBadge } from "../../components/TrustBadge";
import { ClipPlayer } from "../../components/ClipPlayer";
import { useApp } from "../../contexts/AppContext";

export default function WaveDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getCommitLevel, updateCommitLevel } = useApp();
  const { wave, organization, clips, participants, loading } = useWave(id);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!wave) {
    return (
      <View style={styles.center}>
        <Text>波が見つかりません</Text>
      </View>
    );
  }

  const org = organization;
  const commitLevel = getCommitLevel(wave.id);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Hero */}
      <View style={styles.hero}>
        <Text style={styles.theme}>{wave.theme}</Text>
        <Text style={styles.title}>{wave.title}</Text>
        {wave.is_personalized && (
          <View style={styles.personalizedBadge}>
            <Text style={styles.personalizedText}>✨ あなた向けに選ばれました</Text>
          </View>
        )}
      </View>

      {/* Details */}
      <View style={styles.section}>
        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>📅</Text>
          <Text style={styles.detailText}>
            {wave.date}　{wave.time_start}〜{wave.time_end}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>📍</Text>
          <View>
            <Text style={styles.detailText}>{wave.location.name}</Text>
            <Text style={styles.detailSubtext}>{wave.location.address}</Text>
            {wave.distance_km && (
              <Text style={styles.distance}>{wave.distance_km}km先・徒歩約{Math.round(wave.distance_km * 12)}分</Text>
            )}
          </View>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>👥</Text>
          <Text style={styles.detailText}>
            {wave.current_participants}/{wave.capacity}人参加予定
          </Text>
        </View>
      </View>

      {/* Description */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>この波について</Text>
        <Text style={styles.description}>{wave.description}</Text>
      </View>

      {/* Organizer */}
      {org && (
        <Pressable
          style={styles.orgCard}
          onPress={() => router.push(`/org/${org.id}`)}
        >
          <View style={styles.orgHeader}>
            <View style={styles.orgLogo}>
              <Text style={styles.orgLogoText}>{org.name[0]}</Text>
            </View>
            <View style={styles.orgInfo}>
              <View style={styles.orgNameRow}>
                <Text style={styles.orgName}>{org.name}</Text>
                <TrustBadge rank={org.trust_rank} score={org.trust_score} size="medium" />
              </View>
              <Text style={styles.orgMeta}>
                {org.event_count}回開催・{org.member_count}人のメンバー
              </Text>
            </View>
          </View>
        </Pressable>
      )}

      {/* Past clips */}
      {clips.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>前回のクリップ</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {clips.map((clip) => (
              <ClipPlayer key={clip.id} clip={clip} />
            ))}
          </ScrollView>
        </View>
      )}

      {/* Participants */}
      <View style={styles.section}>
        <ParticipantList participants={participants} />
      </View>

      {/* Eco impact target */}
      {(wave.eco_impact_target.trees_planted > 0 ||
        wave.eco_impact_target.water_collected_liters > 0 ||
        wave.eco_impact_target.meals_shared > 0) && (
        <View style={styles.impactCard}>
          <Text style={styles.sectionTitle}>この波の目標</Text>
          <View style={styles.impactRow}>
            {wave.eco_impact_target.trees_planted > 0 && (
              <View style={styles.impactItem}>
                <Text style={styles.impactValue}>{wave.eco_impact_target.trees_planted}</Text>
                <Text style={styles.impactLabel}>本の木</Text>
              </View>
            )}
            {wave.eco_impact_target.water_collected_liters > 0 && (
              <View style={styles.impactItem}>
                <Text style={styles.impactValue}>{wave.eco_impact_target.water_collected_liters}L</Text>
                <Text style={styles.impactLabel}>雨水</Text>
              </View>
            )}
            {wave.eco_impact_target.meals_shared > 0 && (
              <View style={styles.impactItem}>
                <Text style={styles.impactValue}>{wave.eco_impact_target.meals_shared}</Text>
                <Text style={styles.impactLabel}>食の共有</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Clip post button */}
      <View style={styles.clipSection}>
        <Pressable
          style={styles.clipButton}
          onPress={() => router.push({ pathname: "/clip/post", params: { waveId: wave.id } })}
        >
          <Text style={styles.clipButtonText}>📷 クリップを投稿する</Text>
        </Pressable>
      </View>

      {/* Commit button */}
      <View style={styles.commitSection}>
        <CommitButton
          level={commitLevel}
          onPress={(next) => updateCommitLevel(wave.id, next)}
        />
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
  hero: {
    backgroundColor: Colors.primary,
    padding: 24,
    paddingTop: 12,
    gap: 8,
  },
  theme: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "800",
    lineHeight: 32,
  },
  personalizedBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 4,
  },
  personalizedText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
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
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 12,
  },
  detailIcon: {
    fontSize: 18,
    marginTop: 1,
  },
  detailText: {
    fontSize: 15,
    color: Colors.text,
    fontWeight: "500",
  },
  detailSubtext: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  distance: {
    fontSize: 13,
    color: Colors.primaryLighter,
    fontWeight: "600",
    marginTop: 2,
  },
  description: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 24,
  },
  orgCard: {
    margin: 20,
    padding: 16,
    backgroundColor: Colors.bgCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  orgHeader: {
    flexDirection: "row",
    gap: 12,
  },
  orgLogo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  orgLogoText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  orgInfo: {
    flex: 1,
    gap: 4,
  },
  orgNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  orgName: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
  },
  orgMeta: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  impactCard: {
    margin: 20,
    padding: 16,
    backgroundColor: "#F0FDF4",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  impactRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  impactItem: {
    alignItems: "center",
    gap: 4,
  },
  impactValue: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.primary,
  },
  impactLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  clipSection: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  clipButton: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  clipButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text,
  },
  commitSection: {
    padding: 24,
    alignItems: "center",
  },
});
