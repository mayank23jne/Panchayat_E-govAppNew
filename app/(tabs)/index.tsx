import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import FundsPage from "../../components/FundsPage"; // Import your modular dashboard layout component

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-slate-50 mt-0 pb-[-30px]">
      {/* This renders the external dashboard content directly into the 
        main secure router window view upon loading 
      */}
      <FundsPage />
    </SafeAreaView>
  );
}
