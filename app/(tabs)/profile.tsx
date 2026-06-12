import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/auth";

export default function ProfileScreen() {
  const { user, authToken, logout } = useAuth();

  const [newPassword, setNewPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleUpdatePassword = async () => {
    setMessage(null);

    if (!newPassword.trim() || !passwordConfirm.trim()) {
      setMessage({ type: "error", text: "कृपया दोनों पासवर्ड फ़ील्ड भरें।" });
      return;
    }

    if (newPassword !== passwordConfirm) {
      setMessage({ type: "error", text: "नए पासवर्ड मेल नहीं खाते।" });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://panchayat.jyada.in/api/update-password/${user?.id}`,
        {
          method: "PATCH", // Or PUT depending on API design
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            newPassword,
            passwordConfirm,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "पासवर्ड अपडेट करने में विफल।");
      }

      setMessage({
        type: "success",
        text: "पासवर्ड सफलतापूर्वक अपडेट हो गया!",
      });
      setNewPassword("");
      setPasswordConfirm("");
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.message || "कोई त्रुटि हुई। कृपया पुनः प्रयास करें।",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoutPress = () => {
    Alert.alert(
      "लॉग आउट करें",
      "क्या आप वाकई लॉग आउट करना चाहते हैं?",
      [
        {
          text: "रद्द करें",
          style: "cancel",
        },
        {
          text: "लॉग आउट",
          style: "destructive",
          onPress: logout,
        },
      ],
      {
        cancelable: true,
      },
    );
  };

  const inputStyle = "flex-1 text-base text-slate-900 py-4";

  return (
    <SafeAreaView className="flex-1 bg-slate-50 mt-[-48px] pb-[-30px]">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            padding: 24,
            paddingBottom: 48,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* User Info Card */}
          <View className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-6 items-center mt-4">
            <View className="bg-blue-600 w-20 h-20 rounded-full items-center justify-center mb-4 shadow-md shadow-blue-600/30">
              <Text className="text-white text-3xl font-black uppercase">
                {user?.name?.charAt(0)}
              </Text>
            </View>
            <Text className="text-xl font-black text-slate-900 mb-1">
              {user?.name}
            </Text>
            <Text className="text-sm font-semibold text-slate-500 mb-1">
              {user?.email}
            </Text>
          </View>

          {/* Update Password Form */}
          <View className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <Text className="text-lg font-black text-slate-800 mb-6">
              पासवर्ड बदलें
            </Text>

            {message && (
              <View
                className={`p-4 rounded-xl mb-6 ${message.type === "success" ? "bg-emerald-50 border border-emerald-100" : "bg-rose-50 border border-rose-100"}`}
              >
                <Text
                  className={`text-sm font-bold ${message.type === "success" ? "text-emerald-700" : "text-rose-700"}`}
                >
                  {message.text}
                </Text>
              </View>
            )}

            <View className="gap-y-5">
              <View>
                <Text className="text-sm font-semibold text-slate-700 mb-2 ml-1">
                  नया पासवर्ड
                </Text>
                <View className="flex-row items-center w-full border border-slate-200 bg-slate-50 rounded-xl px-4 focus:border-blue-500 focus:bg-white transition-colors">
                  <TextInput
                    className={inputStyle}
                    placeholder="••••••••••"
                    placeholderTextColor="#94A3B8"
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry={!showNewPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowNewPassword(!showNewPassword)}
                    className="p-2"
                  >
                    <Feather
                      name={showNewPassword ? "eye-off" : "eye"}
                      size={20}
                      color="#2563EB"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View>
                <Text className="text-sm font-semibold text-slate-700 mb-2 ml-1">
                  पासवर्ड की पुष्टि करें
                </Text>
                <View className="flex-row items-center w-full border border-slate-200 bg-slate-50 rounded-xl px-4 focus:border-blue-500 focus:bg-white transition-colors">
                  <TextInput
                    className={inputStyle}
                    placeholder="••••••••••"
                    placeholderTextColor="#94A3B8"
                    value={passwordConfirm}
                    onChangeText={setPasswordConfirm}
                    secureTextEntry={!showConfirmPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="p-2"
                  >
                    <Feather
                      name={showConfirmPassword ? "eye-off" : "eye"}
                      size={20}
                      color="#2563EB"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                onPress={handleUpdatePassword}
                disabled={isLoading}
                className="w-full h-14 bg-blue-600 rounded-xl items-center justify-center shadow-md shadow-blue-600/20 mt-4 active:opacity-85"
              >
                {isLoading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text className="text-white font-bold text-base tracking-wide">
                    पासवर्ड अपडेट करें
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Logout Button */}
          <TouchableOpacity
            onPress={handleLogoutPress}
            className="w-full h-14 bg-rose-50 border border-rose-200 rounded-xl items-center justify-center mt-6 active:bg-rose-100"
          >
            <Text className="text-rose-600 font-bold text-base tracking-wide">
              लॉग आउट
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
