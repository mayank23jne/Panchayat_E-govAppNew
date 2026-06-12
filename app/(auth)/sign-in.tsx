import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";

import { useAuth } from "../../context/auth";

export default function SignInScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [fieldErrors, setFieldErrors] = useState({
    identifier: "",
    password: "",
    code: "",
  });

  const handleSignIn = async () => {
    // 1. Basic validation before triggering network overhead
    // if (!email || !password) {
    //  alert("Please complete all inputs.");
    //   return;
    // }

    // 1. Clear previous errors before running validation
    setFieldErrors({
      identifier: "",
      password: "",
      code: "",
    });

    let hasError = false;
    const errors = { identifier: "", password: "", code: "" };

    // 2. Check for missing identifier/email
    if (!email.trim()) {
      errors.identifier = "ईमेल या पहचानकर्ता आवश्यक है।";
      hasError = true;
    }

    // 3. Check for missing password
    if (!password.trim()) {
      errors.password = "पासवर्ड आवश्यक है।";
      hasError = true;
    }

    // 4. If there's an error, update state and stop execution
    if (hasError) {
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);

    try {
      const API_URL = "https://panchayat.jyada.in/api/login";

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(), // Sanitize strings for database matching
          password: password,
          isMobile: true,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data.message || "Invalid credentials. Please try again.",
        );
      }

      // 4. Extract token dynamically and store it via your layout context
      // This assumes your API responds with a json body containing a token variable: { token: "ey..." }
      if (data.token) {
        await login(data.token, data.user);
      } else {
        throw new Error(
          "The server did not return a valid authentication token.",
        );
      }
    } catch (error: any) {
      // Catch network errors, timeouts, or thrown credential messages
      console.error("Sign-In Error Details:", error);
      alert(
        error.message ||
          "Authentication failed due to a network connection error.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle =
    "w-full border border-slate-200 bg-white rounded-xl px-5 py-4 text-base text-slate-900 shadow-inner";

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <SafeAreaView className="flex-1">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 justify-center px-8 pt-8 pb-12">
            {/* Top Branding Section */}
            <View className="flex-row items-center mb-5 mt-6">
              <View className="items-start">
                <View className="flex flex-row justify-center items-center gap-2">
                  <View className="bg-blue-600 w-10 h-10 rounded-xl items-center justify-center shadow-sm shadow-blue-600/20">
                    <Text className="text-white text-xl font-black tracking-tighter">
                      P
                    </Text>
                  </View>
                  <View>
                    <Text className="text-xl font-extrabold text-slate-950 tracking-tight">
                      Panchayat E-Gov
                    </Text>
                    <Text className="text-sm font-semibold text-slate-500">
                      Fund & Work Management
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Welcome Heading Section */}
            <View className="mb-8">
              <Text className="text-base text-slate-600 font-medium">
                {/* Login and Check Fund and Work Status. */}
                लॉगिन करें और फंड तथा कार्य की स्थिति की जांच करें।
              </Text>
            </View>

            {/* Form Fields container */}
            <View className="gap-y-6">
              <View>
                <Text className="text-sm font-semibold text-slate-800 mb-2 ml-0.5">
                  ईमेल
                </Text>
                <TextInput
                  className={inputStyle}
                  placeholder="you@panchayat.gov"
                  placeholderTextColor="#94A3B8"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {fieldErrors.identifier ? (
                  <Text className="text-xs font-medium text-rose-600 mt-2 ml-1">
                    {fieldErrors.identifier}
                  </Text>
                ) : null}
              </View>

              <View>
                <View className="flex-row justify-between items-baseline mb-2 ml-0.5">
                  <Text className="text-sm font-semibold text-slate-800">
                    पासवर्ड
                  </Text>
                  <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/(auth)/forgot-password')}>
                    <Text className="text-xs font-semibold text-blue-600">पासवर्ड भूल गए?</Text>
                  </TouchableOpacity>
                </View>
                <TextInput
                  className={inputStyle}
                  placeholder="••••••••••"
                  placeholderTextColor="#94A3B8"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
                {fieldErrors.password ? (
                  <Text className="text-xs font-medium text-rose-600 mt-2 ml-1">
                    {fieldErrors.password}
                  </Text>
                ) : null}
              </View>
            </View>

            {/* Footer Form Action Buttons & Demo Metadata */}
            <View className="w-full items-center mt-12">
              <TouchableOpacity
                onPress={handleSignIn}
                disabled={isLoading}
                className="w-full h-14 bg-blue-600 rounded-xl items-center justify-center shadow-lg shadow-blue-600/20 active:opacity-85 mb-4"
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text className="text-white font-bold text-base tracking-wide">
                    लॉगिन करें
                  </Text>
                )}
              </TouchableOpacity>

              {/* Static Metadata Credentials View block matching UI requirements */}
              {/* <View className="mt-8 px-4 items-center gap-y-1">
                <Text className="text-sm text-slate-500 font-medium">Demo Credentials</Text>
                <Text className="text-sm font-semibold text-slate-900 tracking-tight">
                  admin@panchayat.gov / Admin@12345
                </Text>
              </View> */}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
