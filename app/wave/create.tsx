import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";
import { Colors } from "../../lib/colors";

const THEMES = [
  "植樹",
  "食",
  "物語",
  "雨水収集",
  "音楽",
  "ヨガ",
  "アート",
  "対話",
  "DIY",
  "ハイキング",
  "焚き火",
  "農業",
  "瞑想",
  "星空",
  "子どもと",
];

export default function CreateWaveScreen() {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [theme, setTheme] = useState("");
  const [description, setDescription] = useState("");
  const [locationName, setLocationName] = useState("");
  const [address, setAddress] = useState("");
  const [date, setDate] = useState("");
  const [timeStart, setTimeStart] = useState("");
  const [timeEnd, setTimeEnd] = useState("");
  const [capacity, setCapacity] = useState("");
  const [posting, setPosting] = useState(false);

  const isValid =
    title.length > 0 &&
    theme.length > 0 &&
    description.length > 0 &&
    locationName.length > 0 &&
    date.length > 0 &&
    timeStart.length > 0 &&
    capacity.length > 0;

  const handleSubmit = async () => {
    if (!user || !isValid) return;

    setPosting(true);
    try {
      const { error } = await supabase.from("waves").insert({
        title,
        theme,
        description,
        location: {
          name: locationName,
          address: address || locationName,
          latitude: 35.68,
          longitude: 139.76,
        },
        date,
        time_start: timeStart,
        time_end: timeEnd || timeStart,
        organizer_id: user.id,
        capacity: parseInt(capacity, 10) || 10,
        current_participants: 0,
        eco_impact_target: {
          trees_planted: 0,
          water_collected_liters: 0,
          meals_shared: 0,
          contributor_count: 0,
        },
        image_url: "",
        is_personalized: false,
        is_auto_generated: false,
        status: "active",
      });

      if (error) throw error;

      if (Platform.OS === "web") {
        window.alert("波を作成しました！");
      } else {
        Alert.alert("波を作成しました！", "フィードに表示されます。");
      }
      router.back();
    } catch (err: any) {
      const msg = err.message || "エラーが発生しました";
      if (Platform.OS === "web") {
        window.alert("作成に失敗: " + msg);
      } else {
        Alert.alert("作成に失敗しました", msg);
      }
    } finally {
      setPosting(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.heading}>新しい波を起こす</Text>
      <Text style={styles.subheading}>
        地域の人が集まるきっかけを作りましょう
      </Text>

      {/* Theme */}
      <Text style={styles.label}>テーマ</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.themeScroll}
      >
        {THEMES.map((t) => (
          <Pressable
            key={t}
            style={[styles.themeChip, theme === t && styles.themeChipActive]}
            onPress={() => setTheme(t)}
          >
            <Text
              style={[
                styles.themeChipText,
                theme === t && styles.themeChipTextActive,
              ]}
            >
              {t}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Title */}
      <Text style={styles.label}>タイトル</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="例: 朝の植樹 — 冬の森に命を還す"
        placeholderTextColor={Colors.textLight}
      />

      {/* Description */}
      <Text style={styles.label}>説明</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={description}
        onChangeText={setDescription}
        placeholder="どんな体験ができるか、誰でも参加できるか、持ち物など..."
        placeholderTextColor={Colors.textLight}
        multiline
        numberOfLines={4}
      />

      {/* Location */}
      <Text style={styles.label}>場所の名前</Text>
      <TextInput
        style={styles.input}
        value={locationName}
        onChangeText={setLocationName}
        placeholder="例: 砧公園 東側広場"
        placeholderTextColor={Colors.textLight}
      />

      <Text style={styles.label}>住所（任意）</Text>
      <TextInput
        style={styles.input}
        value={address}
        onChangeText={setAddress}
        placeholder="例: 東京都世田谷区砧公園1-1"
        placeholderTextColor={Colors.textLight}
      />

      {/* Date & Time */}
      <Text style={styles.label}>日付</Text>
      <TextInput
        style={styles.input}
        value={date}
        onChangeText={setDate}
        placeholder="2026-04-15"
        placeholderTextColor={Colors.textLight}
      />

      <View style={styles.row}>
        <View style={styles.half}>
          <Text style={styles.label}>開始時間</Text>
          <TextInput
            style={styles.input}
            value={timeStart}
            onChangeText={setTimeStart}
            placeholder="10:00"
            placeholderTextColor={Colors.textLight}
          />
        </View>
        <View style={styles.half}>
          <Text style={styles.label}>終了時間</Text>
          <TextInput
            style={styles.input}
            value={timeEnd}
            onChangeText={setTimeEnd}
            placeholder="13:00"
            placeholderTextColor={Colors.textLight}
          />
        </View>
      </View>

      {/* Capacity */}
      <Text style={styles.label}>定員</Text>
      <TextInput
        style={styles.input}
        value={capacity}
        onChangeText={(t) => setCapacity(t.replace(/[^0-9]/g, ""))}
        placeholder="10"
        placeholderTextColor={Colors.textLight}
        keyboardType="number-pad"
      />

      {/* Submit */}
      <Pressable
        style={[styles.submitButton, (!isValid || posting) && styles.disabled]}
        onPress={handleSubmit}
        disabled={!isValid || posting}
      >
        {posting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitText}>波を起こす 🌊</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  content: {
    padding: 20,
    paddingBottom: 60,
  },
  heading: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.primary,
    marginBottom: 4,
  },
  subheading: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 6,
    marginTop: 16,
  },
  input: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: Colors.text,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  themeScroll: {
    marginBottom: 4,
  },
  themeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
  },
  themeChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  themeChipText: {
    fontSize: 13,
    color: Colors.text,
    fontWeight: "500",
  },
  themeChipTextActive: {
    color: "#fff",
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  half: {
    flex: 1,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: "center",
    marginTop: 32,
  },
  disabled: {
    opacity: 0.4,
  },
  submitText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
