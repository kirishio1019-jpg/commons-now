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
import { useWaves } from "../../hooks/useWaves";
import { useClips } from "../../hooks/useClips";
import { WaveFeedItem } from "../../components/WaveFeedItem";
import { useApp } from "../../contexts/AppContext";
import { CommitLevel } from "../../types";

export default function FeedScreen() {
  const { getCommitLevel, updateCommitLevel } = useApp();
  const { waves, loading: wavesLoading } = useWaves();
  const { clips } = useClips();
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<"today" | "week">("today");
  const [layoutSize, setLayoutSize] = useState({ width: 390, height: 844 });
  const flatListRef = useRef<FlatList>(null);

  const itemHeight = layoutSize.height;
  const itemWidth = layoutSize.width;

  const feedData = useMemo(() => {
    return waves.map((wave) => {
      const clip = clips.find((c) => c.wave_id === wave.id);
      return { wave, clipCaption: clip?.caption, key: wave.id };
    });
  }, [waves, clips]);

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
      const next: CommitLevel =
        current === "none"
          ? "curious"
          : current === "curious"
            ? "maybe"
            : current === "maybe"
              ? "going"
              : "going";
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
});
