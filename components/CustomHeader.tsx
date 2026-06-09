import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../context/auth";

export default function CustomHeader() {
  const { logout, user } = useAuth(); // Assuming your auth context provides a logout function

  return (
      <View className="bg-white border-b border-slate-200 px-4 pt-4 pb-3 flex-row justify-between items-center border-b border-slate-200 shadow-sm z-50">
  
      {/* HEADER NAVBAR */}
          {/* <View className="bg-white px-4 py-3.5 flex-row justify-between items-center border-b border-slate-200 shadow-sm z-50"> */}
            <View className="flex-row items-center gap-x-2.5">
              <View className="bg-blue-600 w-10 h-10 rounded-xl items-center justify-center shadow-sm shadow-blue-600/20">
                <Text className="text-white text-xl font-black tracking-tighter">P</Text>
              </View>
              <View>
                <Text className="text-base font-black text-slate-900 tracking-tight leading-5">Panchayat</Text>
                <Text className="text-xs font-semibold text-slate-400">E-Governance</Text>
              </View>
            </View>
    
            <View className="flex-row items-center gap-x-3.5">
              <View className="bg-blue-600 w-8 h-8 rounded-full items-center justify-center">
                <Text className="text-white text-xs font-bold uppercase">{user?.name?.charAt(0)?.toUpperCase()}</Text>
              </View>
              <TouchableOpacity 
                onPress={logout} 
                className="bg-slate-50 border border-slate-200 px-3.5 py-1.5 rounded-lg active:bg-slate-100"
              >
                <Text className="text-slate-700 font-bold text-xs tracking-tight">लॉग आउट</Text>
              </TouchableOpacity>
            </View>
          {/* </View> */}
        </View>
  );
}