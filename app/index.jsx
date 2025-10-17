import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  StatusBar,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function Landing() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <>
      <StatusBar barStyle="light-content" />
      <ImageBackground
        source={require("../assets/images/background.gif")}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.overlay} />
        
        <View style={styles.container}>
          {/* Animated Hero Section */}
          <Animated.View
            style={[
              styles.heroSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* App Icon */}
            <View style={styles.iconContainer}>
              <View style={styles.iconGlow} />
              <Ionicons name="book" size={60} color="#43e97b" />
            </View>

            {/* App Name & Tagline */}
            <Text style={styles.appName}>StudySync</Text>
            <Text style={styles.tagline}>Your Academic Success Partner</Text>

            {/* Feature Pills */}
            <View style={styles.featureContainer}>
              <View style={styles.featurePill}>
                <Ionicons name="checkmark-circle" size={16} color="#43e97b" />
                <Text style={styles.featureText}>Track Tasks</Text>
              </View>
              <View style={styles.featurePill}>
                <Ionicons name="time" size={16} color="#43e97b" />
                <Text style={styles.featureText}>Set Deadlines</Text>
              </View>
              <View style={styles.featurePill}>
                <Ionicons name="trophy" size={16} color="#43e97b" />
                <Text style={styles.featureText}>Stay Organized</Text>
              </View>
            </View>
          </Animated.View>

          {/* Animated CTA Section */}
          <Animated.View
            style={[
              styles.ctaSection,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <View style={styles.card}>
              <Text style={styles.ctaTitle}>Get Started Today</Text>
              <Text style={styles.ctaSubtitle}>
                Join thousands of students staying on top of their homework
              </Text>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => router.push("/signup")}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryButtonText}>Create Free Account</Text>
                <Ionicons name="arrow-forward" size={20} color="#1a1a2e" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => router.push("/login")}
                activeOpacity={0.8}
              >
                <Text style={styles.secondaryButtonText}>Sign In</Text>
              </TouchableOpacity>

              <View style={styles.infoRow}>
                <Ionicons name="shield-checkmark" size={16} color="#43e97b" />
                <Text style={styles.infoText}>Free • No credit card required</Text>
              </View>
            </View>
          </Animated.View>

        </View>
      </ImageBackground>
    </>
  );
}

const styles = StyleSheet.create({
  background: { 
    flex: 1, 
    width: "100%", 
    height: "100%" 
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 60,
  },
  heroSection: {
    alignItems: "center",
    width: "100%",
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(67, 233, 123, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    borderWidth: 3,
    borderColor: "rgba(67, 233, 123, 0.4)",
    position: "relative",
  },
  iconGlow: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(67, 233, 123, 0.2)",
  },
  appName: {
    fontSize: 42,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: 1,
    textAlign: "center",
    marginBottom: 8,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  tagline: {
    fontSize: 18,
    color: "#e0e0e0",
    textAlign: "center",
    marginBottom: 32,
    fontWeight: "500",
    letterSpacing: 0.5,
  },
  featureContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
  },
  featurePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  featureText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
  ctaSection: {
    width: "100%",
    maxWidth: 400,
  },
  card: {
    backgroundColor: "rgba(25, 25, 35, 0.9)",
    borderRadius: 28,
    padding: 32,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.4,
    shadowRadius: 30,
    elevation: 15,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  ctaTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  ctaSubtitle: {
    fontSize: 15,
    color: "#aaa",
    textAlign: "center",
    marginBottom: 28,
    lineHeight: 22,
  },
  primaryButton: {
    width: "100%",
    flexDirection: "row",
    backgroundColor: "#43e97b",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    shadowColor: "#43e97b",
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1a1a2e",
    marginRight: 8,
    letterSpacing: 0.5,
  },
  secondaryButton: {
    width: "100%",
    backgroundColor: "transparent",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  secondaryButtonText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.5,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoText: {
    fontSize: 13,
    color: "#999",
    fontWeight: "500",
  },
});