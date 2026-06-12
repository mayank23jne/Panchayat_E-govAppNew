import CustomHeader from "@/components/CustomHeader";
import { Redirect, Tabs } from "expo-router";
import React from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { useAuth } from "../../context/auth";

export default function TabsLayout() {
  const { authToken, isLoaded } = useAuth();

  // 1. Show loader while checking authentication status
  if (!isLoaded) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  // 2. Gatekeeper: If not logged in, redirect away from tabs to sign-in page
  if (!authToken) {
    return <Redirect href="/sign-in" />;
  }

  // 3. Render the physical Bottom Tab interface once authenticated
  return (
    <Tabs
      screenOptions={{
        headerShown: true, // Enable the header layout layer globally for tabs
        header: () => <CustomHeader />, // Prevents layout duplicate header nesting
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopWidth: 1,
          borderTopColor: "#e2e8f0", // slate-200 border line separator
          height: 115,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: "#2563eb", // active selection: blue-600
        tabBarInactiveTintColor: "#94a3b8", // inactive selection: slate-400
        tabBarLabelStyle: {
          fontSize: 16,
          fontWeight: "700",
        },
      }}
    >
      {/* DASHBOARD TAB (Points automatically to app/(tabs)/index.tsx) */}

      <Tabs.Screen
        name="Dashboard"
        options={{
          title: "डैशबोर्ड",
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 21, fontWeight: "bold" }}>⊞</Text>
          ),
        }}
      />

      <Tabs.Screen
        name="index"
        options={{
          title: "मद",
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 21, fontWeight: "bold" }}>₹</Text>
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          href: null,
          title: "प्रोफ़ाइल",
        }}
      />
    </Tabs>
  );
}
