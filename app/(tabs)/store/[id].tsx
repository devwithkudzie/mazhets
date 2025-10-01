import React, { useEffect, useMemo, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView, View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl, Image } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { products } from "../../../constants/dummyData";
import ProductCard from "../../../components/ProductCard";

export default function Storefront() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [sort, setSort] = useState<"new" | "price_asc" | "price_desc">("new");
  const [refreshing, setRefreshing] = useState(false);

  const [localListings, setLocalListings] = useState<any[]>([]);
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem("@local_listings");
        setLocalListings(raw ? JSON.parse(raw) : []);
      } catch {}
    })();
  }, [id]);

  const sellerProducts = useMemo(() => {
    const base = products.filter(p => p.seller?.id === String(id));
    const mine = localListings.filter((p) => p?.seller?.id === String(id));
    return [...mine, ...base];
  }, [id, localListings]);
  const sellerName = useMemo(() => sellerProducts[0]?.seller?.name || "Store", [sellerProducts]);
  const coverImage = useMemo(() => {
    const p = sellerProducts[0];
    return (p as any)?.images?.[0] || p?.image || null;
  }, [sellerProducts]);

  const sortedProducts = useMemo(() => {
    const copy = [...sellerProducts];
    if (sort === "price_asc") copy.sort((a, b) => Number(a.price.replace(/[^0-9.]/g, "")) - Number(b.price.replace(/[^0-9.]/g, "")));
    else if (sort === "price_desc") copy.sort((a, b) => Number(b.price.replace(/[^0-9.]/g, "")) - Number(a.price.replace(/[^0-9.]/g, "")));
    // default "new" keeps original order
    return copy;
  }, [sellerProducts, sort]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn} accessibilityLabel="Back">
          <Feather name="chevron-left" size={20} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">{sellerName}</Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.push({ pathname: "/messages/[id]", params: { id } })} accessibilityLabel="Message seller">
            <Feather name="message-circle" size={18} color="#111" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} accessibilityLabel="Call seller">
            <Ionicons name="call" size={18} color="#22C55E" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} accessibilityLabel="Share store">
            <Feather name="share-2" size={18} color="#111" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Cover image */}
      <View style={styles.coverWrap}>
        {coverImage ? (
          <Image source={coverImage} style={styles.coverImage} resizeMode="cover" />
        ) : (
          <View style={[styles.coverImage, { backgroundColor: "#e9f1ff" }]} />
        )}
      </View>

      {/* Seller header */}
      <View style={styles.sellerHeader}>
        <View style={styles.avatar} />
        <View style={{ flex: 1 }}>
          <Text style={styles.sellerName}>{sellerName}</Text>
          <View style={styles.detailRowLine}>
            <View style={styles.detailItem}>
              <Text style={styles.statNum}>{sellerProducts.length}</Text>
              <Text style={styles.stat}>listings</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.statNum}>4.8</Text>
              <Text style={styles.stat}>rating</Text>
            </View>
          </View>
          <View style={styles.detailRowLine}>
            <View style={styles.detailItem}>
              <Text style={styles.stat}>Harare</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.stat}>Joined 2024</Text>
            </View>
          </View>
        </View>
        {/* Actions moved to header */}
      </View>

      {/* Sort & filters */}
      <View style={styles.controlsRow}>
        <Text style={styles.controlsLabel}>Sort</Text>
        <View style={styles.pillsRow}>
          <TouchableOpacity style={[styles.pill, sort === "new" && styles.pillActive]} onPress={() => setSort("new")}>
            <Text style={[styles.pillText, sort === "new" && styles.pillTextActive]}>Newest</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.pill, sort === "price_asc" && styles.pillActive]} onPress={() => setSort("price_asc")}>
            <Text style={[styles.pillText, sort === "price_asc" && styles.pillTextActive]}>Price ↑</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.pill, sort === "price_desc" && styles.pillActive]} onPress={() => setSort("price_desc")}>
            <Text style={[styles.pillText, sort === "price_desc" && styles.pillTextActive]}>Price ↓</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={sortedProducts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ gap: 8, paddingHorizontal: 12 }}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <View style={{ flex: 1, minWidth: 0, marginBottom: 8 }}>
            <TouchableOpacity activeOpacity={0.9} onPress={() => router.push({ pathname: "/product/[id]", params: { id: item.id } })}>
              <ProductCard product={item} />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={{ padding: 24 }}>
            <Text style={{ color: "#666" }}>No listings from this seller yet.</Text>
          </View>
        )}
      />
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
  coverWrap: {
    width: "100%",
    height: 140,
    backgroundColor: "#f4f7ff",
    marginTop: 8,
  },
  coverImage: {
    width: "100%",
    height: "100%",
  },
  sellerHeader: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eee",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#e9f0ff",
  },
  sellerName: {
    fontWeight: "700",
    fontSize: 18,
    color: "#111",
  },
  detailRowLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 6,
  },
  detailItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
  },
  stat: {
    color: "#444",
    fontSize: 12,
  },
  statNum: {
    fontWeight: "700",
    color: "#111",
  },
  dot: { color: "#999" },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f7f7f7",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#e3e3e7",
  },
  controlsRow: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  controlsLabel: {
    color: "#666",
  },
  pillsRow: {
    flexDirection: "row",
    gap: 8,
  },
  pill: {
    height: 30,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: "#f7f7f7",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#e3e3e7",
  },
  pillActive: {
    backgroundColor: "#e9f1ff",
    borderColor: "#b9d4ff",
  },
  pillText: { color: "#111", fontSize: 12 },
  pillTextActive: { color: "#1877F2", fontWeight: "700" },
});


