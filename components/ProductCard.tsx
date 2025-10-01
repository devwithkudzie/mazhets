import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function ProductCard({ product }: { product: any }) {
  const router = useRouter();

  // Safely access seller info
  const sellerName = product.profiles?.name || "Unknown Seller";
  const sellerAvatar = product.profiles?.avatar_url;

  // Safely access image
  const imageUrl =
    product.listing_images?.[0]?.url ||
    "https://via.placeholder.com/300x300.png?text=No+Image";

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/product/${product.id}`)}
    >
      <Image
        source={{ uri: imageUrl }}
        style={{ width: 150, height: 150 }}
        resizeMode="contain"
      />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
          {product.title}
        </Text>
        <Text style={styles.price}>
          Price: ${(product.price_cents / 100).toFixed(2)}
        </Text>
        <TouchableOpacity
          onPress={() => router.push(`/store/${product.profiles?.id}`)}
        >
          <Text style={styles.sellerName}>
            {product.profiles?.name || "Unknown seller"}
          </Text>
        </TouchableOpacity>
        {sellerAvatar && (
          <Image
            source={{ uri: sellerAvatar }}
            style={{ width: 32, height: 32, borderRadius: 16 }}
          />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    margin: 0,
    borderRadius: 10,
    overflow: "hidden",
    elevation: 2,
  },
  image: { width: "100%", height: 160, backgroundColor: "#fff" },
  info: { padding: 10 },
  title: { fontSize: 16, fontWeight: "bold" },
  price: { color: "green", marginVertical: 4 },
  sellerName: { color: "blue", textDecorationLine: "underline" },
});
