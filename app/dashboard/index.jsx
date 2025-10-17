import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  ImageBackground,
  Pressable,
  Modal,
  ScrollView,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useRouter } from "expo-router";
import { BlurView } from "expo-blur";
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
  Layout,
  withTiming,
  withSpring,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { db, auth } from "../../src/services/firebaseConfig";

export default function Dashboard() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [homeworks, setHomeworks] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [priority, setPriority] = useState("medium");
  const [subject, setSubject] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [sortBy, setSortBy] = useState("dueDate");
  const [showStats, setShowStats] = useState(false);
  const [completed, setCompleted] = useState({});

  const [menuOpen, setMenuOpen] = useState(false);
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const menuHeight = useSharedValue(0);
  const menuOpacity = useSharedValue(0);
  const menuRotation = useSharedValue(0);
  const filterHeight = useSharedValue(0);
  const filterOpacity = useSharedValue(0);

  const toggleMenu = () => {
    const willOpen = !menuOpen;
    setMenuOpen(willOpen);
    menuHeight.value = withTiming(willOpen ? 140 : 0, { duration: 300 });
    menuOpacity.value = withTiming(willOpen ? 1 : 0, { duration: 300 });
    menuRotation.value = withTiming(willOpen ? 45 : 0, { duration: 300 });
  };

  const toggleFilterMenu = () => {
    const willOpen = !filterMenuOpen;
    setFilterMenuOpen(willOpen);
    filterHeight.value = withTiming(willOpen ? 280 : 0, { duration: 300 });
    filterOpacity.value = withTiming(willOpen ? 1 : 0, { duration: 300 });
  };

  const menuStyle = useAnimatedStyle(() => ({
    height: menuHeight.value,
    opacity: menuOpacity.value,
  }));

  const filterStyle = useAnimatedStyle(() => ({
    height: filterHeight.value,
    opacity: filterOpacity.value,
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${menuRotation.value}deg` }],
  }));

  const router = useRouter();
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerAnimatedStyle = useAnimatedStyle(() => {
    const height = interpolate(scrollY.value, [0, 100], [140, 80], Extrapolate.CLAMP);
    const opacity = interpolate(scrollY.value, [0, 100], [1, 0.95], Extrapolate.CLAMP);
    return { height, opacity };
  });

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "homeworks"),
      where("userId", "==", auth.currentUser.uid)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setHomeworks(data);
      
      const completedStatus = {};
      data.forEach(hw => {
        completedStatus[hw.id] = hw.completed || false;
      });
      setCompleted(completedStatus);
    });

    return unsub;
  }, []);

  const handleSaveHomework = async () => {
    if (!title) {
      Alert.alert("Error", "Please enter a title!");
      return;
    }

    try {
      if (editingId) {
        await updateDoc(doc(db, "homeworks", editingId), {
          title,
          description,
          dueDate: dueDate.toISOString(),
          priority,
          subject,
        });
        setEditingId(null);
        Alert.alert("Updated", "Assignment updated successfully! 🎉");
      } else {
        await addDoc(collection(db, "homeworks"), {
          title,
          description,
          dueDate: dueDate.toISOString(),
          priority,
          subject,
          userId: auth.currentUser.uid,
          createdAt: new Date(),
          completed: false,
        });
        Alert.alert("Added", "New assignment added! 📝");
      }
      resetForm();
    } catch (err) {
      Alert.alert("Error", "Something went wrong");
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDueDate(new Date());
    setPriority("medium");
    setSubject("");
  };

  const handleDelete = async (id) => {
    Alert.alert(
      "Delete Assignment",
      "Are you sure you want to delete this assignment?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "homeworks", id));
              Alert.alert("Deleted", "Assignment removed successfully");
            } catch (err) {
              Alert.alert("Error", "Could not delete");
            }
          },
        },
      ]
    );
  };

  const handleEdit = (item) => {
    setTitle(item.title);
    setDescription(item.description || "");
    setDueDate(new Date(item.dueDate));
    setPriority(item.priority || "medium");
    setSubject(item.subject || "");
    setEditingId(item.id);
  };

  const toggleComplete = async (id) => {
    const newStatus = !completed[id];
    setCompleted({ ...completed, [id]: newStatus });
    
    try {
      await updateDoc(doc(db, "homeworks", id), {
        completed: newStatus,
      });
    } catch (err) {
      Alert.alert("Error", "Could not update status");
    }
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        onPress: async () => {
          try {
            await signOut(auth);
            router.replace("/login");
          } catch (err) {
            Alert.alert("Logout Error", err.message);
          }
        },
      },
    ]);
  };

  const getStats = () => {
    const total = homeworks.length;
    const completedCount = Object.values(completed).filter(Boolean).length;
    const overdue = homeworks.filter(hw => 
      new Date(hw.dueDate) < new Date() && !completed[hw.id]
    ).length;
    const dueToday = homeworks.filter(hw => {
      const due = new Date(hw.dueDate);
      const today = new Date();
      return due.toDateString() === today.toDateString() && !completed[hw.id];
    }).length;

    return { total, completedCount, overdue, dueToday };
  };

  const getFilteredHomeworks = () => {
    let filtered = homeworks.filter(
      (hw) =>
        hw.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (hw.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (hw.subject || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (filterBy === "active") {
      filtered = filtered.filter(hw => !completed[hw.id]);
    } else if (filterBy === "completed") {
      filtered = filtered.filter(hw => completed[hw.id]);
    } else if (filterBy === "overdue") {
      filtered = filtered.filter(hw => new Date(hw.dueDate) < new Date() && !completed[hw.id]);
    } else if (filterBy === "high") {
      filtered = filtered.filter(hw => hw.priority === "high");
    }

    filtered.sort((a, b) => {
      if (sortBy === "dueDate") {
        return new Date(a.dueDate) - new Date(b.dueDate);
      } else if (sortBy === "priority") {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority || "medium"] - priorityOrder[b.priority || "medium"];
      } else if (sortBy === "subject") {
        return (a.subject || "").localeCompare(b.subject || "");
      }
      return 0;
    });

    return filtered;
  };

  const getDueDateColor = (dueDateStr) => {
    const now = new Date();
    const due = new Date(dueDateStr);
    const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return darkMode ? "#ef5350" : "#d32f2f";
    if (diffDays <= 3) return darkMode ? "#ff9800" : "#f57c00";
    if (diffDays <= 7) return darkMode ? "#ffa726" : "#fb8c00";
    return darkMode ? "#66bb6a" : "#43a047";
  };

  const getCountdownText = (dueDateStr) => {
    const now = new Date();
    const due = new Date(dueDateStr);
    const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? 's' : ''}`;
    if (diffDays === 0) return "Due today";
    if (diffDays === 1) return "Due tomorrow";
    return `${diffDays} days remaining`;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high": return darkMode ? "#ef5350" : "#d32f2f";
      case "medium": return darkMode ? "#ffa726" : "#f57c00";
      case "low": return darkMode ? "#66bb6a" : "#43a047";
      default: return darkMode ? "#78909c" : "#546e7a";
    }
  };

  const stats = getStats();
  const filteredHomeworks = getFilteredHomeworks();

  return (
    <ImageBackground
      source={
        darkMode
          ? require("../../assets/images/night.gif")
          : require("../../assets/images/day.gif")
      }
      style={{ flex: 1, width: "100%", height: "100%" }}
      resizeMode="cover"
    >
      <View style={{ flex: 1 }}>
        {/* Enhanced Header */}
        <Animated.View style={[headerAnimatedStyle, { zIndex: 2000 }]}>
          <BlurView
            intensity={darkMode ? 60 : 50}
            tint={darkMode ? "dark" : "light"}
            style={{
              flex: 1,
              paddingHorizontal: 20,
              paddingTop: Platform.OS === "ios" ? 55 : 25,
              borderBottomLeftRadius: 24,
              borderBottomRightRadius: 24,
              borderBottomWidth: 1,
              borderBottomColor: darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <View style={{ flex: 1 }}>
                <Text style={{ 
                  fontSize: 28, 
                  fontWeight: "700", 
                  color: darkMode ? "#fffd9fff" : "#1a1a1a",
                  letterSpacing: -0.5,
                }}>
                  StudySync
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center", marginTop: 6, gap: 12 }}>
                  <View style={{ 
                    flexDirection: "row", 
                    alignItems: "center",
                    backgroundColor: darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 12,
                  }}>
                    <Text style={{ fontSize: 13, color: darkMode ? "#ffffffff" : "#546e7a", fontWeight: "600" }}>
                      {stats.total} Total
                    </Text>
                  </View>
                  <View style={{ 
                    flexDirection: "row", 
                    alignItems: "center",
                    backgroundColor: darkMode ? "rgba(102,187,106,0.2)" : "rgba(76,175,80,0.15)",
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 12,
                  }}>
                    <Text style={{ fontSize: 13, color: darkMode ? "#81c784" : "#43a047", fontWeight: "600" }}>
                      {stats.completedCount} Done
                    </Text>
                  </View>
                  {stats.overdue > 0 && (
                    <View style={{ 
                      flexDirection: "row", 
                      alignItems: "center",
                      backgroundColor: darkMode ? "rgba(239,83,80,0.2)" : "rgba(211,47,47,0.15)",
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 12,
                    }}>
                      <Text style={{ fontSize: 13, color: darkMode ? "#ef5350" : "#d32f2f", fontWeight: "600" }}>
                        {stats.overdue} Overdue
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              <View style={{ flexDirection: "row", gap: 10 }}>
                <TouchableOpacity 
                  onPress={() => setShowStats(true)}
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 21,
                    backgroundColor: darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name="stats-chart" size={20} color={darkMode ? "#fff" : "#1a1a1a"} />
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={toggleFilterMenu}
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 21,
                    backgroundColor: darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name="funnel" size={20} color={darkMode ? "#fff" : "#1a1a1a"} />
                </TouchableOpacity>

                <Pressable 
                  onPress={toggleMenu}
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 21,
                    backgroundColor: darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Animated.View style={iconStyle}>
                    <Ionicons name="menu" size={22} color={darkMode ? "#fff" : "#1a1a1a"} />
                  </Animated.View>
                </Pressable>
              </View>
            </View>

            {/* Menu Dropdown */}
            {menuOpen && (
              <>
                <Pressable
                  style={{
                    position: "absolute",
                    top: -2000,
                    left: -2000,
                    right: -2000,
                    bottom: -2000,
                    backgroundColor: "rgba(0,0,0,0.5)",
                    zIndex: 2500,
                  }}
                  onPress={toggleMenu}
                />
                <Animated.View
                  style={[
                    {
                      position: "absolute",
                      top: 105,
                      right: 20,
                      width: 200,
                      borderRadius: 16,
                      overflow: "hidden",
                      backgroundColor: darkMode ? "#2c2c2c" : "#ffffff",
                      shadowColor: "#000",
                      shadowOpacity: 0.25,
                      shadowOffset: { width: 0, height: 8 },
                      shadowRadius: 16,
                      elevation: 12,
                      zIndex: 3001,
                      borderWidth: 1,
                      borderColor: darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
                    },
                    menuStyle,
                  ]}
                >
                  <Pressable
                    style={{ 
                      flexDirection: "row", 
                      justifyContent: "space-between", 
                      alignItems: "center",
                      padding: 16,
                    }}
                    onPress={() => {
                      setDarkMode(!darkMode);
                      toggleMenu();
                    }}
                  >
                    <Text style={{ color: darkMode ? "#fff" : "#1a1a1a", fontSize: 15, fontWeight: "500" }}>
                      {darkMode ? "Dark Mode" : "Light Mode"}
                    </Text>
                    <Ionicons name={darkMode ? "moon" : "sunny"} size={20} color={darkMode ? "#90caf9" : "#ffa726"} />
                  </Pressable>

                  <View style={{ height: 1, backgroundColor: darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)", marginHorizontal: 12 }} />

                  <Pressable
                    style={{ 
                      flexDirection: "row", 
                      alignItems: "center", 
                      justifyContent: "space-between",
                      padding: 16,
                    }}
                    onPress={() => {
                      toggleMenu();
                      handleLogout();
                    }}
                  >
                    <Text style={{ color: darkMode ? "#ef5350" : "#d32f2f", fontSize: 15, fontWeight: "500" }}>
                      Logout
                    </Text>
                    <Ionicons name="log-out-outline" size={20} color={darkMode ? "#ef5350" : "#d32f2f"} />
                  </Pressable>
                </Animated.View>
              </>
            )}

            {/* Filter Dropdown */}
            {filterMenuOpen && (
              <>
                <Pressable
                  style={{
                    position: "absolute",
                    top: -2000,
                    left: -2000,
                    right: -2000,
                    bottom: -2000,
                    backgroundColor: "rgba(0,0,0,0.5)",
                    zIndex: 2500,
                  }}
                  onPress={toggleFilterMenu}
                />
                <Animated.View
                  style={[
                    {
                      position: "absolute",
                      top: 105,
                      right: 72,
                      width: 220,
                      borderRadius: 16,
                      overflow: "hidden",
                      backgroundColor: darkMode ? "#2c2c2c" : "#ffffff",
                      shadowColor: "#000",
                      shadowOpacity: 0.25,
                      shadowOffset: { width: 0, height: 8 },
                      shadowRadius: 16,
                      elevation: 12,
                      zIndex: 3001,
                      borderWidth: 1,
                      borderColor: darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
                    },
                    filterStyle,
                  ]}
                >
                  <Text style={{ 
                    padding: 16, 
                    paddingBottom: 8,
                    fontWeight: "700", 
                    fontSize: 13,
                    color: darkMode ? "#90caf9" : "#1976d2",
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}>
                    Filter By
                  </Text>
                  {["all", "active", "completed", "overdue", "high"].map((filter, idx) => (
                    <Pressable
                      key={filter}
                      style={{
                        paddingVertical: 12,
                        paddingHorizontal: 16,
                        backgroundColor: filterBy === filter ? (darkMode ? "rgba(144,202,249,0.15)" : "rgba(25,118,210,0.08)") : "transparent",
                      }}
                      onPress={() => {
                        setFilterBy(filter);
                        toggleFilterMenu();
                      }}
                    >
                      <Text style={{ 
                        color: filterBy === filter ? (darkMode ? "#90caf9" : "#1976d2") : (darkMode ? "#e0e0e0" : "#424242"),
                        fontWeight: filterBy === filter ? "600" : "400",
                        fontSize: 14,
                      }}>
                        {filter === "all" ? "All Assignments" : 
                         filter === "active" ? "Active" : 
                         filter === "completed" ? "Completed" : 
                         filter === "overdue" ? "Overdue" : "High Priority"}
                      </Text>
                    </Pressable>
                  ))}
                  
                  <View style={{ height: 1, backgroundColor: darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)", marginVertical: 8, marginHorizontal: 12 }} />
                  
                  <Text style={{ 
                    padding: 16, 
                    paddingBottom: 8,
                    fontWeight: "700", 
                    fontSize: 13,
                    color: darkMode ? "#90caf9" : "#1976d2",
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}>
                    Sort By
                  </Text>
                  {["dueDate", "priority", "subject"].map((sort) => (
                    <Pressable
                      key={sort}
                      style={{
                        paddingVertical: 12,
                        paddingHorizontal: 16,
                        backgroundColor: sortBy === sort ? (darkMode ? "rgba(144,202,249,0.15)" : "rgba(25,118,210,0.08)") : "transparent",
                      }}
                      onPress={() => {
                        setSortBy(sort);
                        toggleFilterMenu();
                      }}
                    >
                      <Text style={{ 
                        color: sortBy === sort ? (darkMode ? "#90caf9" : "#1976d2") : (darkMode ? "#e0e0e0" : "#424242"),
                        fontWeight: sortBy === sort ? "600" : "400",
                        fontSize: 14,
                      }}>
                        {sort === "dueDate" ? "Due Date" : sort === "priority" ? "Priority Level" : "Subject"}
                      </Text>
                    </Pressable>
                  ))}
                </Animated.View>
              </>
            )}
          </BlurView>
        </Animated.View>

        {/* Content */}
        <Animated.FlatList
          data={filteredHomeworks}
          keyExtractor={(item) => item.id}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          contentContainerStyle={{ paddingBottom: 24 }}
          ListHeaderComponent={
            <>
              {/* Search Bar */}
              <BlurView
                intensity={darkMode ? 50 : 40}
                tint={darkMode ? "dark" : "light"}
                style={{
                  borderRadius: 16,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  margin: 20,
                  marginTop: 16,
                  marginBottom: 12,
                  overflow: "hidden",
                  flexDirection: "row",
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
                }}
              >
                <Ionicons name="search" size={20} color={darkMode ? "#90caf9" : "#1976d2"} />
                <TextInput
                  placeholder="Search assignments..."
                  placeholderTextColor={darkMode ? "#78909c" : "#90a4ae"}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  style={{ 
                    fontSize: 15, 
                    color: darkMode ? "#fff" : "#1a1a1a",
                    flex: 1,
                    marginLeft: 12,
                    fontWeight: "400",
                  }}
                />
              </BlurView>

              {/* Input Card */}
              <BlurView
                intensity={darkMode ? 50 : 40}
                tint={darkMode ? "dark" : "light"}
                style={{
                  borderRadius: 20,
                  paddingHorizontal: 20,
                  paddingVertical: 20,
                  marginHorizontal: 20,
                  marginBottom: 20,
                  overflow: "hidden",
                  borderWidth: 1,
                  borderColor: darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 18 }}>
                  <View style={{
                    width: 4,
                    height: 24,
                    backgroundColor: darkMode ? "#90caf9" : "#1976d2",
                    borderRadius: 2,
                    marginRight: 12,
                  }} />
                  <Text style={{ 
                    fontSize: 19, 
                    fontWeight: "700", 
                    color: darkMode ? "#fff" : "#1a1a1a",
                    letterSpacing: -0.3,
                  }}>
                    {editingId ? "Edit Assignment" : "New Assignment"}
                  </Text>
                </View>

                <TextInput
                  placeholder="Assignment Title *"
                  placeholderTextColor={darkMode ? "#78909c" : "#90a4ae"}
                  value={title}
                  onChangeText={setTitle}
                  style={{
                    fontSize: 16,
                    color: darkMode ? "#fff" : "#1a1a1a",
                    marginBottom: 16,
                    backgroundColor: darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)",
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    borderRadius: 12,
                    fontWeight: "500",
                  }}
                />

                <TextInput
                  placeholder="Subject (e.g., Mathematics, Physics)"
                  placeholderTextColor={darkMode ? "#78909c" : "#90a4ae"}
                  value={subject}
                  onChangeText={setSubject}
                  style={{
                    fontSize: 15,
                    color: darkMode ? "#fff" : "#1a1a1a",
                    marginBottom: 16,
                    backgroundColor: darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)",
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    borderRadius: 12,
                  }}
                />

                <TextInput
                  placeholder="Description (optional)"
                  placeholderTextColor={darkMode ? "#78909c" : "#90a4ae"}
                  value={description}
                  onChangeText={setDescription}
                  style={{
                    fontSize: 15,
                    color: darkMode ? "#fff" : "#1a1a1a",
                    marginBottom: 16,
                    backgroundColor: darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)",
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    borderRadius: 12,
                    minHeight: 80,
                    textAlignVertical: "top",
                  }}
                  multiline
                  numberOfLines={3}
                />

                <Text style={{ fontSize: 13, color: darkMode ? "#90caf9" : "#1976d2", marginBottom: 10, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 }}>
                  Priority Level
                </Text>
                <View style={{ flexDirection: "row", marginBottom: 18, gap: 10 }}>
                  {["high", "medium", "low"].map((p) => (
                    <TouchableOpacity
                      key={p}
                      style={{
                        flex: 1,
                        paddingVertical: 12,
                        borderRadius: 12,
                        backgroundColor: priority === p ? getPriorityColor(p) : (darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)"),
                        alignItems: "center",
                        borderWidth: priority === p ? 0 : 1,
                        borderColor: darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
                      }}
                      onPress={() => setPriority(p)}
                    >
                      <Text style={{ 
                        color: priority === p ? "#fff" : (darkMode ? "#e0e0e0" : "#424242"),
                        fontWeight: priority === p ? "700" : "500",
                        textTransform: "capitalize",
                        fontSize: 14,
                      }}>
                        {p}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      borderRadius: 12,
                      backgroundColor: darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)",
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      borderWidth: 1,
                      borderColor: darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
                    }}
                    onPress={() => setShowPicker(true)}
                  >
                    <Ionicons name="calendar-outline" size={18} color={darkMode ? "#90caf9" : "#1976d2"} />
                    <Text style={{ fontSize: 14, color: darkMode ? "#fff" : "#1a1a1a", marginLeft: 10, fontWeight: "500" }}>
                      {dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 16,
                      backgroundColor: darkMode ? "#1976d2" : "#2196f3",
                      alignItems: "center",
                      justifyContent: "center",
                      shadowColor: darkMode ? "#1976d2" : "#2196f3",
                      shadowOpacity: 0.4,
                      shadowOffset: { width: 0, height: 4 },
                      shadowRadius: 12,
                      elevation: 8,
                    }}
                    onPress={handleSaveHomework}
                  >
                    <Ionicons 
                      name={editingId ? "checkmark" : "add"} 
                      size={28} 
                      color="#fff" 
                    />
                  </TouchableOpacity>
                </View>
              </BlurView>

              {showPicker && Platform.OS !== "web" && (
                <DateTimePicker
                  value={dueDate}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={(event, selectedDate) => {
                    setShowPicker(false);
                    if (selectedDate) setDueDate(selectedDate);
                  }}
                />
              )}

              {showPicker && Platform.OS === "web" && (
                <Modal
                  visible={showPicker}
                  transparent
                  animationType="fade"
                  onRequestClose={() => setShowPicker(false)}
                >
                  <Pressable
                    style={{
                      flex: 1,
                      backgroundColor: "rgba(0,0,0,0.6)",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                    onPress={() => setShowPicker(false)}
                  >
                    <Pressable onPress={(e) => e.stopPropagation()}>
                      <BlurView
                        intensity={60}
                        tint={darkMode ? "dark" : "light"}
                        style={{
                          width: 340,
                          borderRadius: 24,
                          padding: 28,
                          overflow: "hidden",
                          borderWidth: 1,
                          borderColor: darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
                        }}
                      >
                        <Text style={{ 
                          fontSize: 22, 
                          fontWeight: "700", 
                          color: darkMode ? "#fff" : "#1a1a1a",
                          marginBottom: 24,
                        }}>
                          Select Due Date
                        </Text>

                        <TextInput
                          type="date"
                          value={dueDate.toISOString().split('T')[0]}
                          onChange={(e) => {
                            const newDate = new Date(e.target.value);
                            if (!isNaN(newDate.getTime())) {
                              setDueDate(newDate);
                            }
                          }}
                          style={{
                            fontSize: 16,
                            color: darkMode ? "#fff" : "#1a1a1a",
                            backgroundColor: darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)",
                            padding: 14,
                            borderRadius: 12,
                            borderWidth: 1,
                            borderColor: darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
                            marginBottom: 24,
                          }}
                        />

                        <View style={{ flexDirection: "row", gap: 12 }}>
                          <TouchableOpacity
                            style={{
                              flex: 1,
                              paddingVertical: 14,
                              borderRadius: 12,
                              backgroundColor: darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)",
                              alignItems: "center",
                            }}
                            onPress={() => setShowPicker(false)}
                          >
                            <Text style={{ color: darkMode ? "#fff" : "#1a1a1a", fontWeight: "600" }}>
                              Cancel
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={{
                              flex: 1,
                              paddingVertical: 14,
                              borderRadius: 12,
                              backgroundColor: darkMode ? "#1976d2" : "#2196f3",
                              alignItems: "center",
                            }}
                            onPress={() => setShowPicker(false)}
                          >
                            <Text style={{ color: "#fff", fontWeight: "600" }}>
                              Confirm
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </BlurView>
                    </Pressable>
                  </Pressable>
                </Modal>
              )}
            </>
          }
          renderItem={({ item }) => (
            <Animated.View layout={Layout.springify()}>
              <BlurView
                intensity={darkMode ? 50 : 40}
                tint={darkMode ? "dark" : "light"}
                style={{
                  borderRadius: 18,
                  padding: 18,
                  marginHorizontal: 20,
                  marginBottom: 14,
                  overflow: "hidden",
                  borderLeftWidth: 4,
                  borderLeftColor: getPriorityColor(item.priority || "medium"),
                  opacity: completed[item.id] ? 0.65 : 1,
                  borderWidth: 1,
                  borderColor: darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)",
                }}
              >
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                      <TouchableOpacity 
                        onPress={() => toggleComplete(item.id)}
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: 13,
                          borderWidth: 2.5,
                          borderColor: getPriorityColor(item.priority || "medium"),
                          backgroundColor: completed[item.id] ? getPriorityColor(item.priority || "medium") : "transparent",
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: 12,
                        }}
                      >
                        {completed[item.id] && (
                          <Ionicons name="checkmark" size={16} color="#fff" />
                        )}
                      </TouchableOpacity>
                      <Text
                        style={{
                          fontSize: 17,
                          fontWeight: "700",
                          color: darkMode ? "#fff" : "#1a1a1a",
                          textDecorationLine: completed[item.id] ? "line-through" : "none",
                          flex: 1,
                          letterSpacing: -0.2,
                        }}
                      >
                        {item.title}
                      </Text>
                    </View>

                    {item.subject && (
                      <View style={{ 
                        flexDirection: "row", 
                        alignItems: "center",
                        marginBottom: 10,
                        marginLeft: 38,
                      }}>
                        <View style={{
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          borderRadius: 10,
                          backgroundColor: darkMode ? "rgba(144,202,249,0.15)" : "rgba(25,118,210,0.1)",
                          borderWidth: 1,
                          borderColor: darkMode ? "rgba(144,202,249,0.3)" : "rgba(25,118,210,0.2)",
                        }}>
                          <Text style={{ 
                            fontSize: 12, 
                            color: darkMode ? "#90caf9" : "#1976d2",
                            fontWeight: "600",
                            letterSpacing: 0.3,
                          }}>
                            {item.subject}
                          </Text>
                        </View>
                      </View>
                    )}

                    {item.description ? (
                      <View style={{ marginLeft: 38 }}>
                        <Text
                          numberOfLines={expandedId === item.id ? undefined : 2}
                          style={{
                            fontSize: 14,
                            color: darkMode ? "#b0bec5" : "#546e7a",
                            marginTop: 2,
                            lineHeight: 21,
                          }}
                        >
                          {item.description}
                        </Text>

                        {item.description.length > 80 && (
                          <TouchableOpacity
                            onPress={() =>
                              setExpandedId(expandedId === item.id ? null : item.id)
                            }
                          >
                            <Text
                              style={{
                                fontSize: 13,
                                color: darkMode ? "#90caf9" : "#1976d2",
                                marginTop: 6,
                                fontWeight: "600",
                              }}
                            >
                              {expandedId === item.id ? "Show less" : "Read more"}
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    ) : null}

                    <View style={{ 
                      marginLeft: 38, 
                      marginTop: 12,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                    }}>
                      <View style={{
                        flexDirection: "row",
                        alignItems: "center",
                        backgroundColor: darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        borderRadius: 8,
                      }}>
                        <Ionicons name="calendar-outline" size={14} color={getDueDateColor(item.dueDate)} />
                        <Text
                          style={{
                            fontSize: 13,
                            fontWeight: "600",
                            color: getDueDateColor(item.dueDate),
                            marginLeft: 6,
                          }}
                        >
                          {new Date(item.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </Text>
                      </View>

                      <View style={{
                        backgroundColor: darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        borderRadius: 8,
                      }}>
                        <Text
                          style={{
                            fontSize: 12,
                            color: getDueDateColor(item.dueDate),
                            fontWeight: "500",
                          }}
                        >
                          {getCountdownText(item.dueDate)}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View
                    style={{
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      borderRadius: 10,
                      backgroundColor: getPriorityColor(item.priority || "medium"),
                      marginLeft: 12,
                    }}
                  >
                    <Text style={{ color: "#fff", fontSize: 11, fontWeight: "700", letterSpacing: 0.5 }}>
                      {(item.priority || "medium").toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "flex-end",
                    marginTop: 14,
                    gap: 20,
                    paddingTop: 14,
                    borderTopWidth: 1,
                    borderTopColor: darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
                  }}
                >
                  <TouchableOpacity 
                    onPress={() => handleEdit(item)}
                    style={{ flexDirection: "row", alignItems: "center" }}
                  >
                    <Ionicons name="create-outline" size={18} color={darkMode ? "#90caf9" : "#1976d2"} />
                    <Text style={{ marginLeft: 6, color: darkMode ? "#90caf9" : "#1976d2", fontWeight: "600", fontSize: 14 }}>
                      Edit
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => handleDelete(item.id)}
                    style={{ flexDirection: "row", alignItems: "center" }}
                  >
                    <Ionicons name="trash-outline" size={18} color={darkMode ? "#ef5350" : "#d32f2f"} />
                    <Text style={{ marginLeft: 6, color: darkMode ? "#ef5350" : "#d32f2f", fontWeight: "600", fontSize: 14 }}>
                      Delete
                    </Text>
                  </TouchableOpacity>
                </View>
              </BlurView>
            </Animated.View>
          )}
          ListEmptyComponent={
            <View style={{ alignItems: "center", marginTop: 80, paddingHorizontal: 40 }}>
              <View style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                backgroundColor: darkMode ? "rgba(144,202,249,0.1)" : "rgba(25,118,210,0.08)",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 24,
              }}>
                <Ionicons name="school-outline" size={56} color={darkMode ? "#90caf9" : "#1976d2"} />
              </View>
              <Text
                style={{
                  textAlign: "center",
                  fontSize: 20,
                  color: darkMode ? "#fff" : "#1a1a1a",
                  fontWeight: "700",
                  marginBottom: 8,
                }}
              >
                {searchQuery || filterBy !== "all" ? "No Results Found" : "No Assignments Yet"}
              </Text>
              <Text
                style={{
                  textAlign: "center",
                  color: darkMode ? "#90a4ae" : "#78909c",
                  fontSize: 15,
                  lineHeight: 22,
                }}
              >
                {searchQuery || filterBy !== "all"
                  ? "Try adjusting your search or filters"
                  : "Create your first assignment to get started"}
              </Text>
            </View>
          }
        />

        {/* Statistics Modal */}
        <Modal
          visible={showStats}
          transparent
          animationType="fade"
          onRequestClose={() => setShowStats(false)}
        >
          <Pressable
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.7)",
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={() => setShowStats(false)}
          >
            <Pressable onPress={(e) => e.stopPropagation()}>
              <BlurView
                intensity={60}
                tint={darkMode ? "dark" : "light"}
                style={{
                  width: 360,
                  borderRadius: 24,
                  padding: 28,
                  overflow: "hidden",
                  borderWidth: 1,
                  borderColor: darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
                }}
              >
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                  <Text style={{ fontSize: 26, fontWeight: "700", color: darkMode ? "#fff" : "#1a1a1a", letterSpacing: -0.5 }}>
                    Statistics
                  </Text>
                  <TouchableOpacity onPress={() => setShowStats(false)}>
                    <Ionicons name="close-circle" size={32} color={darkMode ? "#78909c" : "#90a4ae"} />
                  </TouchableOpacity>
                </View>

                <View style={{ gap: 14 }}>
                  <View style={{
                    backgroundColor: darkMode ? "rgba(33,150,243,0.2)" : "rgba(25,118,210,0.12)",
                    padding: 20,
                    borderRadius: 18,
                    borderWidth: 1,
                    borderColor: darkMode ? "rgba(144,202,249,0.3)" : "rgba(25,118,210,0.2)",
                  }}>
                    <Text style={{ fontSize: 42, fontWeight: "800", color: darkMode ? "#90caf9" : "#1976d2", letterSpacing: -1 }}>
                      {stats.total}
                    </Text>
                    <Text style={{ fontSize: 14, color: darkMode ? "#90caf9" : "#1976d2", marginTop: 4, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 }}>
                      Total Assignments
                    </Text>
                  </View>

                  <View style={{ flexDirection: "row", gap: 14 }}>
                    <View style={{
                      flex: 1,
                      backgroundColor: darkMode ? "rgba(102,187,106,0.2)" : "rgba(76,175,80,0.12)",
                      padding: 20,
                      borderRadius: 18,
                      borderWidth: 1,
                      borderColor: darkMode ? "rgba(129,199,132,0.3)" : "rgba(76,175,80,0.2)",
                    }}>
                      <Text style={{ fontSize: 36, fontWeight: "800", color: darkMode ? "#81c784" : "#43a047", letterSpacing: -1 }}>
                        {stats.completedCount}
                      </Text>
                      <Text style={{ fontSize: 12, color: darkMode ? "#81c784" : "#43a047", marginTop: 4, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.3 }}>
                        Completed
                      </Text>
                    </View>

                    <View style={{
                      flex: 1,
                      backgroundColor: darkMode ? "rgba(239,83,80,0.2)" : "rgba(211,47,47,0.12)",
                      padding: 20,
                      borderRadius: 18,
                      borderWidth: 1,
                      borderColor: darkMode ? "rgba(239,83,80,0.3)" : "rgba(211,47,47,0.2)",
                    }}>
                      <Text style={{ fontSize: 36, fontWeight: "800", color: darkMode ? "#ef5350" : "#d32f2f", letterSpacing: -1 }}>
                        {stats.overdue}
                      </Text>
                      <Text style={{ fontSize: 12, color: darkMode ? "#ef5350" : "#d32f2f", marginTop: 4, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.3 }}>
                        Overdue
                      </Text>
                    </View>
                  </View>

                  <View style={{
                    backgroundColor: darkMode ? "rgba(255,167,38,0.2)" : "rgba(245,124,0,0.12)",
                    padding: 20,
                    borderRadius: 18,
                    borderWidth: 1,
                    borderColor: darkMode ? "rgba(255,167,38,0.3)" : "rgba(245,124,0,0.2)",
                  }}>
                    <Text style={{ fontSize: 36, fontWeight: "800", color: darkMode ? "#ffa726" : "#f57c00", letterSpacing: -1 }}>
                      {stats.dueToday}
                    </Text>
                    <Text style={{ fontSize: 14, color: darkMode ? "#ffa726" : "#f57c00", marginTop: 4, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 }}>
                      Due Today
                    </Text>
                  </View>

                  {stats.total > 0 && (
                    <View style={{
                      backgroundColor: darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
                      padding: 20,
                      borderRadius: 18,
                      marginTop: 6,
                      borderWidth: 1,
                      borderColor: darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
                    }}>
                      <Text style={{ fontSize: 14, fontWeight: "700", color: darkMode ? "#fff" : "#1a1a1a", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12 }}>
                        Completion Rate
                      </Text>
                      <Text style={{ fontSize: 42, fontWeight: "800", color: darkMode ? "#66bb6a" : "#43a047", marginBottom: 14, letterSpacing: -1 }}>
                        {Math.round((stats.completedCount / stats.total) * 100)}%
                      </Text>
                      <View style={{
                        height: 10,
                        backgroundColor: darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
                        borderRadius: 5,
                        overflow: "hidden",
                      }}>
                        <View style={{
                          height: "100%",
                          width: `${(stats.completedCount / stats.total) * 100}%`,
                          backgroundColor: darkMode ? "#66bb6a" : "#43a047",
                          borderRadius: 5,
                        }} />
                      </View>
                    </View>
                  )}
                </View>
              </BlurView>
            </Pressable>
          </Pressable>
        </Modal>
      </View>
    </ImageBackground>
  );
}