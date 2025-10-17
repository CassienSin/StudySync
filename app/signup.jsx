import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ImageBackground,
  StatusBar,
  ScrollView,
} from "react-native";
import Animated, { FadeInUp, FadeInDown } from "react-native-reanimated";
import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../src/services/firebaseConfig";
import { Ionicons } from "@expo/vector-icons";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignup = async () => {
    // Validation
    if (!email || !password || !confirmPassword) {
      Alert.alert("Missing Information", "Please fill in all fields");
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Weak Password", "Password should be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Password Mismatch", "Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      Alert.alert("Success", "Account created successfully!", [
        { text: "OK", onPress: () => router.replace("/dashboard") }
      ]);
    } catch (error) {
      if (error.code === "auth/invalid-email") {
        Alert.alert("Invalid Email", "Please enter a valid email address");
      } else if (error.code === "auth/email-already-in-use") {
        Alert.alert("Email Taken", "This email is already registered");
      } else if (error.code === "auth/weak-password") {
        Alert.alert("Weak Password", "Password should be at least 6 characters");
      } else {
        Alert.alert("Signup Failed", "An error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = () => {
    if (!password) return { text: "", color: "#666" };
    if (password.length < 6) return { text: "Weak", color: "#ff6b6b" };
    if (password.length < 10) return { text: "Medium", color: "#ffd93d" };
    return { text: "Strong", color: "#43e97b" };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <>
      <StatusBar barStyle="light-content" />
      <ImageBackground
        source={require("../assets/images/background.gif")}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.overlay} />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.container}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Animated.View 
              style={styles.header} 
              entering={FadeInDown.duration(600).delay(100)}
            >
              <View style={styles.iconContainer}>
                <Ionicons name="book" size={40} color="#43e97b" />
              </View>
              <Text style={styles.appName}>StudySync</Text>
            </Animated.View>

            <Animated.View 
              style={styles.card} 
              entering={FadeInUp.duration(700).delay(200)}
            >
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>
                Join us and start managing your homework efficiently
              </Text>

              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color="#999" style={styles.inputIcon} />
                <TextInput
                  placeholder="Email address"
                  placeholderTextColor="#999"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  style={styles.input}
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#999" style={styles.inputIcon} />
                <TextInput
                  placeholder="Password"
                  placeholderTextColor="#999"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  style={[styles.input, styles.passwordInput]}
                />
                <TouchableOpacity 
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons 
                    name={showPassword ? "eye-outline" : "eye-off-outline"} 
                    size={20} 
                    color="#999" 
                  />
                </TouchableOpacity>
              </View>

              {password.length > 0 && (
                <View style={styles.passwordStrengthContainer}>
                  <Text style={styles.passwordStrengthLabel}>Password Strength: </Text>
                  <Text style={[styles.passwordStrengthText, { color: passwordStrength.color }]}>
                    {passwordStrength.text}
                  </Text>
                </View>
              )}

              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#999" style={styles.inputIcon} />
                <TextInput
                  placeholder="Confirm password"
                  placeholderTextColor="#999"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  style={[styles.input, styles.passwordInput]}
                />
                <TouchableOpacity 
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons 
                    name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} 
                    size={20} 
                    color="#999" 
                  />
                </TouchableOpacity>
              </View>

              {confirmPassword.length > 0 && password !== confirmPassword && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={16} color="#ff6b6b" />
                  <Text style={styles.errorText}>Passwords do not match</Text>
                </View>
              )}

              <View style={styles.requirementsContainer}>
                <Text style={styles.requirementsTitle}>Password Requirements:</Text>
                <View style={styles.requirementRow}>
                  <Ionicons 
                    name={password.length >= 6 ? "checkmark-circle" : "ellipse-outline"} 
                    size={16} 
                    color={password.length >= 6 ? "#43e97b" : "#666"} 
                  />
                  <Text style={[
                    styles.requirementText,
                    password.length >= 6 && styles.requirementMet
                  ]}>
                    At least 6 characters
                  </Text>
                </View>
              </View>

              <TouchableOpacity 
                style={[styles.button, isLoading && styles.buttonDisabled]} 
                onPress={handleSignup}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonText}>
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Text>
              </TouchableOpacity>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity 
                style={styles.loginContainer}
                onPress={() => router.push("/login")}
              >
                <Text style={styles.loginText}>Already have an account? </Text>
                <Text style={styles.loginLink}>Sign in</Text>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View 
              style={styles.footer}
              entering={FadeInUp.duration(600).delay(400)}
            >
              <Text style={styles.footerText}>
                By signing up, you agree to our Terms & Privacy Policy
              </Text>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  container: { 
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
    paddingTop: 40,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(67, 233, 123, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "rgba(67, 233, 123, 0.3)",
  },
  appName: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: "rgba(25, 25, 35, 0.85)",
    borderRadius: 24,
    padding: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  title: { 
    fontSize: 32, 
    fontWeight: "800", 
    color: "#fff", 
    textAlign: "center", 
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitle: { 
    fontSize: 15, 
    color: "#aaa", 
    textAlign: "center", 
    marginBottom: 32,
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: "#fff",
    paddingVertical: 16,
    fontSize: 16,
  },
  passwordInput: {
    paddingRight: 40,
  },
  eyeIcon: {
    position: "absolute",
    right: 16,
    padding: 4,
  },
  passwordStrengthContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: -8,
    marginBottom: 16,
    paddingLeft: 4,
  },
  passwordStrengthLabel: {
    fontSize: 13,
    color: "#999",
  },
  passwordStrengthText: {
    fontSize: 13,
    fontWeight: "700",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: -8,
    marginBottom: 16,
    paddingLeft: 4,
  },
  errorText: {
    fontSize: 13,
    color: "#ff6b6b",
    marginLeft: 6,
  },
  requirementsContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  requirementsTitle: {
    fontSize: 13,
    color: "#aaa",
    fontWeight: "600",
    marginBottom: 8,
  },
  requirementRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  requirementText: {
    fontSize: 13,
    color: "#666",
    marginLeft: 8,
  },
  requirementMet: {
    color: "#43e97b",
  },
  button: {
    backgroundColor: "#43e97b",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: "#43e97b",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: { 
    color: "#1a1a2e", 
    fontWeight: "700", 
    fontSize: 17,
    letterSpacing: 0.5,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  dividerText: {
    color: "#666",
    paddingHorizontal: 16,
    fontSize: 14,
    fontWeight: "600",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  loginText: { 
    fontSize: 15, 
    color: "#999",
  },
  loginLink: {
    fontSize: 15,
    color: "#43e97b",
    fontWeight: "700",
  },
  footer: {
    marginTop: 24,
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    color: "#777",
    textAlign: "center",
    lineHeight: 18,
  },
});