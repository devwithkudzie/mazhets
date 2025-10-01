import React, { useState } from "react";
import { SafeAreaView, View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image, Platform, Alert } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Sell() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const CATEGORIES = ["Electronics", "Phones", "Computers", "Fashion", "Furniture", "Appliances", "Vehicles", "Misc"] as const;
  const CONDITIONS = ["New", "Like New", "Good", "Fair"] as const;
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("Misc");
  const [condition, setCondition] = useState<(typeof CONDITIONS)[number]>("Good");

  const pickImage = async () => {
    if (Platform.OS === "web") return; // handled by sell.web.tsx
    const ImagePicker = await import("expo-image-picker");
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 3,
    });
    if (!res.canceled) {
      const uris = res.assets.map((a: any) => a.uri);
      setImages((prev) => [...prev, ...uris].slice(0, 3));
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn} accessibilityLabel="Back">
          <Text style={{ fontWeight: "700" }}>{"<"}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create listing</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        <View>
          <Text style={styles.label}>Title</Text>
          <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="What are you selling?" maxLength={80} />
        </View>
        <View>
          <Text style={styles.label}>Price</Text>
          <TextInput style={styles.input} value={price} onChangeText={setPrice} placeholder="$0.00" keyboardType="numeric" />
        </View>
        <View>
          <Text style={styles.label}>Location</Text>
          <TextInput style={styles.input} value={location} onChangeText={setLocation} placeholder="City" />
        </View>

        <View>
          <Text style={styles.label}>Category</Text>
          <View style={styles.pillsRow}>
            {CATEGORIES.map((c) => (
              <TouchableOpacity key={c} onPress={() => setCategory(c)} style={[styles.pill, category === c && styles.pillActive]}>
                <Text style={[styles.pillText, category === c && styles.pillTextActive]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View>
          <Text style={styles.label}>Condition</Text>
          <View style={styles.pillsRow}>
            {CONDITIONS.map((c) => (
              <TouchableOpacity key={c} onPress={() => setCondition(c)} style={[styles.pill, condition === c && styles.pillActive]}>
                <Text style={[styles.pillText, condition === c && styles.pillTextActive]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, { height: 100, textAlignVertical: "top" }]}
            value={description}
            onChangeText={setDescription}
            placeholder="Add details buyers need to know"
            multiline
            maxLength={600}
          />
        </View>

        <View>
          <Text style={styles.label}>Photos (up to 3)</Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {images.map((uri) => (
              <Image key={uri} source={{ uri }} style={{ width: 80, height: 80, borderRadius: 8 }} />
            ))}
            {images.length < 3 && (
              <TouchableOpacity onPress={pickImage} style={styles.addPhoto} accessibilityLabel="Add photo">
                <Text style={{ color: "#1877F2", fontWeight: "700" }}>+ Add</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <TouchableOpacity
          style={styles.submitBtn}
          accessibilityLabel="Publish"
          onPress={async () => {
            const v = await AsyncStorage.getItem("@logged_in");
            if (v === "false") { alert("Please sign in to publish a listing."); return; }
            if (!title.trim()) { Alert.alert("Missing title", "Please enter a title for your listing."); return; }
            if (Platform.OS !== "web" && images.length < 1) { Alert.alert("Add at least 1 photo", "Photos help buyers trust your listing."); return; }
            const numeric = Number(String(price).replace(/[^0-9.]/g, ""));
            const priceOut = isFinite(numeric) && numeric > 0 ? `$${numeric}` : "$0.00";
            const id = String(Date.now());
            const listing = {
              id,
              title: title.trim(),
              price: priceOut,
              location: location || "",
              image: images[0] ? { uri: images[0] } : undefined,
              images: images.map((u) => ({ uri: u } as any)),
              seller: { id: "101", name: "You" },
              category,
              condition,
              description,
            };
            const KEY = "@local_listings";
            try {
              const raw = await AsyncStorage.getItem(KEY);
              const arr = raw ? JSON.parse(raw) : [];
              arr.unshift(listing);
              await AsyncStorage.setItem(KEY, JSON.stringify(arr));
              Alert.alert("Published", "Your listing is live.");
              router.replace("/");
            } catch {}
          }}
        >
          <Text style={styles.submitText}>Publish</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 56,
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
  label: { color: "#555", marginBottom: 6 },
  input: {
    height: 44,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#ddd",
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    color: "#111",
  },
  submitBtn: {
    height: 48,
    borderRadius: 8,
    backgroundColor: "#1877F2",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  submitText: { color: "#fff", fontWeight: "700" },
  addPhoto: { width: 80, height: 80, borderRadius: 8, borderWidth: StyleSheet.hairlineWidth, borderColor: "#ddd", alignItems: "center", justifyContent: "center", backgroundColor: "#f7f7f7" },
  pillsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  pill: { height: 32, paddingHorizontal: 12, borderRadius: 16, backgroundColor: "#f7f7f7", borderWidth: StyleSheet.hairlineWidth, borderColor: "#e3e3e7", alignItems: "center", justifyContent: "center" },
  pillActive: { backgroundColor: "#e9f1ff", borderColor: "#b9d4ff" },
  pillText: { color: "#111", fontSize: 12 },
  pillTextActive: { color: "#1877F2", fontWeight: "700" },
});


