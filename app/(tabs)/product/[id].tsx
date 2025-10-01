import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView, ScrollView, View, Text, Image, StyleSheet, TouchableOpacity, FlatList, Dimensions, Share, Alert } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createOrUpdateChat } from "../../../constants/messages";
import ImageGalleryModal from "../../../components/ImageGalleryModal";
import ProductCard from "../../../components/ProductCard";
import { supabase } from "../../../lib/supabase";

export default function ProductDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [remoteListings, setRemoteListings] = useState<any[]>([]);
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("listings")
        .select(`
          *,
          listing_images (
            url,
            sort_index
          ),
          profiles!listings_user_id_fkey (
            name,
            avatar_url,
            id
          )
        `)
        .order("created_at", { ascending: false });
      setRemoteListings(data || []);
    })();
  }, []);

  // Use only remote listings
  const product = useMemo(() => {
    return remoteListings.find((p) => p.id === String(id));
  }, [id, remoteListings]);

  const images = useMemo(() => {
    if (product?.listing_images && product.listing_images.length > 0) {
      return product.listing_images.map(img => ({ uri: img.url }));
    }
    return [];
  }, [product]);

  const { width } = Dimensions.get("window");
  const [activeIndex, setActiveIndex] = useState(0);
  const [showGallery, setShowGallery] = useState(false);
  const [showAllRelated, setShowAllRelated] = useState(false);
  const [saved, setSaved] = useState(false);
  const SAVED_KEY = "@saved_ids";

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(SAVED_KEY);
        const arr: string[] = raw ? JSON.parse(raw) : [];
        setSaved(product?.id ? arr.includes(product.id) : false);
      } catch {}
    })();
  }, [id, product]);

  const toggleSave = async () => {
    try {
      const raw = await AsyncStorage.getItem(SAVED_KEY);
      const arr: string[] = raw ? JSON.parse(raw) : [];
      let next: string[];
      if (product?.id && arr.includes(product.id)) {
        next = arr.filter(x => x !== product.id);
        setSaved(false);
      } else if (product?.id) {
        next = [product.id, ...arr.filter(x => x !== product.id)];
        setSaved(true);
      } else {
        next = arr;
      }
      await AsyncStorage.setItem(SAVED_KEY, JSON.stringify(next));
    } catch {}
  };
  const scrollRef = useRef<ScrollView | null>(null);
  const outerRef = useRef<ScrollView | null>(null);

  // Scroll to top when product ID changes
  useEffect(() => {
    outerRef.current?.scrollTo({ y: 0, animated: false });
  }, [id]);

  if (!product) {
    return (
      <SafeAreaView style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>Product not found.</Text>
      </SafeAreaView>
    );
  }

  // Related items: use only remote listings
  const related = remoteListings
    .filter((p) => p.id !== product.id)
    .map((p) => {
      const sameSeller = p.user_id === product.user_id ? 1 : 0;
      const sameCategoryHint = p.category === product.category ? 1 : 0;
      const score = sameSeller * 2 + sameCategoryHint;
      return { p, score };
    })
    .sort((a, b) => b.score - a.score)
    .map(({ p }) => p)
    .slice(0, 12);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={styles.fixedHeader} pointerEvents="box-none">
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={styles.topIconBtn}
        >
          <Feather name="chevron-left" size={20} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">
          {product.title}
        </Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <TouchableOpacity
            style={styles.topIconBtn}
            onPress={async () => {
              const v = await AsyncStorage.getItem("@logged_in");
              if (v === "false") { Alert.alert("Sign in required", "Please sign in to save items."); return; }
              toggleSave();
            }}
            accessibilityLabel={saved ? "Unsave item" : "Save item"}
          >
            <Ionicons name={saved ? "heart" : "heart-outline"} size={18} color={saved ? "#e11d48" : "#111"} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.topIconBtn}
            onPress={async () => {
              try {
                await Share.share({
                  title: product.title,
                  message: `${product.title} • ${product.price_cents ? `\$${(product.price_cents / 100).toFixed(2)}` : ""}`,
                  url: `https://mazhets.example/product/${product.id}`,
                });
              } catch (e) {
                // no-op
              }
            }}
            accessibilityLabel="Share product"
          >
            <Feather name="share-2" size={18} color="#111" />
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView ref={outerRef} style={{ flex: 1 }} contentContainerStyle={styles.container} nestedScrollEnabled>
        <View>
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            directionalLockEnabled
            onScroll={(e) => {
              const index = Math.round(
                e.nativeEvent.contentOffset.x / Math.max(1, width)
              );
              if (index !== activeIndex) setActiveIndex(index);
            }}
            scrollEventThrottle={16}
          >
            {images.map((img, idx) => (
              <View key={idx} style={{ width }}>
                <TouchableOpacity activeOpacity={0.9} onPress={() => { setShowGallery(true); setActiveIndex(idx); }}>
                  <Image source={img} style={[styles.heroImage, { width }]} resizeMode="contain" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
          {images.length > 1 && (
            <View style={styles.dotsRow}>
              {images.map((_, i) => (
                <View key={i} style={[styles.dot, i === activeIndex && styles.dotActive]} />
              ))}
            </View>
          )}
          {images.length > 1 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.thumbRow}
            >
              {images.map((img, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => {
                    setActiveIndex(idx);
                    scrollRef.current?.scrollTo({ x: idx * width, animated: true });
                  }}
                  style={[styles.thumbWrap, idx === activeIndex && styles.thumbWrapActive]}
                >
                  <Image source={img} style={styles.thumbImg} resizeMode="cover" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        <View style={styles.infoBlock}>
          <Text style={styles.price}>
            {product.price_cents ? `\$${(product.price_cents / 100).toFixed(2)}` : ""}
          </Text>
          <Text style={styles.title} numberOfLines={2}>{product.title}</Text>
          <View style={styles.metaRow}>
            <Feather name="map-pin" size={14} color="#666" />
            <Text style={styles.metaText}>{product.location || "Harare, Zimbabwe"}</Text>
            <View style={{ width: 10 }} />
            <Feather name="clock" size={14} color="#666" />
            <Text style={styles.metaText}>Listed 3 hours ago</Text>
          </View>

          <TouchableOpacity onPress={() => router.push(`/store/${product.profiles?.id}`)} style={styles.sellerRow}>
            <View style={styles.sellerAvatar}>
              {product.profiles?.avatar_url && (
                <Image source={{ uri: product.profiles.avatar_url }} style={{ width: 40, height: 40, borderRadius: 20 }} />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.sellerName}>
                {product.profiles?.name || "Unknown Seller"}
              </Text>
              <Text style={styles.sellerSub}>See more from this seller</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#777" />
          </TouchableOpacity>

          <View style={styles.detailsBlock}>
            <Text style={styles.sectionTitle}>Details</Text>
            <Text style={styles.detailItem}><Text style={styles.detailKey}>Condition:</Text> {product.condition || "Unknown"}</Text>
            <Text style={styles.detailItem}><Text style={styles.detailKey}>Category:</Text> {product.category || "Unknown"}</Text>
            <Text style={styles.detailItem}><Text style={styles.detailKey}>Description:</Text> {product.description || "No description provided."}</Text>
          </View>
        </View>

        {related.length > 0 && (
          <View style={styles.relatedBlock}>
            <View style={styles.relatedHeader}>
              <Text style={styles.relatedTitle}>Related items</Text>
              {related.length > 6 && (
                <TouchableOpacity onPress={() => setShowAllRelated((s) => !s)}>
                  <Text style={styles.seeAll}>{showAllRelated ? "Show less" : "See all"}</Text>
                </TouchableOpacity>
              )}
            </View>
            <FlatList
              data={showAllRelated ? related : related.slice(0, 6)}
              keyExtractor={(item) => item.id}
              numColumns={2}
              columnWrapperStyle={{ gap: 8 }}
              contentContainerStyle={{ paddingBottom: 8 }}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <View style={{ flex: 1, minWidth: 0, marginBottom: 8 }}>
                  <ProductCard product={item} />
                </View>
              )}
            />
          </View>
        )}

        <View style={styles.safety}>
          <Feather name="shield" size={16} color="#1877F2" />
          <Text style={styles.safetyText}>Meet in a safe public place. Don’t send money in advance.</Text>
        </View>
      </ScrollView>
      <View style={styles.bottomBar} pointerEvents="box-none">
        <View style={styles.bottomInner}>
          <TouchableOpacity
            style={styles.bottomPrimary}
            onPress={() => {
              // Ensure a chat exists before navigating
              createOrUpdateChat(product.profiles?.id, product.profiles?.name, "");
              router.push({
                pathname: "/messages/[id]",
                params: { id: product.profiles?.id, productId: product.id, sellerName: product.profiles?.name },
              });
            }}
          >
            <Text style={styles.bottomPrimaryText}>Message Seller</Text>
          </TouchableOpacity>
        </View>
      </View>
      <ImageGalleryModal
        images={images}
        visible={showGallery}
        initialIndex={activeIndex}
        onClose={() => setShowGallery(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 56,
    paddingBottom: 96,
  },
  heroImage: {
    width: "100%",
    height: 320,
    backgroundColor: "#fff",
  },
  dotsRow: {
    position: "absolute",
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  thumbRow: {
    paddingHorizontal: 12,
    paddingTop: 6,
    paddingBottom: 4,
    gap: 8,
  },
  thumbWrap: {
    width: 54,
    height: 54,
    borderRadius: 6,
    overflow: "hidden",
    backgroundColor: "#fff",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#ddd",
    marginRight: 8,
  },
  thumbWrapActive: {
    borderColor: "#1877F2",
  },
  thumbImg: {
    width: "100%",
    height: "100%",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#d0d0d0",
  },
  dotActive: {
    backgroundColor: "#1877F2",
  },
  fixedHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 56,
    paddingHorizontal: 12,
    backgroundColor: "#ffffff",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eee",
    zIndex: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: "#111",
  },
  topIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#ffffffcc",
    alignItems: "center",
    justifyContent: "center",
  },
  infoBlock: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
  },
  price: {
    marginTop: 6,
    fontSize: 18,
    fontWeight: "700",
    color: "#204E9C",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },
  metaText: {
    color: "#666",
    fontSize: 12,
  },
  seller: {
    marginTop: 6,
    color: "#1877F2",
  },
  ctaRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  primaryBtn: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    backgroundColor: "#204E9C",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: {
    color: "#fff",
    fontWeight: "700",
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  sellerRow: {
    marginTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#eee",
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  sellerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e9f0ff",
  },
  sellerName: {
    fontWeight: "700",
    color: "#111",
  },
  sellerSub: {
    color: "#666",
    fontSize: 12,
  },
  detailsBlock: {
    marginTop: 16,
    gap: 6,
  },
  sectionTitle: {
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 4,
  },
  detailItem: {
    color: "#333",
    lineHeight: 20,
  },
  detailKey: {
    fontWeight: "700",
  },
  relatedBlock: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  relatedTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },
  safety: {
    marginTop: 16,
    marginHorizontal: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#f6f9ff",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  safetyText: {
    color: "#1a355f",
    flex: 1,
    fontSize: 12,
  },
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#fff",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#eee",
    paddingBottom: 8,
    paddingTop: 8,
  },
  bottomInner: {
    paddingHorizontal: 12,
  },
  bottomPrimary: {
    width: "100%",
    height: 48,
    borderRadius: 8,
    backgroundColor: "#204E9C",
    alignItems: "center",
    justifyContent: "center",
  },
  bottomPrimaryText: {
    color: "#fff",
    fontWeight: "700",
  },
  bottomIcon: {
    width: 44,
    height: 44,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
});


