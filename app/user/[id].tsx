import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { supabase } from "../../lib/supabase";
import { Colors } from "../../lib/colors";
import { User } from "../../types";

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", id)
        .eq("is_public", true)
        .single();

      if (error || !data) {
        setNotFound(true);
      } else {
        setProfile(data as User);
      }
      setLoading(false);
    })();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (notFound || !profile) {
    return (
      <View style={styles.centered}>
        <Text style={styles.notFoundTitle}>非公開プロフィール</Text>
        <Text style={styles.notFoundSub}>
          このユーザーのプロフィールは公開されていません
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{profile.nickname[0]}</Text>
        </View>
        <Text style={styles.nickname}>{profile.nickname}</Text>
        {profile.location_zone ? (
          <Text style={styles.location}>{profile.location_zone}</Text>
        ) : null}
        {profile.bio ? <Text style={styles.bio}>{profile.bio}</Text> : null}
      </View>

      {profile.tags.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>興味</Text>
          <View style={styles.tagsRow}>
            {profile.tags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { paddingBottom: 40 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Colors.bg, padding: 24 },
  notFoundTitle: { fontSize: 18, fontWeight: "700", color: Colors.text, marginBottom: 8 },
  notFoundSub: { fontSize: 14, color: Colors.textSecondary, textAlign: "center" },
  header: { backgroundColor: Colors.primary, padding: 28, alignItems: "center", gap: 6 },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: "rgba(255,255,255,0.15)", justifyContent: "center", alignItems: "center" },
  avatarText: { color: "#fff", fontSize: 28, fontWeight: "700" },
  nickname: { color: "#fff", fontSize: 22, fontWeight: "800" },
  location: { color: "rgba(255,255,255,0.65)", fontSize: 14 },
  bio: { color: "rgba(255,255,255,0.8)", fontSize: 14, textAlign: "center", lineHeight: 20, marginTop: 4 },
  section: { padding: 20 },
  sectionTitle: { fontSize: 14, fontWeight: "700", color: Colors.textSecondary, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  tag: { backgroundColor: Colors.primary + "15", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  tagText: { fontSize: 13, fontWeight: "600", color: Colors.primary },
});
