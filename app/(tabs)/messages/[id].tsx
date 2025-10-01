import React, { useMemo, useRef, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView, View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import Ionicons from "@expo/vector-icons/Ionicons";
import { chatMessages, chatList, quickReplies, createOrUpdateChat, CHAT_LIST_KEY, CHAT_MSG_PREFIX } from "../../../constants/messages";
import { setJSON, getJSON } from "../../../lib/storage";

// Use the quickReplies from constants instead of local TEMPLATES

export default function ChatThread() {
  const { id, productId, sellerName: sellerNameParam } = useLocalSearchParams<{ id: string; productId?: string; sellerName?: string }>();
  const router = useRouter();
  const [input, setInput] = useState("");
  const listRef = useRef<FlatList | null>(null);

  const chatId = `c-${id}`;
  const [local, setLocal] = useState(() => chatMessages.filter((m) => m.chatId === chatId));

  // Seller name (from list or param)
  const sellerName = useMemo(() => chatList.find((c) => c.seller.id === id)?.seller.name || String(sellerNameParam || "Chat"), [id, sellerNameParam]);

  // Load persisted messages for this chat and update preview
  React.useEffect(() => {
    (async () => {
      const stored = await getJSON(CHAT_MSG_PREFIX + chatId, [] as typeof local);
      if (stored.length) {
        setLocal(stored);
        const latest = stored[stored.length - 1]?.text || "";
        const updated = createOrUpdateChat(String(id), sellerName, latest);
        setJSON(CHAT_LIST_KEY, updated);
      }
    })();
  }, [chatId, id, sellerName]);
  React.useEffect(() => {
    const latest = local[local.length - 1]?.text || "";
    const updated = createOrUpdateChat(String(id), sellerName, latest);
    setJSON(CHAT_LIST_KEY, updated);
  }, [id]);

  const send = (text: string) => {
    if (!text.trim()) return;
    const msg = {
      id: String(Date.now()),
      chatId: `c-${id}`,
      from: "me" as const,
      text,
      createdAt: new Date().toISOString(),
    };
    setLocal((prev) => {
      const next = [...prev, msg];
      setJSON(CHAT_MSG_PREFIX + chatId, next);
      return next;
    });
    setInput("");
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 0);

    // Create or update chat in messages list
    const updated = createOrUpdateChat(id, sellerName, text);
    setJSON(CHAT_LIST_KEY, updated);

    // Auto-reply simulation
    setTimeout(() => {
      const autoReplies = [
        "Sure, that works for me!",
        "Yes, it's still available.",
        "I can do that price.",
        "Let me know when you're ready.",
        "Sounds good!",
        "Perfect timing!",
        "I'll be there.",
        "Thanks for your interest!",
      ];
      const randomReply = autoReplies[Math.floor(Math.random() * autoReplies.length)];
      const autoMsg = {
        id: String(Date.now() + 1),
        chatId: `c-${id}`,
        from: "seller" as const,
        text: randomReply,
        createdAt: new Date().toISOString(),
      };
      setLocal((prev) => {
        const next = [...prev, autoMsg];
        setJSON(CHAT_MSG_PREFIX + chatId, next);
        return next;
      });
      
      // Update chat with seller's reply
      const afterReply = createOrUpdateChat(id, sellerName, randomReply);
      setJSON(CHAT_LIST_KEY, afterReply);
      
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }, 1000 + Math.random() * 2000); // Random delay between 1-3 seconds
  };

  

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push("/messages")} style={styles.iconBtn} accessibilityLabel="Back to messages">
          <Feather name="chevron-left" size={20} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">{sellerName}</Text>
        <TouchableOpacity
          onPress={() => Alert.alert("Call", `Calling ${sellerName}...`)}
          style={styles.iconBtn}
          accessibilityLabel="Call seller"
        >
          <Ionicons name="call" size={18} color="#22C55E" />
        </TouchableOpacity>
      </View>

      <FlatList
        ref={listRef}
        data={local}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 12, paddingBottom: 8 }}
        renderItem={({ item }) => (
          <View style={[styles.bubble, item.from === "me" ? styles.mine : styles.theirs]}>
            <Text style={item.from === "me" ? styles.mineText : styles.theirsText}>{item.text}</Text>
          </View>
        )}
      />

      <View style={styles.templatesRow}>
        <FlatList
          data={quickReplies}
          keyExtractor={(t) => t}
          horizontal
          showsHorizontalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ width: 8 }} />}
          contentContainerStyle={{ paddingHorizontal: 12 }}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => send(item)} style={styles.templateChip}>
              <Text style={styles.templateText} numberOfLines={1}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <KeyboardAvoidingView behavior={Platform.select({ ios: "padding", android: undefined })} keyboardVerticalOffset={80}>
        <View style={styles.composer}>
          <TextInput
            style={styles.input}
            placeholder="Write a message"
            placeholderTextColor="#888"
            value={input}
            onChangeText={setInput}
          />
          <TouchableOpacity onPress={() => send(input)} style={styles.sendBtn} accessibilityLabel="Send">
            <Ionicons name="send" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 48,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eee",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f1f1f5",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontWeight: "700",
    fontSize: 16,
    color: "#111",
    flex: 1,
  },
  bubble: {
    maxWidth: "80%",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginVertical: 4,
  },
  mine: {
    alignSelf: "flex-end",
    backgroundColor: "#204E9C",
  },
  mineText: { color: "#fff" },
  theirs: {
    alignSelf: "flex-start",
    backgroundColor: "#f1f1f5",
  },
  theirsText: { color: "#111" },
  templatesRow: {
    height: 56,
    justifyContent: "center",
  },
  templateChip: {
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 18,
    backgroundColor: "#f7f7f7",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#e3e3e7",
  },
  templateText: { color: "#111", fontSize: 12 },
  composer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#eee",
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    backgroundColor: "#f7f7f7",
    borderRadius: 20,
    paddingHorizontal: 12,
    height: 40,
    color: "#111",
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#204E9C",
    alignItems: "center",
    justifyContent: "center",
  },
});


