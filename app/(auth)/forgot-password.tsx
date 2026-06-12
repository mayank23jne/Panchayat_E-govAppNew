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
  Alert,
} from "react-native";
import { router } from "expo-router";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleForgotPassword = async () => {
    setError("");

    if (!email.trim()) {
      setError("ईमेल आवश्यक है।"); // Email is required.
      return;
    }

    setIsLoading(true);

    try {
      const API_URL = "https://panchayat.jyada.in/api/auth/forgot-password";

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
        }),
      });

      let data: any = {};
      try {
        const textResponse = await response.text();
        if (textResponse) {
          data = JSON.parse(textResponse);
        }
      } catch (e) {
        // Fallback if not JSON
      }

      if (!response.ok) {
        throw new Error(data.message || "कुछ गलत हो गया। कृपया पुनः प्रयास करें।"); // Something went wrong
      }

      Alert.alert(
        "सफलता", // Success
        "कृपया अपना ईमेल जांचें।", // Please check your email.
        [{ text: "ठीक है", onPress: () => router.back() }] // OK
      );
    } catch (err: any) {
      console.error("Forgot Password Error Details:", err);
      Alert.alert("त्रुटि", err.message || "नेटवर्क कनेक्शन त्रुटि।"); // Error / Network connection error
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
            
            {/* Back button */}
            <TouchableOpacity 
              className="mb-6 self-start"
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Text className="text-blue-600 font-medium text-base">← वापस जाएं</Text>
            </TouchableOpacity>

            {/* Top Branding Section */}
            <View className="flex-row items-center mb-5">
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
              <Text className="text-2xl font-bold text-slate-900 mb-2">
                पासवर्ड भूल गए?
              </Text>
              <Text className="text-base text-slate-600 font-medium">
                अपना ईमेल दर्ज करें और हम आपको पासवर्ड रीसेट करने के निर्देश भेजेंगे।
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
                {error ? (
                  <Text className="text-xs font-medium text-rose-600 mt-2 ml-1">
                    {error}
                  </Text>
                ) : null}
              </View>
            </View>

            {/* Footer Form Action Buttons */}
            <View className="w-full items-center mt-12">
              <TouchableOpacity
                onPress={handleForgotPassword}
                disabled={isLoading}
                className="w-full h-14 bg-blue-600 rounded-xl items-center justify-center shadow-lg shadow-blue-600/20 active:opacity-85 mb-4"
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text className="text-white font-bold text-base tracking-wide">
                    सबमिट करें
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
