import React, { useState, useRef, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Platform,
  Pressable,
  ViewToken,
  LayoutChangeEvent,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { useWaves } from "../../hooks/useWaves";
import { useClips } from "../../hooks/useClips";
import { useCommitments } from "../../hooks/useCommitments";
import { WaveFeedItem } from "../../components/WaveFeedItem";
import { useApp } from "../../contexts/AppContext";
import { CommitLevel } from "../../types";
import { Colors } from "../../lib/colors";
import { personalizeWaves } from "../../lib/personalize";

export default function FeedScreen() {
  const { user, getCommitLevel, updateCommitLevel } = useApp();
  const { waves, loading: wavesLoading } = useWaves();
  const { clips } = useClips();
  const { commitments } = useCommitments();
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<"today" | "week">("today");
  const [layoutSize, setLayoutSize] = useState({ width: 390, height: 844 });
  const flatListRef = useRef<FlatList>(null);

  const itemHeight = layoutSize.height;
  const itemWidth = layoutSize.width;

  // AI-powered personalized feed
  const personalizedWaves = useMemo(
    () => personalizeWaves({ waves, user, commitments }),
    [waves, user, commitments]
  );

  const feedData = useMemo(() => {
    return personalizedWaves.map((wave) => {
      const clip = clips.find((c) => c.wave_id === wave.id);
      return { wave, clipCaption: clip?.caption, key: wave.id };
    });
  }, [personalizedWaves, clips]);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setLayoutSize({ width, height });
  }, []);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setActiveIndex(viewableItems[0].index);
      }
    },
    []
  );

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 60,
  }).current;

  const handleCommit = useCallback(
    (waveId: string) => {
      const current = getCommitLevel(waveId);
      const order: CommitLevel[] = ["none", "curious", "maybe", "going"];
      const idx = order.indexOf(current);
      const next = idx < order.length - 1 ? order[idx + 1] : order[0];
      updateCommitLevel(waveId, next);
    },
    [getCommitLevel, updateCommitLevel]
  );

  if (wavesLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>波を読み込み中...</Text>
      </View>
    );
  }

  if (feedData.length === 0) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text style={{ color: "rgba(255,255,255,0.2)", fontSize: 48, fontWeight: "200" }}>W</Text>
        <Text style={[styles.loadingText, { fontSize: 16, fontWeight: "700", marginTop: 12 }]}>
          まだ波がありません
        </Text>
        <Text style={[styles.loadingText, { marginTop: 4, color: "rgba(255,255,255,0.5)" }]}>
          最初の波を起こしてみましょう
        </Text>
        <Pressable
          style={{ marginTop: 20, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8, backgroundColor: "#fff" }}
          onPress={() => router.push("/wave/create")}
        >
          <Text style={{ color: "#000", fontSize: 14, fontWeight: "700" }}>
            波を作成
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container} onLayout={onLayout}>
      {/* Floating tab switcher */}
      <View style={styles.tabRow}>
        <Pressable
          style={[styles.tab, activeTab === "today" && styles.tabActive]}
          onPress={() => setActiveTab("today")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "today" && styles.tabTextActive,
            ]}
          >
            今日の波
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === "week" && styles.tabActive]}
          onPress={() => setActiveTab("week")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "week" && styles.tabTextActive,
            ]}
          >
            今週の波
          </Text>
        </Pressable>
      </View>

      {/* Create button */}
      <Pressable style={styles.fab} onPress={() => router.push("/wave/create")}>
        <Text style={styles.fabText}>+</Text>
      </Pressable>

      <FlatList
        ref={flatListRef}
        data={feedData}
        keyExtractor={(item) => item.key}
        renderItem={({ item, index }) => (
          <WaveFeedItem
            wave={item.wave}
            clipCaption={item.clipCaption}
            isActive={index === activeIndex}
            commitLevel={getCommitLevel(item.wave.id)}
            onCommit={() => handleCommit(item.wave.id)}
            itemHeight={itemHeight}
            itemWidth={itemWidth}
          />
        )}
        pagingEnabled
        snapToInterval={itemHeight}
        snapToAlignment="start"
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(_, index) => ({
          length: itemHeight,
          offset: itemHeight * index,
          index,
        })}
        windowSize={3}
        maxToRenderPerBatch={2}
        removeClippedSubviews
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#fff",
    fontSize: 14,
    marginTop: 12,
  },
  tabRow: {
    position: "absolute",
    top: 45,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    zIndex: 100,
  },
  tab: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  tabActive: {
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255,255,255,0.6)",
  },
  tabTextActive: {
    color: "#fff",
  },
  fab: {
    position: "absolute",
    bottom: 70,
    right: 14,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  fabText: {
    color: "#000",
    fontSize: 24,
    fontWeight: "300",
    lineHeight: 26,
  },
});
