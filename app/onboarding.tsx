import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
} from "react-native";
import { router } from "expo-router";
import { Colors } from "../lib/colors";
import { useApp } from "../contexts/AppContext";
import { useProfile } from "../hooks/useProfile";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const INTEREST_TAGS = [
  "植樹",
  "料理",
  "読書",
  "音楽",
  "焚き火",
  "農業",
  "ハイキング",
  "ヨガ",
  "アート",
  "対話",
  "水循環",
  "DIY",
  "星空",
  "子ども",
  "瞑想",
];

export default function OnboardingScreen() {
  const { setIsOnboarded } = useApp();
  const { updateProfile } = useProfile();
  const [step, setStep] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : prev.length < 5
          ? [...prev, tag]
          : prev
    );
  };

  const handleComplete = async () => {
    // Save tags and mark onboarded in Supabase
    await updateProfile({
      tags: selectedTags,
      is_onboarded: true,
    });
    setIsOnboarded(true);
    router.replace("/(tabs)");
  };

  const steps = [
    // Step 1: Welcome + Location
    <View key="0" style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <Text style={styles.bigEmoji}>🌊</Text>
      </View>
      <Text style={styles.heading}>Commons Nowへようこそ</Text>
      <Text style={styles.subheading}>
        AIがあなたの近くでオフラインの「波」を起こします。{"\n"}
        まずは、位置情報を許可してください。
      </Text>
      <Text style={styles.note}>
        ※ 市区町村レベルの大まかな位置のみ使用します
      </Text>
      <Pressable
        style={styles.primaryButton}
        onPress={() => setStep(1)}
      >
        <Text style={styles.primaryButtonText}>位置情報を許可する</Text>
      </Pressable>
      <Pressable onPress={() => setStep(1)}>
        <Text style={styles.skipText}>あとで設定する</Text>
      </Pressable>
    </View>,

    // Step 2: Interest tags
    <View key="1" style={styles.stepContainer}>
      <Text style={styles.heading}>興味のあるテーマ</Text>
      <Text style={styles.subheading}>
        5つまで選んでください。あなたに合った波を届けます。
      </Text>
      <View style={styles.tagsContainer}>
        {INTEREST_TAGS.map((tag) => (
          <Pressable
            key={tag}
            style={[
              styles.tag,
              selectedTags.includes(tag) && styles.tagSelected,
            ]}
            onPress={() => toggleTag(tag)}
          >
            <Text
              style={[
                styles.tagText,
                selectedTags.includes(tag) && styles.tagTextSelected,
              ]}
            >
              {tag}
            </Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.tagCount}>{selectedTags.length}/5 選択中</Text>
      <Pressable
        style={[
          styles.primaryButton,
          selectedTags.length === 0 && styles.buttonDisabled,
        ]}
        onPress={() => selectedTags.length > 0 && setStep(2)}
      >
        <Text style={styles.primaryButtonText}>次へ</Text>
      </Pressable>
    </View>,

    // Step 3: Notifications
    <View key="2" style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <Text style={styles.bigEmoji}>🔔</Text>
      </View>
      <Text style={styles.heading}>波の通知を受け取る</Text>
      <Text style={styles.subheading}>
        あなた向けの波が近くで起きた時、お知らせします。{"\n"}
        孤独を感じた時も、そっと声をかけます。
      </Text>
      <Pressable style={styles.primaryButton} onPress={handleComplete}>
        <Text style={styles.primaryButtonText}>通知を許可する</Text>
      </Pressable>
      <Pressable onPress={handleComplete}>
        <Text style={styles.skipText}>あとで設定する</Text>
      </Pressable>
    </View>,
  ];

  return (
    <View style={styles.container}>
      {/* Progress dots */}
      <View style={styles.progressRow}>
        {[0, 1, 2].map((i) => (
          <View
            key={i}
            style={[
              styles.progressDot,
              i === step && styles.progressDotActive,
              i < step && styles.progressDotDone,
            ]}
          />
        ))}
      </View>

      {steps[step]}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
    paddingTop: 80,
    paddingHorizontal: 24,
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 40,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  progressDotActive: {
    backgroundColor: Colors.primary,
    width: 24,
  },
  progressDotDone: {
    backgroundColor: Colors.primaryLighter,
  },
  stepContainer: {
    flex: 1,
    alignItems: "center",
    gap: 16,
  },
  iconContainer: {
    marginBottom: 8,
  },
  bigEmoji: {
    fontSize: 64,
  },
  heading: {
    fontSize: 26,
    fontWeight: "800",
    color: Colors.text,
    textAlign: "center",
  },
  subheading: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  note: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: "center",
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 28,
    marginTop: 20,
    minWidth: 240,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  skipText: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginTop: 8,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
    marginTop: 8,
    paddingHorizontal: 8,
  },
  tag: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.bgCard,
  },
  tagSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  tagText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: "500",
  },
  tagTextSelected: {
    color: "#fff",
  },
  tagCount: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
});
