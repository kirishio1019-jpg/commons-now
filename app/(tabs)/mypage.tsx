import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  TextInput,
  Platform,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { useApp } from "../../contexts/AppContext";
import { useProfile } from "../../hooks/useProfile";
import { useWaves } from "../../hooks/useWaves";
import { useCommitments } from "../../hooks/useCommitments";
import { Colors } from "../../lib/colors";
import { Wave } from "../../types";

const ALL_TAGS = [
  "植樹", "料理", "読書", "音楽", "焚き火", "農業", "ハイキング",
  "ヨガ", "アート", "対話", "水循環", "DIY", "星空", "子ども", "瞑想",
];

export default function MyPageScreen() {
  const { user } = useApp();
  const { stats, loading: profileLoading, updateProfile } = useProfile();
  const { waves, loading: wavesLoading } = useWaves();
  const { commitments, loading: commitmentsLoading } = useCommitments();

  const [editing, setEditing] = useState(false);
  const [nickname, setNickname] = useState("");
  const [bio, setBio] = useState("");
  const [locationZone, setLocationZone] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const loading = profileLoading || wavesLoading || commitmentsLoading;

  const participatedWaves: Wave[] = commitments
    .filter((c) => c.level === "going")
    .map((c) => waves.find((w) => w.id === c.wave_id))
    .filter((w): w is Wave => w !== undefined);

  const startEditing = () => {
    if (!user) return;
    setNickname(user.nickname);
    setBio(user.bio || "");
    setLocationZone(user.location_zone);
    setSelectedTags([...user.tags]);
    setEditing(true);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => {
      if (prev.includes(tag)) return prev.filter((t) => t !== tag);
      if (prev.length >= 5) return prev;
      return [...prev, tag];
    });
  };

  const handleSave = async () => {
    setSaving(true);
    await updateProfile({
      nickname: nickname.trim() || user?.nickname || "名前未設定",
      bio: bio.trim(),
      location_zone: locationZone.trim(),
      tags: selectedTags,
    });
    setSaving(false);
    setEditing(false);
    if (Platform.OS === "web") {
      window.alert("プロフィールを更新しました");
    } else {
      Alert.alert("更新完了", "プロフィールを更新しました");
    }
  };

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

        {editing ? (
          <View style={styles.editForm}>
            <TextInput
              style={styles.editInput}
              value={nickname}
              onChangeText={setNickname}
              placeholder="ニックネーム"
              placeholderTextColor="rgba(255,255,255,0.4)"
            />
            <TextInput
              style={styles.editInput}
              value={locationZone}
              onChangeText={setLocationZone}
              placeholder="地域（例: 東京都世田谷区）"
              placeholderTextColor="rgba(255,255,255,0.4)"
            />
            <TextInput
              style={[styles.editInput, styles.editBio]}
              value={bio}
              onChangeText={setBio}
              placeholder="自己紹介を書いてみよう..."
              placeholderTextColor="rgba(255,255,255,0.4)"
              multiline
              numberOfLines={3}
            />

            {/* Tag selector */}
            <Text style={styles.editLabel}>
              興味のあること（{selectedTags.length}/5）
            </Text>
            <View style={styles.editTagsGrid}>
              {ALL_TAGS.map((tag) => {
                const active = selectedTags.includes(tag);
                return (
                  <Pressable
                    key={tag}
                    style={[styles.editTag, active && styles.editTagActive]}
                    onPress={() => toggleTag(tag)}
                  >
                    <Text
                      style={[
                        styles.editTagText,
                        active && styles.editTagTextActive,
                      ]}
                    >
                      {tag}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.editActions}>
              <Pressable
                style={styles.editCancel}
                onPress={() => setEditing(false)}
              >
                <Text style={styles.editCancelText}>キャンセル</Text>
              </Pressable>
              <Pressable
                style={[styles.editSave, saving && { opacity: 0.5 }]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.editSaveText}>保存</Text>
                )}
              </Pressable>
            </View>
          </View>
        ) : (
          <>
            <Text style={styles.nickname}>{user.nickname}</Text>
            {user.location_zone ? (
              <Text style={styles.location}>📍 {user.location_zone}</Text>
            ) : null}
            {user.bio ? <Text style={styles.bio}>{user.bio}</Text> : null}
            <View style={styles.tagsRow}>
              {user.tags.map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
            <Pressable style={styles.editButton} onPress={startEditing}>
              <Text style={styles.editButtonText}>プロフィールを編集</Text>
            </Pressable>
          </>
        )}
      </View>

      {/* Stats */}
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
          participatedWaves.map((wave) => (
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
              <Text style={styles.historyArrow}>›</Text>
            </Pressable>
          ))
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>🌊</Text>
            <Text style={styles.emptyText}>
              まだ参加した波はありません
            </Text>
            <Pressable
              style={styles.emptyButton}
              onPress={() => router.push("/(tabs)")}
            >
              <Text style={styles.emptyButtonText}>波を探す</Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* Settings */}
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
    paddingBottom: 80,
  },
  // Profile card
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
    lineHeight: 20,
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
  editButton: {
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
  },
  editButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  // Edit form
  editForm: {
    width: "100%",
    gap: 10,
  },
  editInput: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: "#fff",
  },
  editBio: {
    minHeight: 60,
    textAlignVertical: "top",
  },
  editLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 4,
  },
  editTagsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  editTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  editTagActive: {
    backgroundColor: "rgba(255,255,255,0.25)",
    borderColor: "#fff",
  },
  editTagText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 13,
    fontWeight: "500",
  },
  editTagTextActive: {
    color: "#fff",
    fontWeight: "700",
  },
  editActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  editCancel: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
  },
  editCancelText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    fontWeight: "600",
  },
  editSave: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  editSaveText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: "700",
  },
  // Stats
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
  // History
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
  historyArrow: {
    fontSize: 20,
    color: Colors.textLight,
  },
  // Empty state
  emptyCard: {
    alignItems: "center",
    paddingVertical: 32,
    gap: 8,
  },
  emptyEmoji: {
    fontSize: 40,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: "center",
  },
  emptyButton: {
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.primary,
  },
  emptyButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  // Settings
  settingsButton: {
    marginHorizontal: 16,
    marginTop: 12,
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
