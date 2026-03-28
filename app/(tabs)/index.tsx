import React, { useState, useRef, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
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
import { useAIFeed } from "../../hooks/useAIFeed";
import { eventTracker } from "../../lib/ai";

export default function FeedScreen() {
  const { user, getCommitLevel, updateCommitLevel } = useApp();
  const { waves, loading: wavesLoading } = useWaves();
  const { clips } = useClips();
  const { commitments } = useCommitments();
  const [activeIndex, setActiveIndex] = useState(0);
  const [layoutSize, setLayoutSize] = useState({ width: 390, height: 844 });
  const flatListRef = useRef<FlatList>(null);

  const itemHeight = layoutSize.height;
  const itemWidth = layoutSize.width;

  // AI-powered personalized feed
  const { rankedWaves } = useAIFeed(waves, commitments, user);

  const feedData = useMemo(() => {
    return rankedWaves.map((wave) => {
      const clip = clips.find((c) => c.wave_id === wave.id);
      return { wave, clipCaption: clip?.caption, key: wave.id };
    });
  }, [rankedWaves, clips]);

  const dwellStartRef = useRef<Record<string, number>>({});

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setLayoutSize({ width, height });
  }, []);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setActiveIndex(viewableItems[0].index);

        for (const item of viewableItems) {
          const wave = feedData[item.index ?? 0]?.wave;
          if (wave) {
            eventTracker.trackImpression(wave.id, item.index ?? 0, "ai_feed");
            dwellStartRef.current[wave.id] = Date.now();
          }
        }

        const visibleIds = new Set(viewableItems.map((v) => feedData[v.index ?? 0]?.wave?.id));
        for (const [waveId, startTime] of Object.entries(dwellStartRef.current)) {
          if (!visibleIds.has(waveId)) {
            eventTracker.trackDwell(waveId, Date.now() - startTime);
            delete dwellStartRef.current[waveId];
          }
        }
      }
    },
    [feedData]
  );

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 }).current;

  const handleCommit = useCallback(
    (waveId: string) => {
      const current = getCommitLevel(waveId);
      const order: CommitLevel[] = ["none", "curious", "maybe", "going"];
      const idx = order.indexOf(current);
      const next = idx < order.length - 1 ? order[idx + 1] : order[0];
      eventTracker.trackCommitChange(waveId, current, next);
      updateCommitLevel(waveId, next);
    },
    [getCommitLevel, updateCommitLevel]
  );

  if (wavesLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (feedData.length === 0) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.emptyLetter}>C</Text>
        <Text style={styles.emptyTitle}>まだ波がありません</Text>
        <Text style={styles.emptySub}>最初の波を起こしてみましょう</Text>
        <Pressable style={styles.emptyButton} onPress={() => router.push("/wave/create")}>
          <Text style={styles.emptyButtonText}>波を作成</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container} onLayout={onLayout}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Commons Now</Text>
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
  container: { flex: 1, backgroundColor: "#000" },
  center: { justifyContent: "center", alignItems: "center" },
  header: {
    position: "absolute", top: 46, left: 16, zIndex: 100,
  },
  headerTitle: {
    color: "rgba(255,255,255,0.9)", fontSize: 16, fontWeight: "800", letterSpacing: -0.3,
    textShadowColor: "rgba(0,0,0,0.5)", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3,
  },
  fab: {
    position: "absolute", bottom: 70, right: 14,
    width: 44, height: 44, borderRadius: 22, backgroundColor: "#fff",
    justifyContent: "center", alignItems: "center", zIndex: 200,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 6,
  },
  fabText: { color: "#000", fontSize: 24, fontWeight: "300", lineHeight: 26 },
  emptyLetter: { color: "rgba(255,255,255,0.15)", fontSize: 48, fontWeight: "200" },
  emptyTitle: { color: "#fff", fontSize: 16, fontWeight: "700", marginTop: 12 },
  emptySub: { color: "rgba(255,255,255,0.5)", fontSize: 13, marginTop: 4 },
  emptyButton: { marginTop: 20, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8, backgroundColor: "#fff" },
  emptyButtonText: { color: "#000", fontSize: 14, fontWeight: "700" },
});
