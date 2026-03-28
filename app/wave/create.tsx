import React, { useState, useCallback, useRef } from "react";
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
  Switch,
} from "react-native";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";
import { Colors } from "../../lib/colors";
import { AnimatedBackground } from "../../components/AnimatedBackground";
// Video is now generated in real-time by VideoCompositor — no pre-generation needed

const THEMES = [
  "植樹", "食", "物語", "雨水収集", "音楽", "ヨガ", "アート",
  "対話", "DIY", "ハイキング", "焚き火", "農業", "瞑想", "星空", "子どもと",
];

// Nominatim geocoding (OpenStreetMap, free, no API key)
interface GeoResult {
  display_name: string;
  lat: string;
  lon: string;
}

async function searchLocation(query: string): Promise<GeoResult[]> {
  if (query.length < 2) return [];
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=jp&accept-language=ja`,
      { headers: { "User-Agent": "CommonsNow/1.0" } }
    );
    return await res.json();
  } catch {
    return [];
  }
}

export default function CreateWaveScreen() {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [theme, setTheme] = useState("");
  const [description, setDescription] = useState("");
  const [isOnline, setIsOnline] = useState(false);
  const [locationQuery, setLocationQuery] = useState("");
  const [locationName, setLocationName] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [meetingUrl, setMeetingUrl] = useState("");
  const [date, setDate] = useState("");
  const [timeStart, setTimeStart] = useState("");
  const [timeEnd, setTimeEnd] = useState("");
  const [capacity, setCapacity] = useState("");
  const [media, setMedia] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [clipCaption, setClipCaption] = useState("");
  const [posting, setPosting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Location search
  const [geoResults, setGeoResults] = useState<GeoResult[]>([]);
  const [searching, setSearching] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleLocationInput = useCallback((text: string) => {
    setLocationQuery(text);
    setLocationName("");
    setLatitude("");
    setLongitude("");

    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (text.length < 2) { setGeoResults([]); return; }

    setSearching(true);
    searchTimer.current = setTimeout(async () => {
      const results = await searchLocation(text);
      setGeoResults(results);
      setSearching(false);
    }, 400);
  }, []);

  const selectLocation = (result: GeoResult) => {
    setLocationName(result.display_name);
    setLocationQuery(result.display_name.split(",")[0]);
    setLatitude(result.lat);
    setLongitude(result.lon);
    setGeoResults([]);
  };

  const locationValid = isOnline
    ? meetingUrl.length > 0
    : locationName.length > 0 && latitude.length > 0;

  const isValid =
    title.length > 0 &&
    theme.length > 0 &&
    description.length > 0 &&
    locationValid &&
    date.length > 0 &&
    timeStart.length > 0 &&
    capacity.length > 0;

  const handleSelectMedia = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["videos", "images"], quality: 0.8, videoMaxDuration: 15,
    });
    if (!result.canceled && result.assets[0]) setMedia(result.assets[0]);
  };

  const showAlert = (t: string, msg?: string) => {
    if (Platform.OS === "web") window.alert(msg ? `${t}\n${msg}` : t);
    else Alert.alert(t, msg);
  };

  const handleSubmit = async () => {
    if (!user || !isValid) return;
    setPosting(true);

    try {
      let orgId: string;
      const { data: existingOrg } = await supabase
        .from("organizations").select("id").eq("name", user.email || user.id).limit(1).single();
      if (existingOrg) {
        orgId = existingOrg.id;
      } else {
        const { data: newOrg, error: orgErr } = await supabase
          .from("organizations").insert({ name: user.email?.split("@")[0] || "個人", type: "individual_steward", description: "個人オーガナイザー" })
          .select("id").single();
        if (orgErr) throw orgErr;
        orgId = newOrg.id;
      }

      const location = isOnline
        ? { name: "オンライン", address: meetingUrl, latitude: 0, longitude: 0, is_online: true }
        : { name: locationName, address: locationName, latitude: parseFloat(latitude) || 0, longitude: parseFloat(longitude) || 0, is_online: false };

      const { data: wave, error: waveErr } = await supabase.from("waves").insert({
        title, theme, description, location, date,
        time_start: timeStart, time_end: timeEnd || timeStart,
        organizer_id: orgId, capacity: parseInt(capacity, 10) || 10,
        current_participants: 0,
        eco_impact_target: { trees_planted: 0, water_collected_liters: 0, meals_shared: 0, contributor_count: 0 },
        image_url: "", is_personalized: false, is_auto_generated: false, status: "upcoming",
      }).select("id").single();
      if (waveErr) throw waveErr;

      // Upload user clip if attached
      if (media && wave) {
        try {
          const fileExt = media.uri.split(".").pop() ?? "mp4";
          const fileName = `${user.id}/${Date.now()}.${fileExt}`;
          const response = await globalThis.fetch(media.uri);
          const blob = await response.blob();
          const { error: uploadErr } = await supabase.storage.from("clips").upload(fileName, blob, {
            contentType: media.type === "video" ? `video/${fileExt}` : `image/${fileExt}`,
          });
          if (!uploadErr) {
            const { data: { publicUrl } } = supabase.storage.from("clips").getPublicUrl(fileName);
            await supabase.from("clips").insert({
              wave_id: wave.id, user_id: user.id, media_url: publicUrl, thumbnail_url: publicUrl,
              caption: clipCaption || "", duration_sec: media.duration ? Math.min(Math.round(media.duration / 1000), 15) : 0,
              moderation_status: "pending", feed_score: 0,
            });
          }
        } catch {}
      }

      // Show video preview
      setShowPreview(true);
    } catch (err: any) {
      showAlert("作成に失敗しました", err.message || "エラーが発生しました");
      setPosting(false);
    }
  };

  // Preview screen after creation
  if (showPreview) {
    return (
      <View style={s.previewContainer}>
        <AnimatedBackground theme={theme} isActive={true} description={description} title={title} />
        <View style={s.previewGradient} />
        <View style={s.previewContent}>
          <Text style={s.previewLabel}>イベントを作成しました</Text>
          <Text style={s.previewTitle}>{title}</Text>
          <Text style={s.previewTheme}>#{theme}</Text>
          <Text style={s.previewDesc} numberOfLines={3}>{description}</Text>
          <View style={s.previewMeta}>
            <Text style={s.previewMetaText}>{date} {timeStart}</Text>
            {!isOnline && <Text style={s.previewMetaText}>{locationQuery || locationName.split(",")[0]}</Text>}
            {isOnline && <Text style={s.previewMetaText}>オンライン</Text>}
          </View>
          <Pressable style={s.previewButton} onPress={() => router.replace("/(tabs)")}>
            <Text style={s.previewButtonText}>フィードに戻る</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
      <Text style={s.heading}>イベントを作成</Text>

      {/* Theme */}
      <Text style={s.label}>テーマ</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 4 }}>
        {THEMES.map((t) => (
          <Pressable key={t} style={[s.chip, theme === t && s.chipActive]} onPress={() => setTheme(t)}>
            <Text style={[s.chipText, theme === t && s.chipTextActive]}>{t}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Title */}
      <Text style={s.label}>タイトル</Text>
      <TextInput style={s.input} value={title} onChangeText={setTitle} placeholder="例: 朝の植樹 — 冬の森に命を還す" placeholderTextColor={Colors.textLight} />

      {/* Description */}
      <Text style={s.label}>説明</Text>
      <TextInput style={[s.input, { minHeight: 80, textAlignVertical: "top" }]} value={description} onChangeText={setDescription} placeholder="どんな体験ができるか、持ち物など..." placeholderTextColor={Colors.textLight} multiline numberOfLines={4} />

      {/* Video preview thumbnail */}
      {title.length > 0 && theme.length > 0 && (
        <View style={s.videoPreview}>
          <AnimatedBackground theme={theme} isActive={true} description={description} title={title} />
          <View style={s.videoPreviewOverlay}>
            <Text style={s.videoPreviewLabel}>自動生成プレビュー</Text>
          </View>
        </View>
      )}

      {/* Online toggle */}
      <View style={s.toggleRow}>
        <Text style={s.toggleLabel}>オンライン開催</Text>
        <Switch value={isOnline} onValueChange={setIsOnline} trackColor={{ false: Colors.border, true: Colors.primary + "60" }} thumbColor={isOnline ? Colors.primary : "#ccc"} />
      </View>

      {isOnline ? (
        <>
          <Text style={s.label}>参加URL（必須）</Text>
          <TextInput style={s.input} value={meetingUrl} onChangeText={setMeetingUrl} placeholder="https://zoom.us/j/..." placeholderTextColor={Colors.textLight} />
        </>
      ) : (
        <>
          <Text style={s.label}>場所（必須）</Text>
          <TextInput
            style={s.input}
            value={locationQuery}
            onChangeText={handleLocationInput}
            placeholder="場所を検索（例: 砧公園、渋谷駅）"
            placeholderTextColor={Colors.textLight}
          />

          {/* Search results dropdown */}
          {searching && (
            <View style={s.searchStatus}>
              <ActivityIndicator size="small" color={Colors.primary} />
              <Text style={s.searchStatusText}>検索中...</Text>
            </View>
          )}

          {geoResults.length > 0 && (
            <View style={s.resultsList}>
              {geoResults.map((r, i) => (
                <Pressable key={i} style={s.resultItem} onPress={() => selectLocation(r)}>
                  <Text style={s.resultName} numberOfLines={1}>
                    {r.display_name.split(",")[0]}
                  </Text>
                  <Text style={s.resultAddress} numberOfLines={1}>
                    {r.display_name}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}

          {/* Selected location indicator */}
          {locationName.length > 0 && (
            <View style={s.selectedLocation}>
              <View style={s.selectedDot} />
              <View style={{ flex: 1 }}>
                <Text style={s.selectedName}>{locationQuery}</Text>
                <Text style={s.selectedCoords}>{latitude}, {longitude}</Text>
              </View>
            </View>
          )}
        </>
      )}

      {/* Date & Time */}
      <Text style={s.label}>日付</Text>
      <TextInput style={s.input} value={date} onChangeText={setDate} placeholder="2026-04-15" placeholderTextColor={Colors.textLight} />
      <View style={s.row}>
        <View style={s.half}>
          <Text style={s.label}>開始時間</Text>
          <TextInput style={s.input} value={timeStart} onChangeText={setTimeStart} placeholder="10:00" placeholderTextColor={Colors.textLight} />
        </View>
        <View style={s.half}>
          <Text style={s.label}>終了時間</Text>
          <TextInput style={s.input} value={timeEnd} onChangeText={setTimeEnd} placeholder="13:00" placeholderTextColor={Colors.textLight} />
        </View>
      </View>

      {/* Capacity */}
      <Text style={s.label}>定員</Text>
      <TextInput style={s.input} value={capacity} onChangeText={(t) => setCapacity(t.replace(/[^0-9]/g, ""))} placeholder="10" placeholderTextColor={Colors.textLight} keyboardType="number-pad" />

      {/* Clip */}
      <Text style={s.label}>クリップ（任意）</Text>
      {media ? (
        <View style={s.mediaPreview}>
          {media.type === "image" ? (
            <Image source={{ uri: media.uri }} style={{ width: 80, height: 80 }} resizeMode="cover" />
          ) : (
            <View style={{ width: 80, height: 80, backgroundColor: Colors.primary, justifyContent: "center", alignItems: "center" }}>
              <Text style={{ color: "#fff", fontSize: 12 }}>{media.duration ? `${Math.round(media.duration / 1000)}s` : "動画"}</Text>
            </View>
          )}
          <View style={{ flex: 1, padding: 8, gap: 4 }}>
            <TextInput style={{ fontSize: 13, color: Colors.text, borderBottomWidth: 1, borderBottomColor: Colors.border, paddingBottom: 4 }} value={clipCaption} onChangeText={(t) => t.length <= 40 && setClipCaption(t)} placeholder="ひとこと（40字以内）" placeholderTextColor={Colors.textLight} />
            <Pressable onPress={() => { setMedia(null); setClipCaption(""); }}>
              <Text style={{ fontSize: 12, color: "#EF4444", fontWeight: "600" }}>削除</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <Pressable style={s.mediaButton} onPress={handleSelectMedia}>
          <Text style={{ fontSize: 14, color: Colors.textSecondary }}>+ 動画・写真を追加</Text>
        </Pressable>
      )}

      {/* Submit */}
      <Pressable style={[s.submit, (!isValid || posting) && { opacity: 0.4 }]} onPress={handleSubmit} disabled={!isValid || posting}>
        {posting ? <ActivityIndicator color="#fff" /> : <Text style={s.submitText}>イベントを作成</Text>}
      </Pressable>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: 20, paddingBottom: 60 },
  heading: { fontSize: 22, fontWeight: "800", color: Colors.primary, marginBottom: 20, letterSpacing: -0.3 },
  label: { fontSize: 12, fontWeight: "700", color: Colors.textSecondary, marginBottom: 4, marginTop: 14, textTransform: "uppercase", letterSpacing: 0.5 },
  input: { backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border, borderRadius: 8, padding: 12, fontSize: 14, color: Colors.text },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 6, backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border, marginRight: 6 },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: 13, color: Colors.text, fontWeight: "500" },
  chipTextActive: { color: "#fff" },
  toggleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 14, paddingVertical: 4 },
  toggleLabel: { fontSize: 14, fontWeight: "600", color: Colors.text },
  row: { flexDirection: "row", gap: 10 },
  half: { flex: 1 },
  mediaButton: { borderWidth: 1, borderColor: Colors.border, borderStyle: "dashed", borderRadius: 8, paddingVertical: 20, alignItems: "center", marginTop: 4 },
  mediaPreview: { flexDirection: "row", backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border, borderRadius: 8, overflow: "hidden", marginTop: 4 },
  submit: { backgroundColor: Colors.primary, paddingVertical: 16, borderRadius: 8, alignItems: "center", marginTop: 28 },
  submitText: { color: "#fff", fontSize: 15, fontWeight: "700" },

  // Location search
  searchStatus: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 8 },
  searchStatusText: { fontSize: 12, color: Colors.textSecondary },
  resultsList: { backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border, borderRadius: 8, marginTop: 4, overflow: "hidden" },
  resultItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: Colors.border },
  resultName: { fontSize: 14, fontWeight: "600", color: Colors.text },
  resultAddress: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  selectedLocation: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 8, padding: 10, backgroundColor: Colors.primary + "08", borderRadius: 8, borderWidth: 1, borderColor: Colors.primary + "20" },
  selectedDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary },
  selectedName: { fontSize: 13, fontWeight: "600", color: Colors.text },
  selectedCoords: { fontSize: 11, color: Colors.textSecondary, marginTop: 1 },

  // Video preview in form
  videoPreview: { height: 120, borderRadius: 10, overflow: "hidden", marginTop: 10 },
  videoPreviewOverlay: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 8, backgroundColor: "rgba(0,0,0,0.4)" },
  videoPreviewLabel: { color: "rgba(255,255,255,0.7)", fontSize: 10, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },

  // Full-screen preview after creation
  previewContainer: { flex: 1, backgroundColor: "#000" },
  previewGradient: {
    ...StyleSheet.absoluteFillObject, zIndex: 2,
    // @ts-ignore
    backgroundImage: "linear-gradient(transparent 30%, rgba(0,0,0,0.85) 100%)",
  },
  previewContent: { position: "absolute", bottom: 60, left: 24, right: 24, zIndex: 10, gap: 8 },
  previewLabel: { color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1 },
  previewTitle: { color: "#fff", fontSize: 24, fontWeight: "800", letterSpacing: -0.5, lineHeight: 30 },
  previewTheme: { color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: "600" },
  previewDesc: { color: "rgba(255,255,255,0.7)", fontSize: 14, lineHeight: 20 },
  previewMeta: { flexDirection: "row", gap: 12, marginTop: 4 },
  previewMetaText: { color: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: "500" },
  previewButton: { marginTop: 16, paddingVertical: 14, borderRadius: 8, backgroundColor: "#fff", alignItems: "center" },
  previewButtonText: { color: "#000", fontSize: 15, fontWeight: "700" },
});
