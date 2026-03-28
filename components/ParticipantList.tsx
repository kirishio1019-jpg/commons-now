import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { Participant } from "../types";
import { Colors } from "../lib/colors";

interface ParticipantListProps {
  participants: Participant[];
}

function ParticipantItem({ item }: { item: Participant }) {
  return (
    <View style={styles.item}>
      {/* Avatar placeholder */}
      <View style={styles.avatar}>
        <Text style={styles.avatarIcon}>👤</Text>
      </View>
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{item.nickname}</Text>
          {item.age_range && (
            <Text style={styles.age}>・{item.age_range}</Text>
          )}
        </View>
        {item.bio && (
          <Text style={styles.bio} numberOfLines={1}>
            {item.bio}
          </Text>
        )}
        <View style={styles.badges}>
          {item.is_first_time && (
            <View style={[styles.badge, { backgroundColor: "#DBEAFE" }]}>
              <Text style={[styles.badgeText, { color: "#1D4ED8" }]}>
                初参加
              </Text>
            </View>
          )}
          {item.has_kids && (
            <View style={[styles.badge, { backgroundColor: "#FEF3C7" }]}>
              <Text style={[styles.badgeText, { color: "#92400E" }]}>
                子連れ
              </Text>
            </View>
          )}
          {item.is_repeat && (
            <View style={[styles.badge, { backgroundColor: "#D1FAE5" }]}>
              <Text style={[styles.badgeText, { color: "#065F46" }]}>
                リピーター
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

export function ParticipantList({ participants }: ParticipantListProps) {
  return (
    <View>
      <Text style={styles.header}>
        参加予定者（{participants.length}人）
      </Text>
      {participants.map((p) => (
        <ParticipantItem key={p.id} item={p} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 12,
  },
  item: {
    flexDirection: "row",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarIcon: {
    fontSize: 20,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  name: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text,
  },
  age: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  bio: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  badges: {
    flexDirection: "row",
    gap: 6,
    marginTop: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
});
