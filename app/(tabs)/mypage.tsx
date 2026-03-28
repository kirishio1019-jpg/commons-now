import React, { useState, useEffect } from "react";
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
  Switch,
} from "react-native";
import { router } from "expo-router";
import { useApp } from "../../contexts/AppContext";
import { useProfile } from "../../hooks/useProfile";
import { useWaves } from "../../hooks/useWaves";
import { useCommitments } from "../../hooks/useCommitments";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import { Colors } from "../../lib/colors";
import { Wave } from "../../types";
import { generateInsights, loadPreferences, buildInitialPreferences } from "../../lib/ai";
import type { UserPreferenceVector } from "../../lib/ai";

const ALL_TAGS = [
  "植樹", "料理", "読書", "音楽", "焚き火", "農業", "ハイキング",
  "ヨガ", "アート", "対話", "水循環", "DIY", "星空", "子ども", "瞑想",
];

export default function MyPageScreen() {
  const { user } = useApp();
  const { user: authUser } = useAuth();
  const { stats, loading: profileLoading, updateProfile } = useProfile();
  const { waves, loading: wavesLoading } = useWaves();
  const { commitments, loading: commitmentsLoading } = useCommitments();

  const [editing, setEditing] = useState(false);
  const [nickname, setNickname] = useState("");
  const [bio, setBio] = useState("");
  const [locationZone, setLocationZone] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<"waves" | "joined">("waves");
  const [aiPrefs, setAiPrefs] = useState<UserPreferenceVector | null>(null);
  const [insights, setInsights] = useState<string[]>([]);

  // Load AI insights
  useEffect(() => {
    if (!user) return;
    (async () => {
      const p = await loadPreferences(user.id) ?? buildInitialPreferences(user);
      setAiPrefs(p);
      setInsights(generateInsights(p, commitments, waves));
    })();
  }, [user?.id, commitments.length, waves.length]);

  // Fetch my created waves
  const [myWaves, setMyWaves] = useState<Wave[]>([]);
  const [myWavesLoading, setMyWavesLoading] = useState(true);

  useEffect(() => {
    if (!authUser) return;
    (async () => {
      // Get org IDs associated with this user
      const { data: orgs } = await supabase
        .from("organizations")
        .select("id")
        .eq("name", authUser.email?.split("@")[0] || "");

      if (orgs && orgs.length > 0) {
        const orgIds = orgs.map((o: any) => o.id);
        const { data: wavesData } = await supabase
          .from("waves")
          .select("*")
          .in("organizer_id", orgIds)
          .order("date", { ascending: false });
        setMyWaves((wavesData ?? []) as Wave[]);
      }
      setMyWavesLoading(false);
    })();
  }, [authUser?.id]);

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
    setIsPublic(user.is_public ?? false);
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
      is_public: isPublic,
    } as any);
    setSaving(false);
    setEditing(false);
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

            {/* Public toggle */}
            <View style={styles.toggleRow}>
              <View>
                <Text style={styles.toggleLabel}>プロフィールを公開</Text>
                <Text style={styles.toggleHint}>
                  他のユーザーがあなたのプロフィールを閲覧できます
                </Text>
              </View>
              <Switch
                value={isPublic}
                onValueChange={setIsPublic}
                trackColor={{ false: "rgba(255,255,255,0.2)", true: "rgba(255,255,255,0.5)" }}
                thumbColor={isPublic ? "#fff" : "rgba(255,255,255,0.6)"}
              />
            </View>

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
                      style={[styles.editTagText, active && styles.editTagTextActive]}
                    >
                      {tag}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.editActions}>
              <Pressable style={styles.editCancel} onPress={() => setEditing(false)}>
                <Text style={styles.editCancelText}>キャンセル</Text>
              </Pressable>
              <Pressable
                style={[styles.editSave, saving && { opacity: 0.5 }]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color={Colors.primary} />
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
              <Text style={styles.location}>{user.location_zone}</Text>
            ) : null}
            {user.bio ? <Text style={styles.bio}>{user.bio}</Text> : null}
            <View style={styles.tagsRow}>
              {user.tags.map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
            <View style={styles.profileMeta}>
              <View style={[styles.visibilityBadge, user.is_public && styles.visibilityPublic]}>
                <Text style={[styles.visibilityText, user.is_public && styles.visibilityTextPublic]}>
                  {user.is_public ? "公開" : "非公開"}
                </Text>
              </View>
            </View>
            <Pressable style={styles.editButton} onPress={startEditing}>
              <Text style={styles.editButtonText}>プロフィールを編集</Text>
            </Pressable>
          </>
        )}
      </View>

      {/* Stats */}
      <View style={styles.statsCard}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.eventsJoined}</Text>
            <Text style={styles.statLabel}>参加</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{myWaves.length}</Text>
            <Text style={styles.statLabel}>主催</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.treesPlanted}</Text>
            <Text style={styles.statLabel}>植樹</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.clipsPosted}</Text>
            <Text style={styles.statLabel}>投稿</Text>
          </View>
        </View>
      </View>

      {/* AI Insights */}
      {insights.length > 0 && (
        <View style={styles.insightsCard}>
          <Text style={styles.insightsTitle}>AI INSIGHTS</Text>
          {insights.map((text, i) => (
            <View key={i} style={styles.insightRow}>
              <View style={styles.insightDot} />
              <Text style={styles.insightText}>{text}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Section tabs */}
      <View style={styles.sectionTabs}>
        <Pressable
          style={[styles.sectionTab, activeSection === "waves" && styles.sectionTabActive]}
          onPress={() => setActiveSection("waves")}
        >
          <Text style={[styles.sectionTabText, activeSection === "waves" && styles.sectionTabTextActive]}>
            作成した波
          </Text>
        </Pressable>
        <Pressable
          style={[styles.sectionTab, activeSection === "joined" && styles.sectionTabActive]}
          onPress={() => setActiveSection("joined")}
        >
          <Text style={[styles.sectionTabText, activeSection === "joined" && styles.sectionTabTextActive]}>
            参加履歴
          </Text>
        </Pressable>
      </View>

      {/* Content based on active section */}
      <View style={styles.section}>
        {activeSection === "waves" ? (
          myWavesLoading ? (
            <ActivityIndicator size="small" color={Colors.primary} style={{ marginVertical: 24 }} />
          ) : myWaves.length > 0 ? (
            myWaves.map((wave) => (
              <Pressable
                key={wave.id}
                style={styles.waveItem}
                onPress={() => router.push(`/wave/${wave.id}`)}
              >
                <View style={styles.waveItemLeft}>
                  <View style={[styles.waveThemeBar, { backgroundColor: Colors.primaryLight }]} />
                  <View style={styles.waveItemInfo}>
                    <Text style={styles.waveItemTitle} numberOfLines={1}>{wave.title}</Text>
                    <Text style={styles.waveItemMeta}>
                      {wave.date} / {wave.current_participants}/{wave.capacity}人
                    </Text>
                  </View>
                </View>
                <Text style={styles.chevron}>›</Text>
              </Pressable>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>まだ波を作成していません</Text>
              <Text style={styles.emptySub}>
                コミュニティに波を起こしてみましょう
              </Text>
              <Pressable
                style={styles.emptyAction}
                onPress={() => router.push("/wave/create")}
              >
                <Text style={styles.emptyActionText}>波を作成</Text>
              </Pressable>
            </View>
          )
        ) : participatedWaves.length > 0 ? (
          participatedWaves.map((wave) => (
            <Pressable
              key={wave.id}
              style={styles.waveItem}
              onPress={() => router.push(`/wave/${wave.id}`)}
            >
              <View style={styles.waveItemLeft}>
                <View style={[styles.waveThemeBar, { backgroundColor: Colors.going }]} />
                <View style={styles.waveItemInfo}>
                  <Text style={styles.waveItemTitle} numberOfLines={1}>{wave.title}</Text>
                  <Text style={styles.waveItemMeta}>
                    {wave.date} / {wave.location.name}
                  </Text>
                </View>
              </View>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>まだ参加した波はありません</Text>
            <Text style={styles.emptySub}>
              フィードから気になる波を見つけてみましょう
            </Text>
            <Pressable
              style={styles.emptyAction}
              onPress={() => router.push("/(tabs)")}
            >
              <Text style={styles.emptyActionText}>波を探す</Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* Settings */}
      <Pressable style={styles.settingsButton} onPress={() => router.push("/settings")}>
        <Text style={styles.settingsText}>設定</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  content: { paddingBottom: 80 },

  // Profile
  profileCard: { backgroundColor: Colors.primary, padding: 28, alignItems: "center", gap: 6 },
  avatar: { width: 68, height: 68, borderRadius: 34, backgroundColor: "rgba(255,255,255,0.15)", justifyContent: "center", alignItems: "center", marginBottom: 4 },
  avatarText: { color: "#fff", fontSize: 26, fontWeight: "700" },
  nickname: { color: "#fff", fontSize: 20, fontWeight: "800", letterSpacing: -0.3 },
  location: { color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: "500" },
  bio: { color: "rgba(255,255,255,0.75)", fontSize: 13, textAlign: "center", lineHeight: 19, marginTop: 2 },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 5, marginTop: 6 },
  tag: { backgroundColor: "rgba(255,255,255,0.12)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  tagText: { color: "rgba(255,255,255,0.85)", fontSize: 11, fontWeight: "600" },
  profileMeta: { flexDirection: "row", marginTop: 6, gap: 8 },
  visibilityBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8, borderWidth: 1, borderColor: "rgba(255,255,255,0.25)" },
  visibilityPublic: { borderColor: "rgba(255,255,255,0.5)", backgroundColor: "rgba(255,255,255,0.1)" },
  visibilityText: { fontSize: 11, fontWeight: "600", color: "rgba(255,255,255,0.5)" },
  visibilityTextPublic: { color: "rgba(255,255,255,0.85)" },
  editButton: { marginTop: 10, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: "rgba(255,255,255,0.3)" },
  editButtonText: { color: "rgba(255,255,255,0.85)", fontSize: 13, fontWeight: "600" },

  // Edit form
  editForm: { width: "100%", gap: 10 },
  editInput: { backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: "#fff" },
  editBio: { minHeight: 56, textAlignVertical: "top" },
  toggleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 8 },
  toggleLabel: { color: "rgba(255,255,255,0.9)", fontSize: 14, fontWeight: "600" },
  toggleHint: { color: "rgba(255,255,255,0.5)", fontSize: 11, marginTop: 2 },
  editLabel: { color: "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: "600", marginTop: 4, textTransform: "uppercase", letterSpacing: 0.5 },
  editTagsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  editTag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" },
  editTagActive: { backgroundColor: "rgba(255,255,255,0.2)", borderColor: "rgba(255,255,255,0.6)" },
  editTagText: { color: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: "500" },
  editTagTextActive: { color: "#fff", fontWeight: "700" },
  editActions: { flexDirection: "row", gap: 10, marginTop: 8 },
  editCancel: { flex: 1, paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: "rgba(255,255,255,0.25)", alignItems: "center" },
  editCancelText: { color: "rgba(255,255,255,0.7)", fontSize: 14, fontWeight: "600" },
  editSave: { flex: 1, paddingVertical: 12, borderRadius: 8, backgroundColor: "#fff", alignItems: "center" },
  editSaveText: { color: Colors.primary, fontSize: 14, fontWeight: "700" },

  // Stats
  statsCard: { marginHorizontal: 16, marginTop: 16, padding: 16, backgroundColor: Colors.bgCard, borderRadius: 12, borderWidth: 1, borderColor: Colors.border },
  statsRow: { flexDirection: "row", justifyContent: "space-around", alignItems: "center" },
  statItem: { alignItems: "center", gap: 2, flex: 1 },
  statValue: { fontSize: 20, fontWeight: "800", color: Colors.text },
  statLabel: { fontSize: 11, color: Colors.textSecondary, fontWeight: "500" },
  statDivider: { width: 1, height: 28, backgroundColor: Colors.border },

  // AI Insights
  insightsCard: { marginHorizontal: 16, marginTop: 12, padding: 16, backgroundColor: Colors.primary + "08", borderRadius: 12, borderWidth: 1, borderColor: Colors.primary + "20" },
  insightsTitle: { fontSize: 10, fontWeight: "800", color: Colors.primary, letterSpacing: 1.5, marginBottom: 10 },
  insightRow: { flexDirection: "row", alignItems: "flex-start", gap: 8, marginBottom: 6 },
  insightDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.primary, marginTop: 6 },
  insightText: { fontSize: 13, color: Colors.text, lineHeight: 18, flex: 1 },

  // Section tabs
  sectionTabs: { flexDirection: "row", marginHorizontal: 16, marginTop: 16, borderBottomWidth: 1, borderBottomColor: Colors.border },
  sectionTab: { flex: 1, paddingVertical: 12, alignItems: "center" },
  sectionTabActive: { borderBottomWidth: 2, borderBottomColor: Colors.text },
  sectionTabText: { fontSize: 13, fontWeight: "600", color: Colors.textLight },
  sectionTabTextActive: { color: Colors.text },

  // Wave list
  section: { paddingHorizontal: 16, paddingTop: 4 },
  waveItem: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.border },
  waveItemLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  waveThemeBar: { width: 3, height: 36, borderRadius: 2 },
  waveItemInfo: { flex: 1, gap: 2 },
  waveItemTitle: { fontSize: 14, fontWeight: "600", color: Colors.text },
  waveItemMeta: { fontSize: 12, color: Colors.textSecondary },
  chevron: { fontSize: 18, color: Colors.textLight, fontWeight: "300" },

  // Empty state
  emptyState: { alignItems: "center", paddingVertical: 32, gap: 6 },
  emptyTitle: { fontSize: 14, fontWeight: "600", color: Colors.text },
  emptySub: { fontSize: 12, color: Colors.textSecondary, textAlign: "center" },
  emptyAction: { marginTop: 12, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, backgroundColor: Colors.primary },
  emptyActionText: { color: "#fff", fontSize: 13, fontWeight: "600" },

  // Settings
  settingsButton: { marginHorizontal: 16, marginTop: 16, padding: 14, backgroundColor: Colors.bgCard, borderRadius: 10, borderWidth: 1, borderColor: Colors.border, alignItems: "center" },
  settingsText: { fontSize: 14, fontWeight: "600", color: Colors.textSecondary },
});
