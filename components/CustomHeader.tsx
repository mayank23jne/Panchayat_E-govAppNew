import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../context/auth";
import { router } from "expo-router";

export default function CustomHeader() {
  const { user } = useAuth();

  return (
    <View className="bg-white border-b border-slate-200 px-4 pt-4 pb-3 flex-row justify-between items-center border-b border-slate-200 shadow-sm z-50 mt-9">
      {/* HEADER NAVBAR */}
      {/* <View className="bg-white px-4 py-3.5 flex-row justify-between items-center border-b border-slate-200 shadow-sm z-50"> */}
      <TouchableOpacity 
        className="flex-row items-center gap-x-2.5"
        onPress={() => router.push('/Dashboard')}
        activeOpacity={0.7}
      >
        <View className="bg-blue-600 w-10 h-10 rounded-xl items-center justify-center shadow-sm shadow-blue-600/20">
          <Text className="text-white text-xl font-black tracking-tighter">
            P
          </Text>
        </View>
        <View>
          <Text className="text-base font-black text-slate-900 tracking-tight leading-5">
            Panchayat
          </Text>
          <Text className="text-xs font-semibold text-slate-400">
            E-Governance
          </Text>
        </View>
      </TouchableOpacity>

      <View className="flex-row items-center gap-x-3.5">
        <TouchableOpacity
          onPress={() => router.push("/profile")}
          className="flex-row items-center gap-x-2"
        >
          <Text className="text-sm font-bold text-slate-700">
            {user?.name?.split(' ')[0]}
          </Text>
          <View className="bg-blue-600 w-8 h-8 rounded-full items-center justify-center">
            <Text className="text-white text-xs font-bold uppercase">
              {user?.name?.charAt(0)?.toUpperCase()}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
      {/* </View> */}
    </View>
  );
}
