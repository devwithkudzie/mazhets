import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function ProductCard({ product }: { product: any }) {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/product/${product.id}`)}
    >
      <Image
        source={product.image}
        style={styles.image}
        resizeMode="contain"
      />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
          {product.title}
        </Text>
        <Text style={styles.price}>{product.price}</Text>
        <TouchableOpacity
          onPress={() => router.push(`/store/${product.seller.id}`)}
        >
          <Text style={styles.seller}>{product.seller.name}</Text>
        </TouchableOpacity>
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
  seller: { color: "blue", textDecorationLine: "underline" },
});
