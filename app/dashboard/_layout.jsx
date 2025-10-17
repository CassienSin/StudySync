import { Stack } from "expo-router";

export default function DashboardLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // ✅ removes the white bar with "Dashboard"
      }}
    />
  );
}
