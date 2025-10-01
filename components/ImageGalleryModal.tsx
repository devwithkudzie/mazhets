import React, { useEffect, useMemo, useRef, useState } from "react";
import { Modal, View, StyleSheet, ScrollView, Dimensions, Image, TouchableOpacity, Text, Platform } from "react-native";
import Feather from "@expo/vector-icons/Feather";

type Props = {
  images: any[];
  visible: boolean;
  initialIndex?: number;
  onClose: () => void;
};

export default function ImageGalleryModal({ images, visible, initialIndex = 0, onClose }: Props) {
  const { width, height } = Dimensions.get("window");
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const pagerRef = useRef<ScrollView | null>(null);

  useEffect(() => {
    if (visible && pagerRef.current) {
      setTimeout(() => {
        pagerRef.current?.scrollTo({ x: initialIndex * width, animated: false });
        setActiveIndex(initialIndex);
      }, 0);
    }
  }, [visible, initialIndex, width]);

  const slides = useMemo(() => images || [], [images]);

  return (
    <Modal visible={visible} onRequestClose={onClose} transparent animationType="fade">
      <View style={styles.backdrop}>
        <ScrollView
          ref={pagerRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={{ flex: 1 }}
          onScroll={(e) => {
            const i = Math.round(e.nativeEvent.contentOffset.x / Math.max(1, width));
            if (i !== activeIndex) setActiveIndex(i);
          }}
          scrollEventThrottle={16}
        >
          {slides.map((img, idx) => (
            <View key={idx} style={{ width, height }}>
              <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={styles.zoomContainer}
                maximumZoomScale={3}
                minimumZoomScale={1}
                centerContent
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
              >
                <Image source={img} style={{ width, height: height * 0.8 }} resizeMode="contain" />
              </ScrollView>
            </View>
          ))}
        </ScrollView>

        <TouchableOpacity onPress={onClose} style={styles.closeBtn} accessibilityRole="button" accessibilityLabel="Close gallery">
          <Feather name="x" size={22} color="#fff" />
        </TouchableOpacity>

        <View style={styles.dotsRow}>
          {slides.map((_, i) => (
            <View key={i} style={[styles.dot, i === activeIndex && styles.dotActive]} />
          ))}
        </View>

        {Platform.OS === "web" && (
          <View style={styles.helpTip}>
            <Text style={styles.helpText}>Tip: Use trackpad pinch (iOS) or browser zoom. Carousel supports swipe/drag.</Text>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "#000",
  },
  closeBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#00000066",
    alignItems: "center",
    justifyContent: "center",
  },
  dotsRow: {
    position: "absolute",
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#ffffff66",
  },
  dotActive: {
    backgroundColor: "#fff",
  },
  zoomContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  helpTip: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  helpText: {
    color: "#ffffffb3",
    fontSize: 12,
  },
});


