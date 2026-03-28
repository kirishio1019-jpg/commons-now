import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Pressable,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { useApp } from "../contexts/AppContext";
import { useAuth } from "../contexts/AuthContext";
import { useProfile } from "../hooks/useProfile";
import { Colors } from "../lib/colors";

interface SettingRowProps {
  label: string;
  description?: string;
  value: boolean;
  onToggle: (v: boolean) => void;
}

function SettingRow({ label, description, value, onToggle }: SettingRowProps) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingInfo}>
        <Text style={styles.settingLabel}>{label}</Text>
        {description && (
          <Text style={styles.settingDesc}>{description}</Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ true: Colors.primary, false: Colors.border }}
        thumbColor="#fff"
      />
    </View>
  );
}

export default function SettingsScreen() {
  const { user } = useApp();
  const { signOut } = useAuth();
  const { updateProfile } = useProfile();
  const [waveNotif, setWaveNotif] = useState(true);
  const [reminderNotif, setReminderNotif] = useState(true);
  const [nudgeNotif, setNudgeNotif] = useState(true);
  const [reportNotif, setReportNotif] = useState(true);
  const [faceBlur, setFaceBlur] = useState(true);
  const [locationShare, setLocationShare] = useState(true);

  const handleSignOut = () => {
    Alert.alert("ログアウト", "本当にログアウトしますか？", [
      { text: "キャンセル", style: "cancel" },
      {
        text: "ログアウト",
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/auth");
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Notification settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>通知設定</Text>
        <SettingRow
          label="波の発生通知"
          description="近くで新しい波が起きた時"
          value={waveNotif}
          onToggle={setWaveNotif}
        />
        <SettingRow
          label="前日リマインド"
          description="コミットしたイベントの前日"
          value={reminderNotif}
          onToggle={setReminderNotif}
        />
        <SettingRow
          label="つながりナッジ"
          description="オフライン参加がないときの優しいお知らせ"
          value={nudgeNotif}
          onToggle={setNudgeNotif}
        />
        <SettingRow
          label="貢献レポート"
          description="参加後のインパクトレポート"
          value={reportNotif}
          onToggle={setReportNotif}
        />
      </View>

      {/* Privacy settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>プライバシー</Text>
        <SettingRow
          label="顔の自動ぼかし"
          description="クリップに映る顔を自動でぼかす"
          value={faceBlur}
          onToggle={setFaceBlur}
        />
        <SettingRow
          label="位置情報の共有"
          description="市区町村レベルのみ使用します"
          value={locationShare}
          onToggle={setLocationShare}
        />
      </View>

      {/* AI Profile */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>AIプロファイル</Text>
        <View style={styles.profileCard}>
          <Text style={styles.profileLabel}>推定プロファイル</Text>
          <View style={styles.profileTags}>
            {(user?.tags ?? []).map((tag) => (
              <View key={tag} style={styles.profileTag}>
                <Text style={styles.profileTagText}>{tag}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.profileNote}>
            あなたの行動パターンからAIが推定したプロファイルです。{"\n"}
            これに基づいて波がパーソナライズされます。
          </Text>
        </View>
      </View>

      {/* About */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>アプリについて</Text>
        <View style={styles.aboutRow}>
          <Text style={styles.aboutLabel}>バージョン</Text>
          <Text style={styles.aboutValue}>1.0.0 (MVP)</Text>
        </View>
        <View style={styles.aboutRow}>
          <Text style={styles.aboutLabel}>利用規約</Text>
          <Text style={styles.aboutLink}>開く ›</Text>
        </View>
        <View style={styles.aboutRow}>
          <Text style={styles.aboutLabel}>プライバシーポリシー</Text>
          <Text style={styles.aboutLink}>開く ›</Text>
        </View>
      </View>

      {/* Sign out */}
      <View style={styles.section}>
        <Pressable style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>ログアウト</Text>
        </Pressable>
      </View>

      {/* Danger zone */}
      <View style={styles.section}>
        <Pressable style={styles.dangerButton}>
          <Text style={styles.dangerText}>アカウントを削除</Text>
        </Pressable>
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
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
    gap: 2,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text,
  },
  settingDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  profileCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
  },
  profileLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
  },
  profileTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  profileTag: {
    backgroundColor: Colors.primary + "15",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  profileTagText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: "500",
  },
  profileNote: {
    fontSize: 12,
    color: Colors.textLight,
    lineHeight: 18,
  },
  aboutRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  aboutLabel: {
    fontSize: 15,
    color: Colors.text,
  },
  aboutValue: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  aboutLink: {
    fontSize: 15,
    color: Colors.primaryLighter,
    fontWeight: "600",
  },
  signOutButton: {
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: Colors.bgCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  signOutText: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: "600",
  },
  dangerButton: {
    paddingVertical: 14,
    alignItems: "center",
  },
  dangerText: {
    color: Colors.nudge,
    fontSize: 15,
    fontWeight: "600",
  },
});
