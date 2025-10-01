import React, { useMemo, useState } from "react";
import { SafeAreaView, View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import { useRouter } from "expo-router";
import { products } from "../../constants/dummyData";

type CatMap = Record<string, string[]>;

const DEFAULT_CATEGORIES: CatMap = {
  Phones: ["Android", "iPhone", "Accessories"],
  Laptops: ["Windows", "MacBook", "Chromebook"],
  Furniture: ["Sofas", "Beds", "Tables", "Chairs"],
  Fashion: ["Men", "Women", "Kids", "Shoes"],
  Electronics: ["TVs", "Speakers", "Cameras"],
  Appliances: ["Fridges", "Cookers", "Microwaves"],
  Gaming: ["Consoles", "Games", "Accessories"],
  Cameras: ["DSLR", "Mirrorless", "Lenses"],
  Audio: ["Headphones", "Earbuds", "Speakers"],
};

export default function Categories() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const categories = useMemo(() => {
    const q = query.trim().toLowerCase();
    const fromDefaults = Object.entries(DEFAULT_CATEGORIES);
    // optionally derive a few buckets from product titles
    const derivedParents = Array.from(new Set(products.map(p => p.title.split(" ")[0])));
    const merged = new Map<string, string[]>();
    for (const [k, v] of fromDefaults) merged.set(k, v);
    for (const p of derivedParents) {
      if (!merged.has(p)) merged.set(p, []);
    }
    const entries = Array.from(merged.entries()).sort((a,b) => a[0].localeCompare(b[0]));
    if (!q) return entries;
    return entries
      .map(([parent, subs]) => [parent, subs.filter(s => s.toLowerCase().includes(q))] as const)
      .filter(([parent, subs]) => parent.toLowerCase().includes(q) || subs.length > 0);
  }, [query]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={styles.topBar}>
        <Text style={styles.title}>Categories</Text>
        <View style={styles.searchWrap}>
          <Feather name="search" size={16} color="#888" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search categories"
            placeholderTextColor="#888"
            value={query}
            onChangeText={setQuery}
          />
        </View>
      </View>

      <FlatList
        data={categories}
        keyExtractor={([parent]) => parent}
        contentContainerStyle={{ paddingTop: 10, paddingBottom: 16, paddingHorizontal: 12, gap: 12 }}
        renderItem={({ item }) => {
          const [parent, subs] = item as [string, string[]];
          return (
            <View style={styles.parentBlock}>
              <View style={styles.parentRow}>
                <Text style={styles.parentTitle}>{parent}</Text>
                <TouchableOpacity onPress={() => router.push({ pathname: "/", params: { category: parent } })}>
                  <Text style={styles.viewAll}>View all</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.subgrid}>
                {(subs.length ? subs : ["All"]).slice(0, 6).map((sub) => (
                  <TouchableOpacity
                    key={parent + ":" + sub}
                    style={styles.subChip}
                    onPress={() => router.push({ pathname: "/", params: { category: parent, subcategory: sub } })}
                  >
                    <Text style={styles.subText} numberOfLines={1}>{sub}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          );
        }}
        ListEmptyComponent={() => (
          <View style={{ padding: 24 }}>
            <Text style={{ color: "#666" }}>No categories match your search.</Text>
          </View>
        )}
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
  parentBlock: {
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#e3e3e7",
    padding: 12,
  },
  parentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  parentTitle: {
    fontWeight: "700",
    color: "#111",
    fontSize: 16,
  },
  viewAll: {
    color: "#1877F2",
    fontWeight: "700",
  },
  subgrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  subChip: {
    height: 34,
    paddingHorizontal: 12,
    borderRadius: 17,
    backgroundColor: "#f7f7f7",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#e3e3e7",
    alignItems: "center",
    justifyContent: "center",
  },
  subText: {
    color: "#111",
    fontSize: 12,
  },
});


