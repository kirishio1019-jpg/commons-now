import { Tabs } from "expo-router";
import { View, Text, StyleSheet } from "react-native";
import { Colors } from "../../lib/colors";

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  return (
    <View style={[tabStyles.iconWrap, focused && tabStyles.iconWrapActive]}>
      <Text style={[tabStyles.icon, focused && tabStyles.iconActive]}>
        {label[0]}
      </Text>
    </View>
  );
}

const tabStyles = StyleSheet.create({
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  iconWrapActive: {
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  icon: {
    fontSize: 13,
    fontWeight: "700",
    color: "rgba(255,255,255,0.4)",
  },
  iconActive: {
    color: "#fff",
  },
});

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#fff",
        tabBarInactiveTintColor: "rgba(255,255,255,0.4)",
        tabBarStyle: {
          backgroundColor: "rgba(0,0,0,0.92)",
          borderTopColor: "rgba(255,255,255,0.06)",
          borderTopWidth: 1,
          paddingBottom: 4,
          height: 56,
          position: "absolute",
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: "600", letterSpacing: 0.2 },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "フィード",
          tabBarIcon: ({ focused }) => <TabIcon label="F" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: "マップ",
          headerShown: true,
          headerTitle: "マップ",
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: "#fff",
          tabBarIcon: ({ focused }) => <TabIcon label="M" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: "通知",
          headerShown: true,
          headerTitle: "通知",
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: "#fff",
          tabBarIcon: ({ focused }) => <TabIcon label="N" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="mypage"
        options={{
          title: "マイページ",
          headerShown: true,
          headerTitle: "マイページ",
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: "#fff",
          tabBarIcon: ({ focused }) => <TabIcon label="P" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
