import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Colors } from "../../lib/colors";
import { useClips } from "../../hooks/useClips";

export default function ClipPostScreen() {
  const { waveId } = useLocalSearchParams<{ waveId?: string }>();
  const { postClip } = useClips();
  const [caption, setCaption] = useState("");
  const [media, setMedia] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [posting, setPosting] = useState(false);

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

  const handlePost = async () => {
    if (!media || !waveId || caption.length === 0) return;

    setPosting(true);
    try {
      await postClip({
        waveId,
        caption,
        mediaUri: media.uri,
        durationSec: Math.min(media.duration ? Math.round(media.duration / 1000) : 0, 15),
      });
      Alert.alert(
        "クリップを投稿しました",
        "審査後にフィードに反映されます。次の誰かを動かすかもしれません。",
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (err: any) {
      Alert.alert("投稿に失敗しました", err.message);
    } finally {
      setPosting(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Media selection area */}
      <Pressable style={styles.mediaArea} onPress={handleSelectMedia}>
        {media ? (
          <View style={styles.mediaPreview}>
            <Text style={styles.previewIcon}>🎬</Text>
            <Text style={styles.previewText}>クリップ選択済み</Text>
            <Text style={styles.previewDuration}>
              {media.duration
                ? `${Math.round(media.duration / 1000)}秒`
                : "写真"}
            </Text>
          </View>
        ) : (
          <View style={styles.mediaPlaceholder}>
            <Text style={styles.mediaIcon}>📷</Text>
            <Text style={styles.mediaText}>
              タップして動画または写真を選択
            </Text>
            <Text style={styles.mediaHint}>15秒以内の縦型動画 または 写真1〜3枚</Text>
          </View>
        )}
      </Pressable>

      {/* Caption input */}
      <View style={styles.captionSection}>
        <Text style={styles.label}>ひとこと（40字以内）</Text>
        <TextInput
          style={styles.captionInput}
          value={caption}
          onChangeText={(text) => text.length <= 40 && setCaption(text)}
          placeholder="この体験を一言で..."
          placeholderTextColor={Colors.textLight}
          multiline
        />
        <Text style={styles.charCount}>{caption.length}/40</Text>
      </View>

      {/* Info */}
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          📌 クリップはCommons Now内のみで公開されます{"\n"}
          📌 AI自動審査 + 団体レビュー後にフィードに表示{"\n"}
          📌 顔のぼかし処理はデフォルトでONです
        </Text>
      </View>

      {/* Submit button */}
      <Pressable
        style={[
          styles.submitButton,
          (!media || caption.length === 0 || posting) && styles.submitDisabled,
        ]}
        onPress={handlePost}
        disabled={!media || caption.length === 0 || posting}
      >
        {posting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitText}>クリップを投稿する</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
    padding: 20,
  },
  mediaArea: {
    height: 300,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 20,
  },
  mediaPlaceholder: {
    flex: 1,
    backgroundColor: Colors.bgDark,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    borderRadius: 16,
  },
  mediaIcon: {
    fontSize: 48,
    opacity: 0.7,
  },
  mediaText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 15,
    fontWeight: "600",
  },
  mediaHint: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
  },
  mediaPreview: {
    flex: 1,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    borderRadius: 16,
  },
  previewIcon: {
    fontSize: 48,
  },
  previewText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  previewDuration: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
  },
  captionSection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 8,
  },
  captionInput: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: Colors.text,
    minHeight: 60,
    textAlignVertical: "top",
  },
  charCount: {
    textAlign: "right",
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 4,
  },
  infoBox: {
    backgroundColor: "#F0F9FF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 24,
  },
  infoText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: "center",
  },
  submitDisabled: {
    opacity: 0.4,
  },
  submitText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
