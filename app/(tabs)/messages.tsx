import React, { useMemo, useState, useEffect } from "react";
import { SafeAreaView, View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import Feather from "@expo/vector-icons/Feather";
import { chatList, CHAT_LIST_KEY } from "../../constants/messages";
import { getJSON } from "../../lib/storage";

export default function Messages() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [chats, setChats] = useState(chatList);
  
  // Refresh chats when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        const stored = await getJSON(CHAT_LIST_KEY, chatList);
        setChats([...stored]);
      })();
    }, [])
  );
  
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return chats.filter((c) => c.seller.name.toLowerCase().includes(q) || c.lastMessage.toLowerCase().includes(q));
  }, [query, chats]);

  const formatTime = (iso?: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    const diff = Date.now() - d.getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "Just now";
    if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h`;
    const days = Math.floor(h / 24);
    return `${days}d`;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={styles.topBar}>
        <Text style={styles.title}>Messages</Text>
        <View style={styles.searchWrap}>
          <Feather name="search" size={16} color="#888" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search chats"
            placeholderTextColor="#888"
            value={query}
            onChangeText={setQuery}
          />
        </View>
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: "#f0f0f0" }} />}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.row}
            onPress={() => router.push(`/messages/${item.seller.id}`)}
          >
            <View style={styles.avatar} />
            <View style={{ flex: 1 }}>
              <Text style={styles.name} numberOfLines={1}>{item.seller.name}</Text>
              <Text style={styles.snippet} numberOfLines={1}>{item.lastMessage}</Text>
            </View>
            <Text style={styles.time}>{formatTime(item.timestamp)}</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: 8 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  topBar: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: "#fff",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eee",
    gap: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111",
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#f7f7f7",
    borderRadius: 20,
    paddingHorizontal: 12,
    height: 36,
  },
  searchInput: {
    flex: 1,
    color: "#111",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#e9f0ff",
  },
  name: {
    fontWeight: "700",
    color: "#111",
  },
  snippet: {
    color: "#666",
    fontSize: 12,
    marginTop: 2,
  },
  time: {
    color: "#888",
    fontSize: 12,
  },
});



