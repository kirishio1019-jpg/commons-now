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
  Image,
} from "react-native";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
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
  const [media, setMedia] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [clipCaption, setClipCaption] = useState("");
  const [posting, setPosting] = useState(false);

  const isValid =
    title.length > 0 &&
    theme.length > 0 &&
    description.length > 0 &&
    locationName.length > 0 &&
    date.length > 0 &&
    timeStart.length > 0 &&
    capacity.length > 0;

  const handleSelectMedia = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["videos", "images"],
      quality: 0.8,
      videoMaxDuration: 15,
    });
    if (!result.canceled && result.assets[0]) {
      setMedia(result.assets[0]);
    }
  };

  const handleRemoveMedia = () => {
    setMedia(null);
    setClipCaption("");
  };

  const showAlert = (title: string, msg?: string) => {
    if (Platform.OS === "web") {
      window.alert(msg ? `${title}\n${msg}` : title);
    } else {
      Alert.alert(title, msg);
    }
  };

  const handleSubmit = async () => {
    if (!user || !isValid) return;

    setPosting(true);
    try {
      // Ensure user has an organization
      let orgId: string;
      const { data: existingOrg } = await supabase
        .from("organizations")
        .select("id")
        .eq("name", user.email || user.id)
        .limit(1)
        .single();

      if (existingOrg) {
        orgId = existingOrg.id;
      } else {
        const { data: newOrg, error: orgErr } = await supabase
          .from("organizations")
          .insert({
            name: user.email?.split("@")[0] || "個人",
            type: "individual_steward",
            description: "個人オーガナイザー",
          })
          .select("id")
          .single();
        if (orgErr) throw orgErr;
        orgId = newOrg.id;
      }

      // Create wave
      const { data: wave, error: waveErr } = await supabase
        .from("waves")
        .insert({
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
          organizer_id: orgId,
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
          status: "upcoming",
        })
        .select("id")
        .single();

      if (waveErr) throw waveErr;

      // Upload clip if attached
      if (media && wave) {
        try {
          const fileExt = media.uri.split(".").pop() ?? "mp4";
          const fileName = `${user.id}/${Date.now()}.${fileExt}`;
          const response = await globalThis.fetch(media.uri);
          const blob = await response.blob();

          const { error: uploadErr } = await supabase.storage
            .from("clips")
            .upload(fileName, blob, {
              contentType: media.type === "video" ? `video/${fileExt}` : `image/${fileExt}`,
            });

          if (!uploadErr) {
            const {
              data: { publicUrl },
            } = supabase.storage.from("clips").getPublicUrl(fileName);

            await supabase.from("clips").insert({
              wave_id: wave.id,
              user_id: user.id,
              media_url: publicUrl,
              thumbnail_url: publicUrl,
              caption: clipCaption || "",
              duration_sec: media.duration
                ? Math.min(Math.round(media.duration / 1000), 15)
                : 0,
              moderation_status: "pending",
              feed_score: 0,
            });
          }
        } catch {
          // Clip upload failed but wave was created — that's OK
        }
      }

      showAlert("波を作成しました！", "フィードに表示されます。");
      router.back();
    } catch (err: any) {
      showAlert("作成に失敗しました", err.message || "エラーが発生しました");
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
        placeholder="どんな体験ができるか、持ち物など..."
        placeholderTextColor={Colors.textLight}
        multiline
        numberOfLines={4}
      />

      {/* Clip attachment */}
      <Text style={styles.label}>クリップ（任意）</Text>
      <Text style={styles.hint}>動画や写真を添付すると、フィードで目を引きます</Text>
      {media ? (
        <View style={styles.mediaPreview}>
          {media.type === "image" ? (
            <Image
              source={{ uri: media.uri }}
              style={styles.mediaThumbnail}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.mediaVideoPlaceholder}>
              <Text style={styles.mediaVideoIcon}>🎬</Text>
              <Text style={styles.mediaVideoText}>
                {media.duration
                  ? `${Math.round(media.duration / 1000)}秒`
                  : "動画"}
              </Text>
            </View>
          )}
          <View style={styles.mediaInfo}>
            <TextInput
              style={styles.clipCaptionInput}
              value={clipCaption}
              onChangeText={(t) => t.length <= 40 && setClipCaption(t)}
              placeholder="ひとこと（40字以内）"
              placeholderTextColor={Colors.textLight}
            />
            <Text style={styles.clipCharCount}>{clipCaption.length}/40</Text>
            <Pressable style={styles.removeMedia} onPress={handleRemoveMedia}>
              <Text style={styles.removeMediaText}>削除</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <Pressable style={styles.mediaButton} onPress={handleSelectMedia}>
          <Text style={styles.mediaButtonIcon}>📷</Text>
          <Text style={styles.mediaButtonText}>動画・写真を追加</Text>
        </Pressable>
      )}

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
  hint: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 8,
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
  // Media / Clip
  mediaButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: "dashed",
    borderRadius: 12,
    paddingVertical: 24,
  },
  mediaButtonIcon: {
    fontSize: 24,
  },
  mediaButtonText: {
    fontSize: 15,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  mediaPreview: {
    flexDirection: "row",
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    overflow: "hidden",
  },
  mediaThumbnail: {
    width: 100,
    height: 100,
  },
  mediaVideoPlaceholder: {
    width: 100,
    height: 100,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  mediaVideoIcon: {
    fontSize: 28,
  },
  mediaVideoText: {
    color: "#fff",
    fontSize: 12,
    marginTop: 4,
  },
  mediaInfo: {
    flex: 1,
    padding: 10,
    gap: 4,
  },
  clipCaptionInput: {
    fontSize: 14,
    color: Colors.text,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: 6,
  },
  clipCharCount: {
    fontSize: 11,
    color: Colors.textLight,
    textAlign: "right",
  },
  removeMedia: {
    alignSelf: "flex-start",
    marginTop: 4,
  },
  removeMediaText: {
    fontSize: 13,
    color: "#EF4444",
    fontWeight: "600",
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
