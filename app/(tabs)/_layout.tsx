import { Tabs } from "expo-router";
import { Text, StyleSheet } from "react-native";
import { Colors } from "../../lib/colors";

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  const icons: Record<string, string> = {
    ホーム: "🌊",
    マップ: "🗺️",
    通知: "🔔",
    マイページ: "👤",
  };
  return (
    <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>
      {icons[label] ?? "●"}
    </Text>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#fff",
        tabBarInactiveTintColor: "rgba(255,255,255,0.5)",
        tabBarStyle: {
          backgroundColor: "rgba(0,0,0,0.85)",
          borderTopColor: "rgba(255,255,255,0.1)",
          paddingBottom: 4,
          height: 60,
          position: "absolute",
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "ホーム",
          tabBarIcon: ({ focused }) => (
            <TabIcon label="ホーム" focused={focused} />
          ),
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
          tabBarIcon: ({ focused }) => (
            <TabIcon label="マップ" focused={focused} />
          ),
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
          tabBarIcon: ({ focused }) => (
            <TabIcon label="通知" focused={focused} />
          ),
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
          tabBarIcon: ({ focused }) => (
            <TabIcon label="マイページ" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
