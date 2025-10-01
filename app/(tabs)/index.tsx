import React, { useMemo, useState } from "react";
import { FlatList, SafeAreaView, View, TextInput, StyleSheet, Text, ScrollView, TouchableOpacity, Modal, Pressable } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import Feather from "@expo/vector-icons/Feather";
import ProductCard from "../../components/ProductCard";
import { SkeletonCard } from "../../components/Skeleton";
import { products } from "../../constants/dummyData";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Home() {
  const router = useRouter();
  const params = useLocalSearchParams<{ category?: string; subcategory?: string }>();
  const [query, setQuery] = useState("");
  const categories = ["All", "Electronics", "Fashion", "Shoes", "Phones", "Computers", "Accessories"];
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [recentQueries, setRecentQueries] = useState<string[]>([]);
  const [menuVisible, setMenuVisible] = useState(false);
  const [showFloatingHeader, setShowFloatingHeader] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  // Local listings (created via Sell) loaded before filtering
  const [localListings, setLocalListings] = useState<any[]>([]);
  React.useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem("@local_listings");
        setLocalListings(raw ? JSON.parse(raw) : []);
      } catch {}
    })();
  }, []);

  // Filter products based on query & category
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const selectedFromParams = params.category || undefined;
    const subFromParams = params.subcategory || undefined;
    const effectiveCategory = selectedFromParams || selectedCategory;
    // include locally created listings
    // Note: local listings are loaded in ListHeader via effect below and saved in state
    return [...localListings, ...products].filter((p) => {
      const matchesQuery = q ? p.title.toLowerCase().includes(q) : true;
      const matchesCategory = effectiveCategory === "All" || !effectiveCategory ? true : p.category?.toLowerCase() === effectiveCategory.toLowerCase();
      const matchesSub = subFromParams ? p.title.toLowerCase().includes(subFromParams.toLowerCase()) : true;
      return matchesQuery && matchesCategory && matchesSub;
    });
  }, [query, selectedCategory, params.category, params.subcategory, localListings]);

  const onSubmitSearch = () => {
    const q = query.trim();
    if (!q) return;
    setRecentQueries((prev) => [q, ...prev.filter((x) => x !== q)].slice(0, 5));
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Product Grid with scrolling header */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.cardWrap}>
            <ProductCard product={item} />
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={{ paddingHorizontal: 8 }}>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <SkeletonCard />
              <SkeletonCard />
            </View>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <SkeletonCard />
              <SkeletonCard />
            </View>
          </View>
        )}
        numColumns={2}
        columnWrapperStyle={{ gap: 8, paddingHorizontal: 8 }}
        contentContainerStyle={{ paddingBottom: 16 }}
        ListHeaderComponent={
          <>
            <View style={styles.topBar}>
              <View style={styles.brandRow}>
                <Text style={styles.brandText}>Mazhets</Text>
                <TouchableOpacity
                  accessibilityLabel="Open menu"
                  onPress={() => setMenuVisible(true)}
                  style={styles.menuBtn}
                >
                  <Ionicons name="menu" size={18} color="#111" />
                </TouchableOpacity>
              </View>
              <View style={[styles.searchWrap, searchFocused && styles.searchWrapFocused]}>
                <Feather name="search" size={18} color="#888" style={{ marginLeft: 10 }} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search Mazhets"
                  placeholderTextColor="#888"
                  value={query}
                  onChangeText={setQuery}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  returnKeyType="search"
                  onSubmitEditing={onSubmitSearch}
                />
              </View>
            </View>

            <View style={styles.chipsContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                {categories.map((cat) => {
                  const active = cat === selectedCategory;
                  return (
                    <TouchableOpacity
                      key={cat}
                      onPress={() => setSelectedCategory(cat)}
                      style={[styles.chip, active && styles.chipActive]}
                    >
                      <Text style={[styles.chipText, active && styles.chipTextActive]}>{cat}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {recentQueries.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.historyContainer}>
                {recentQueries.map((q) => (
                  <TouchableOpacity key={q} onPress={() => setQuery(q)} style={styles.historyChip}>
                    <Text style={styles.historyText}>{q}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </>
        }
        onScroll={(e) => {
          const y = e.nativeEvent.contentOffset.y;
          setShowFloatingHeader(y > 120);
        }}
        scrollEventThrottle={16}
      />

      {/* Menu Modal */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setMenuVisible(false)}>
          <Pressable style={styles.modalSheet} onPress={() => {}}>
            <Text style={styles.menuTitle}>Menu</Text>
            <TouchableOpacity style={styles.menuRow} onPress={() => { setMenuVisible(false); router.push("/account"); }}>
              <Ionicons name="person-circle" size={18} color="#111" />
              <Text style={styles.menuLabel}>Account</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuRow} onPress={() => { setMenuVisible(false); router.push("/store/101"); }}>
              <Ionicons name="storefront" size={18} color="#111" />
              <Text style={styles.menuLabel}>Your store</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuRow} onPress={() => { setMenuVisible(false); router.push("/messages"); }}>
              <Ionicons name="chatbubbles" size={18} color="#111" />
              <Text style={styles.menuLabel}>Messages</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuRow} onPress={() => { setMenuVisible(false); router.push("/saved"); }}>
              <Ionicons name="bookmark" size={18} color="#111" />
              <Text style={styles.menuLabel}>Saved</Text>
            </TouchableOpacity>
            <View style={{ height: 8 }} />
            <TouchableOpacity style={styles.menuRow} onPress={() => setMenuVisible(false)}>
              <Ionicons name="close" size={18} color="#111" />
              <Text style={styles.menuLabel}>Close</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Floating header when scrolling down */}
      {showFloatingHeader && (
        <View style={styles.floatingHeader} pointerEvents="box-none">
          <View style={styles.floatingInner}>
            <Text style={styles.floatingBrand}>Mazhets</Text>
            <TouchableOpacity
              accessibilityLabel="Open menu"
              onPress={() => setMenuVisible(true)}
              style={styles.menuBtn}
            >
              <Ionicons name="menu" size={18} color="#111" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  topBar: {
    position: "relative",
    top: 0,
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 16,
    paddingVertical: 8,
    zIndex: 10,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sellBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 18,
    backgroundColor: "#1877F2",
  },
  sellText: {
    color: "#fff",
    fontWeight: "700",
  },
  menuBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fff",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    padding: 16,
  },
  menuTitle: { fontWeight: "700", fontSize: 16, color: "#111", marginBottom: 8 },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
  },
  menuLabel: { color: "#111" },
  brandText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1877F2",
    marginBottom: 8,
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#ddd",
    height: 44,
  },
  searchWrapFocused: {
    borderColor: "#1877F2",
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 10,
    color: "#111",
  },
  chipsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  chip: {
    paddingHorizontal: 12,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#fff",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
  },
  chipActive: {
    backgroundColor: "#1877F2",
    borderColor: "#1877F2",
  },
  chipText: {
    color: "#222",
    fontSize: 13,
  },
  chipTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  historyContainer: {
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  historyChip: {
    paddingHorizontal: 12,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#f1f1f5",
    alignItems: "center",
    justifyContent: "center",
  },
  historyText: {
    color: "#222",
    fontSize: 12,
    fontWeight: "600",
  },
  cardWrap: {
    flex: 1,
    minWidth: 0,
    marginBottom: 8,
  },
  floatingHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 56,
    backgroundColor: "#f5f5f5ee",
  },
  floatingInner: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  floatingBrand: { fontSize: 18, fontWeight: "700", color: "#1877F2" },
});
