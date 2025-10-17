// app/dashboard/add.jsx
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { addDoc, collection } from "firebase/firestore";
import { db, auth } from "../../src/services/firebaseConfig";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

export default function AddHomework() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const router = useRouter();

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) return;

    if (!title.trim()) {
      alert("Please enter a title.");
      return;
    }

    try {
      await addDoc(collection(db, "homeworks"), {
        title,
        description,
        dueDate: dueDate.toISOString(),
        userId: user.uid,
        createdAt: new Date().toISOString(),
      });

      router.back(); // Go back to dashboard after saving
    } catch (error) {
      console.error("Error adding homework:", error);
      alert("Failed to save homework.");
    }
  };

  return (
    <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.container}>
      <Text style={styles.header}>Add Homework</Text>

      <TextInput
        style={styles.input}
        placeholder="Homework Title"
        placeholderTextColor="#ccc"
        value={title}
        onChangeText={setTitle}
      />

      <TextInput
        style={[styles.input, styles.textarea]}
        placeholder="Description (optional)"
        placeholderTextColor="#ccc"
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={styles.dateText}>
          Due Date: {dueDate.toLocaleDateString()} {dueDate.toLocaleTimeString()}
        </Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={dueDate}
          mode="datetime"
          display={Platform.OS === "ios" ? "inline" : "default"}
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) setDueDate(selectedDate);
          }}
        />
      )}

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveText}>Save Homework</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
    color: "#fff",
  },
  textarea: {
    height: 100,
    textAlignVertical: "top",
  },
  dateButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
  },
  dateText: {
    color: "#fff",
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  saveText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#667eea",
  },
});
