import { Tabs } from "expo-router";
import Feather from "@expo/vector-icons/Feather";
import { Text } from "react-native";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#1877F2",
        tabBarInactiveTintColor: "#777",
        tabBarShowLabel: true,
        tabBarLabelStyle: { fontSize: 11 },
        tabBarStyle: { backgroundColor: "#fff" },
        tabBarIconStyle: { margin: 0 },
        tabBarItemStyle: { paddingVertical: 4 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <Feather name="home" size={20} color={color} />,
          tabBarLabel: ({ focused, color }) => (
            <Text style={{ fontSize: 11, fontWeight: focused ? "700" : "500", color }}>Home</Text>
          ),
          tabBarBadgeStyle: { display: "none" },
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: "Categories",
          tabBarIcon: ({ color }) => (
            <Feather name="grid" size={20} color={color} />
          ),
          tabBarLabel: ({ focused, color }) => (
            <Text style={{ fontSize: 11, fontWeight: focused ? "700" : "500", color }}>Categories</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: "Messages",
          tabBarIcon: ({ color }) => (
            <Feather name="message-circle" size={20} color={color} />
          ),
          tabBarLabel: ({ focused, color }) => (
            <Text style={{ fontSize: 11, fontWeight: focused ? "700" : "500", color }}>Messages</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: "Saved",
          tabBarIcon: ({ color }) => (
            <Feather name="bookmark" size={20} color={color} />
          ),
          tabBarLabel: ({ focused, color }) => (
            <Text style={{ fontSize: 11, fontWeight: focused ? "700" : "500", color }}>Saved</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="sell"
        options={{
          title: "Sell",
          tabBarIcon: ({ color }) => (
            <Feather name="plus-circle" size={20} color={color} />
          ),
          tabBarLabel: ({ focused, color }) => (
            <Text style={{ fontSize: 11, fontWeight: focused ? "700" : "500", color }}>Sell</Text>
          ),
        }}
      />
      {/* Hidden routes (not shown in tab bar) */}
      <Tabs.Screen
        name="messages/[id]"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="product/[id]"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="store/[id]"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          href: null,
        }}
      />
      
      
    </Tabs>
  );
}


