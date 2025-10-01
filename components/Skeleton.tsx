import React from "react";
import { View, StyleSheet } from "react-native";

export function SkeletonLine({ width = "100%", height = 14 }: { width?: number | string; height?: number }) {
  return <View style={[styles.line, { width, height }]} />;
}

export function SkeletonCard() {
  return (
    <View style={styles.card}>
      <View style={styles.image} />
      <SkeletonLine width="80%" height={14} />
      <SkeletonLine width="50%" height={12} />
    </View>
  );
}

const styles = StyleSheet.create({
  line: {
    backgroundColor: "#ececec",
    borderRadius: 6,
    marginTop: 6,
  },
  card: {
    flex: 1,
    minWidth: 0,
    marginBottom: 8,
    padding: 8,
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#eee",
  },
  image: {
    height: 160,
    backgroundColor: "#f1f1f5",
    borderRadius: 8,
    marginBottom: 8,
  },
});


