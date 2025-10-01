import React, { useCallback, useEffect, useState } from "react";
import { SafeAreaView, FlatList, View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { products } from "../../constants/dummyData";
import ProductCard from "../../components/ProductCard";
import { SkeletonCard } from "../../components/Skeleton";

const KEY = "@saved_ids";

export default function Saved() {
  const [ids, setIds] = useState<string[]>([]);

  const load = async () => {
    const raw = await AsyncStorage.getItem(KEY);
    setIds(raw ? JSON.parse(raw) : []);
  };

  useEffect(() => { load(); }, []);
  useEffect(() => {
    const id = setInterval(load, 1500);
    return () => clearInterval(id);
  }, []);

  const onRefresh = useCallback(() => { load(); }, []);

  const savedProducts = products.filter(p => ids.includes(p.id));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Saved</Text>
        <TouchableOpacity onPress={onRefresh} style={styles.iconBtn} accessibilityLabel="Refresh">
          <Feather name="refresh-ccw" size={16} color="#111" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={savedProducts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ gap: 8, paddingHorizontal: 8 }}
        contentContainerStyle={{ paddingVertical: 12 }}
        renderItem={({ item }) => (
          <View style={{ flex: 1, minWidth: 0, marginBottom: 8 }}>
            <ProductCard product={item} />
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={{ paddingHorizontal: 8 }}>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <SkeletonCard />
              <SkeletonCard />
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={styles.empty}> 
            <Text style={styles.emptyText}>No saved items yet.</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { height: 48, paddingHorizontal: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#eee", flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerTitle: { fontWeight: "700", fontSize: 18, color: "#111" },
  iconBtn: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: "#f7f7f7", borderWidth: StyleSheet.hairlineWidth, borderColor: "#e3e3e7" },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  emptyText: { color: "#666" },
});


