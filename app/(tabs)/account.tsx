import React, { useEffect, useState } from "react";
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LOGGED_IN_KEY } from "../../constants/messages";

export default function Account() {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(true);

  useEffect(() => {
    (async () => {
      const v = await AsyncStorage.getItem(LOGGED_IN_KEY);
      setLoggedIn(v !== "false");
    })();
  }, []);

  if (!loggedIn) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
        <View style={styles.header}><Text style={styles.headerTitle}>Account</Text></View>
        <View style={styles.centerBox}>
          <Ionicons name="person-circle" size={72} color="#c7d2fe" />
          <Text style={styles.centerTitle}>You're not signed in</Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={async () => { await AsyncStorage.setItem(LOGGED_IN_KEY, "true"); setLoggedIn(true); }}><Text style={styles.primaryText}>Sign in</Text></TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn}><Text style={styles.secondaryText}>Create account</Text></TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={styles.header}><Text style={styles.headerTitle}>Account</Text></View>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        <View style={styles.profileRow}>
          <Ionicons name="person-circle" size={56} color="#93c5fd" />
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>John Doe</Text>
            <Text style={styles.meta}>johndoe@example.com</Text>
          </View>
          <TouchableOpacity onPress={() => router.push("/store/101")} style={styles.badge}><Text style={styles.badgeText}>View store</Text></TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Selling</Text>
          <Row icon="pricetag" label="Your listings" onPress={() => router.push("/store/101")} />
          <Row icon="add-circle" label="Create listing" onPress={() => router.push("/sell")} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Buying</Text>
          <Row icon="chatbubbles" label="Messages" onPress={() => router.push("/messages")} />
          <Row icon="heart" label="Saved" onPress={() => {}} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <Row icon="location" label="Location" onPress={() => {}} />
          <Row icon="notifications" label="Notifications" onPress={() => {}} />
          <Row icon="help-circle" label="Help & support" onPress={() => {}} />
        </View>

        <TouchableOpacity style={[styles.secondaryBtn, { marginTop: 8 }]} onPress={async () => { await AsyncStorage.setItem(LOGGED_IN_KEY, "false"); setLoggedIn(false); }}>
          <Text style={styles.secondaryText}>Sign out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ icon, label, onPress }: { icon: any; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress}>
      <Ionicons name={icon} size={18} color="#111" />
      <Text style={styles.rowLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color="#999" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 56,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eee",
    justifyContent: "center",
  },
  headerTitle: { fontWeight: "700", fontSize: 18, color: "#111" },
  centerBox: { flex: 1, alignItems: "center", justifyContent: "center", padding: 16, gap: 10 },
  centerTitle: { fontWeight: "700", fontSize: 16, color: "#111" },
  primaryBtn: { height: 44, paddingHorizontal: 16, borderRadius: 8, backgroundColor: "#1877F2", alignItems: "center", justifyContent: "center", marginTop: 6 },
  primaryText: { color: "#fff", fontWeight: "700" },
  secondaryBtn: { height: 44, paddingHorizontal: 16, borderRadius: 8, borderWidth: StyleSheet.hairlineWidth, borderColor: "#e3e3e7", alignItems: "center", justifyContent: "center" },
  secondaryText: { color: "#111", fontWeight: "700" },
  profileRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  name: { fontWeight: "700", fontSize: 16, color: "#111" },
  meta: { color: "#666" },
  badge: { backgroundColor: "#e9f1ff", paddingHorizontal: 10, height: 30, borderRadius: 6, alignItems: "center", justifyContent: "center" },
  badgeText: { color: "#1877F2", fontWeight: "700", fontSize: 12 },
  section: { marginTop: 16, borderRadius: 10, borderWidth: StyleSheet.hairlineWidth, borderColor: "#e3e3e7", backgroundColor: "#fff" },
  sectionTitle: { paddingHorizontal: 12, paddingTop: 12, paddingBottom: 6, color: "#666", fontWeight: "700" },
  row: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 12, gap: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "#eee" },
  rowLabel: { flex: 1, color: "#111" },
});


