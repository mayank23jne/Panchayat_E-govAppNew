import { Redirect, Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../../context/auth";

export default function AuthLayout() {
  const { authToken, isLoaded } = useAuth();

  // Wait until context confirms it's finished loading
  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  // If a token exists, push them to the home route
  if (authToken) {
    return <Redirect href="/Dashboard" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}