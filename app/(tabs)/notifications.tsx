import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { useNotifications } from "../../hooks/useNotifications";
import { Notification, NotificationType } from "../../types";
import { Colors } from "../../lib/colors";

const TYPE_CONFIG: Record<NotificationType, { icon: string; color: string }> = {
  wave_nearby: { icon: "🌊", color: Colors.curious },
  reminder: { icon: "📅", color: Colors.maybe },
  isolation_nudge: { icon: "💚", color: Colors.nudge },
  contribution_report: { icon: "🌱", color: Colors.going },
  continuation_nudge: { icon: "🔄", color: Colors.info },
};

function NotificationItem({
  item,
  onPress,
}: {
  item: Notification;
  onPress: () => void;
}) {
  const config = TYPE_CONFIG[item.type];

  return (
    <Pressable
      style={[styles.item, !item.is_read && styles.itemUnread]}
      onPress={onPress}
    >
      <View style={[styles.iconCircle, { backgroundColor: config.color + "20" }]}>
        <Text style={styles.icon}>{config.icon}</Text>
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.title, !item.is_read && styles.titleUnread]}>
          {item.title}
        </Text>
        <Text style={styles.body} numberOfLines={2}>
          {item.body}
        </Text>
        <Text style={styles.time}>
          {formatRelativeTime(item.created_at)}
        </Text>
      </View>
      {!item.is_read && <View style={styles.unreadDot} />}
    </Pressable>
  );
}

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return "たった今";
  if (hours < 24) return `${hours}時間前`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}日前`;
  return `${Math.floor(days / 7)}週間前`;
}

export default function NotificationsScreen() {
  const { notifications, unreadCount, loading, markAsRead } = useNotifications();

  const handlePress = (notification: Notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    if (notification.wave_id) {
      router.push(`/wave/${notification.wave_id}`);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {unreadCount > 0 && (
        <View style={styles.unreadBanner}>
          <Text style={styles.unreadText}>
            {unreadCount}件の未読通知
          </Text>
        </View>
      )}
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NotificationItem item={item} onPress={() => handlePress(item)} />
        )}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  unreadBanner: {
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  unreadText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  list: {
    paddingVertical: 8,
  },
  item: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
    alignItems: "flex-start",
  },
  itemUnread: {
    backgroundColor: "#F0FDF4",
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    fontSize: 20,
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 15,
    fontWeight: "500",
    color: Colors.text,
  },
  titleUnread: {
    fontWeight: "700",
  },
  body: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  time: {
    fontSize: 11,
    color: Colors.textLight,
    marginTop: 2,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.going,
    marginTop: 6,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: 72,
  },
});
