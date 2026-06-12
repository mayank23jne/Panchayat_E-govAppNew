// import React, { useEffect, useMemo, useState } from "react";
// import { ScrollView, Text, TouchableOpacity, View } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { useAuth } from "../../context/auth";

// // --- Data interfaces to match your database schema ---
// interface FundRecord {
//   id: string;
//   allocationTime: string;
//   workName: string;
//   gramPanchayat: { id: string; name: string } | null;
//   villageName: string;
//   amount: string | number;
//   status: string;
// }

// interface DashboardPageProps {
//   funds: FundRecord[]; // Pass your data array from the screen container component
//   isLoadingData?: boolean;
// }

// export default function DashboardPage({ funds = [], isLoadingData = false }: DashboardPageProps) {
//   const { logout, authToken, user } = useAuth();
//   const currentYear = new Date().getFullYear(); // 2026

//   // 1. Core State Managers
//   const [selectedYear, setSelectedYear] = useState<number>(currentYear);
//   const [showYearDropdown, setShowYearDropdown] = useState<boolean>(false);

//   const [dashboardData, setDashboardData] = useState({
//     metrics: {
//       totalAmount: 0,
//       totalFundsCount: 0,
//       totalGramPanchayatsAllotted: 0,
//       totalGramsAllotted: 0,
//     },
//     data: []
//   });

//   const [error, setError] = useState(null);

//   // 2. Generate dynamic last 10 years array list
//   const yearsList = useMemo(() => {
//     const list = [];
//     for (let i = 0; i < 10; i++) {
//       list.push(currentYear - i);
//     }
//     return list;
//   }, [currentYear]);

//   // 3. Filter data dynamically by matching selected year
//   const filteredDataByYear = useMemo(() => {
//     return funds.filter((item) => {
//       if (!item.allocationTime) return false;
//       const allocationYear = new Date(item.allocationTime).getFullYear();
//       return allocationYear === selectedYear;
//     });
//   }, [funds, selectedYear]);

//   // 4. Compute Dynamic Overview Card Aggregates
//   const stats = useMemo(() => {
//     let totalAmt = 0;
//     const uniqueGPs = new Set<string>();
//     const uniqueVillages = new Set<string>();

//     filteredDataByYear.forEach((item) => {
//       // Total amount computation safety
//       const numAmount = typeof item.amount === "string" ? parseFloat(item.amount) : item.amount;
//       if (!isNaN(numAmount)) {
//         totalAmt += numAmount;
//       }

//       // Collect Unique Gram Panchayats safely
//       if (item.gramPanchayat?.name) {
//         uniqueGPs.add(item.gramPanchayat.name);
//       } else if (item.gramPanchayat?.id) {
//         uniqueGPs.add(item.gramPanchayat.id);
//       }

//       // Collect Unique Grams / Villages
//       if (item.villageName) {
//         uniqueVillages.add(item.villageName.trim().toLowerCase());
//       }
//     });

//     return {
//       totalAmount: totalAmt,
//       totalFundsCount: filteredDataByYear.length,
//       totalGPs: uniqueGPs.size,
//       totalGrams: uniqueVillages.size,
//     };
//   }, [filteredDataByYear]);

//   // Fetching funds master list
//     useEffect(() => {
//       const fetchLedgerData = async () => {
//         // setIsLoadingData(true);
//         // setErrorMessage("");

//         try {
//           let url = `https://panchayat.jyada.in/api/dashboard/?year=${selectedYear}`;

//           const response = await fetch(url, {
//             method: "GET",
//             headers: {
//               "Content-Type": "application/json",
//               "Authorization": `Bearer ${authToken}`
//             }
//           });

//           if (!response.ok) {
//             throw new Error(`Server returned error status code: ${response.status}`);
//           }

//           const apiResponse = await response.json();
//           if (apiResponse.success) {
//         setDashboardData({
//           metrics: apiResponse.datacount,
//           data: apiResponse.data
//         });
//       } else {
//         setError(apiResponse.error || 'Failed to fetch dashboard metrics');
//       }

//         } catch (error: any) {
//           console.error("Fetch Funds Error Log:", error);
//           // setErrorMessage("Failed to refresh ledger data.");
//         } finally {
//           // setIsLoadingData(false);
//         }
//       };

//       if (authToken) {
//         fetchLedgerData();
//       }
//     }, [authToken]);

//   return (
//     <SafeAreaView edges={["left", "right"]} className="flex-1 bg-slate-50">

//       {/* YEAR FILTER DROPDOWN AREA */}
//       <View className="bg-white p-4 border-b border-slate-200 z-50 shadow-xs flex-row justify-between items-center">
//         <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider">आवंटन वर्ष चुनें</Text>

//         <TouchableOpacity
//           onPress={() => setShowYearDropdown(!showYearDropdown)}
//           className="bg-blue-50 border border-blue-100 px-4 py-2 rounded-xl flex-row items-center active:bg-blue-100"
//         >
//           <Text className="text-blue-600 font-black text-sm mr-2">{selectedYear}</Text>
//           <Text className="text-blue-400 text-[12px]">▼</Text>
//         </TouchableOpacity>

//         {/* YEAR LIST DROPDOWN SELECTION FLOATING DIALOG */}
//         {showYearDropdown && (
//           <View className="bg-white border border-slate-200 rounded-xl shadow-xl absolute right-4 top-14 w-40 z-50 overflow-hidden">
//             <ScrollView className="max-h-48">
//               {yearsList.map((year) => (
//                 <TouchableOpacity
//                   key={year}
//                   onPress={() => {
//                     setSelectedYear(year);
//                     setShowYearDropdown(false);
//                   }}
//                   className={`p-3 border-b border-slate-100 items-center active:bg-slate-50 ${
//                     selectedYear === year ? "bg-blue-50/60" : ""
//                   }`}
//                 >
//                   <Text className={`text-sm ${selectedYear === year ? "font-black text-blue-600" : "font-semibold text-slate-700"}`}>
//                     {year}
//                   </Text>
//                 </TouchableOpacity>
//               ))}
//             </ScrollView>
//           </View>
//         )}
//       </View>

//       {/* DASHBOARD SUMMARY CARDS VIEW WRAPPER */}
//       <ScrollView
//         contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
//         className="p-4"
//         showsVerticalScrollIndicator={false}
//       >
//         {/* STATS 2X2 METRIC GRID CONTAINER */}
//         <View className="gap-y-3 mb-6">

//           {/* ROW 1: TOTAL AMOUNT & TOTAL FUNDS */}
//           <View className="flex-row gap-x-3">
//             {/* CARD 1: TOTAL AMOUNT */}
//             <View className="flex-1 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
//               <Text className="text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-1">कुल मद</Text>
//               <Text className="text-lg font-black text-blue-600" numberOfLines={1}>
//                 ₹{dashboardData.metrics.totalAmount.toLocaleString('en-IN')}
//               </Text>
//             </View>

//             {/* CARD 2: TOTAL FUNDS COUNTER */}
//             <View className="flex-1 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
//               <Text className="text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-1">कुल फंड की संख्या</Text>
//               <Text className="text-2xl font-black text-slate-800">
//                 {dashboardData.metrics.totalFundsCount}
//               </Text>
//             </View>
//           </View>

//           {/* ROW 2: TOTAL GRAM PANCHAYATS & TOTAL GRAMS */}
//           <View className="flex-row gap-x-3">
//             {/* CARD 3: TOTAL GRAM PANCHAYAT */}
//             <View className="flex-1 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
//               <Text className="text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-1">कुल आवंटित ग्राम पंचायत</Text>
//               <Text className="text-2xl font-black text-slate-800" numberOfLines={1}>
//                 {dashboardData.metrics.totalGramPanchayatsAllotted}
//               </Text>
//             </View>

//             {/* CARD 4: TOTAL GRAM */}
//             <View className="flex-1 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
//               <Text className="text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-1">कुल आवंटित ग्राम</Text>
//               <Text className="text-2xl font-black text-slate-800" numberOfLines={1}>
//                 {dashboardData.metrics.totalGramsAllotted}
//               </Text>
//             </View>
//           </View>

//         </View>

//         {/* You can render your dynamic filtered records or specific items list lower down here if needed */}

//       </ScrollView>
//     </SafeAreaView>
//   );
// }

import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/auth";

interface FundRecord {
  id: string;
  allocationTime: string;
  workName: string;
  gramPanchayat: { id: string; name: string } | null;
  villageName: string;
  amount: string | number;
  status: string;
}

export default function DashboardPage() {
  const { authToken } = useAuth();
  const currentYear = new Date().getFullYear(); // 2026

  // 1. Filter Context Hooks
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const [showYearDropdown, setShowYearDropdown] = useState<boolean>(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  // Added robust structural initial fallback states
  const [dashboardData, setDashboardData] = useState({
    metrics: {
      pendingFundsCount: 0,
      totalAmount: 0,
      totalFundsCount: 0,
      totalGramPanchayats: 0,
      totalGramPanchayatsAllotted: 0,
      totalGramsAllotted: 0,
    },
    data: [] as FundRecord[],
  });

  // Dynamic Year Array List Generation
  const yearsList = useMemo(() => {
    const list = [];
    for (let i = 0; i < 10; i++) {
      list.push(currentYear - i);
    }
    return list;
  }, [currentYear]);

  // Status Category mapping list
  const statusCategories = [
    { label: "सभी स्थितियां", value: "" },
    { label: "लंबित ", value: "PENDING" },
    { label: "प्रक्रिया में", value: "PROCESS" },
    { label: "स्वीकृत ", value: "APPROVED" },
  ];

  // Core API Service Synchronizer
  useEffect(() => {
    const fetchLedgerData = async () => {
      setLoading(true);
      try {
        let url = `https://panchayat.jyada.in/api/dashboard/?status=${selectedCategory}&year=${selectedYear}`;

        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Server status message error: ${response.status}`);
        }

        const apiResponse = await response.json();
        if (apiResponse.success) {
          setDashboardData({
            metrics: apiResponse.datacount,
            data: apiResponse.data,
          });
        }
      } catch (error) {
        console.error("Fetch Dashboard Error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (authToken) {
      fetchLedgerData();
    }
  }, [authToken, selectedYear, selectedCategory]);

  return (
    <SafeAreaView edges={["left", "right"]} className="flex-1 bg-slate-50">
      {/* DUAL DROPDOWN FILTER MANAGEMENT STRIP */}
      <View className="bg-white px-4 pt-4 pb-2">
        <Text className="text-[17px] font-black text-slate-500 tracking-tight">
          डैशबोर्ड
        </Text>
      </View>
      <View
        className="bg-white p-4 border-b border-slate-200 shadow-sm flex-row gap-x-2 relative z-[100]"
        style={{ zIndex: 100, elevation: 10 }}
      >
        {/* Left Filter Column: Year Select */}
        <View className="flex-1 relative">
          <Text className="text-base font-bold text-slate-400 uppercase tracking-wider mb-1">
            आवंटन वर्ष
          </Text>
          <TouchableOpacity
            onPress={() => {
              setShowYearDropdown(!showYearDropdown);
              setShowStatusDropdown(false);
            }}
            className="bg-blue-50/70 border border-blue-100 px-3 py-2 rounded-xl flex-row justify-between items-center active:bg-blue-100"
          >
            <Text className="text-blue-700 font-bold text-base">
              {selectedYear}
            </Text>
            <Text className="text-blue-500 text-[9px]">▼</Text>
          </TouchableOpacity>

          {/* Modal for Year Dropdown */}
          <Modal
            visible={showYearDropdown}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowYearDropdown(false)}
          >
            <TouchableOpacity
              style={{ flex: 1 }}
              activeOpacity={1}
              onPress={() => setShowYearDropdown(false)}
            >
              <View
                className="absolute bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xl"
                style={{
                  top: 185,
                  left: 16,
                  width: "60%",
                  maxHeight: 200,
                  elevation: 20,
                }}
              >
                <ScrollView
                  nestedScrollEnabled={true}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={true}
                >
                  {yearsList.map((yr) => (
                    <TouchableOpacity
                      key={yr}
                      onPress={() => {
                        setSelectedYear(yr);
                        setShowYearDropdown(false);
                      }}
                      className={`p-3 border-b border-slate-100 items-center ${selectedYear === yr ? "bg-blue-50" : ""}`}
                    >
                      <Text
                        className={`text-xs ${selectedYear === yr ? "font-bold text-blue-600" : "text-slate-700"}`}
                      >
                        {yr}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </TouchableOpacity>
          </Modal>
        </View>

        {/* Right Filter Column: Status Dropdown Selection */}
        <View className="flex-1.5 relative">
          <Text className="text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            कार्य स्थिति फ़िल्टर
          </Text>
          <TouchableOpacity
            onPress={() => {
              setShowStatusDropdown(!showStatusDropdown);
              setShowYearDropdown(false);
            }}
            className="bg-blue-50/70 border border-blue-100 px-3 py-2 rounded-xl flex-row justify-between items-center active:bg-blue-100 mt-1"
          >
            <Text
              className="text-blue-700 font-bold text-base"
              numberOfLines={1}
            >
              {
                statusCategories.find((c) => c.value === selectedCategory)
                  ?.label
              }
            </Text>
            <Text className="text-blue-700 text-[9px]">▼</Text>
          </TouchableOpacity>

          {/* Modal for Status Dropdown */}
          <Modal
            visible={showStatusDropdown}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowStatusDropdown(false)}
          >
            <TouchableOpacity
              style={{ flex: 1 }}
              activeOpacity={1}
              onPress={() => setShowStatusDropdown(false)}
            >
              <View
                className="absolute bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xl"
                style={{
                  top: 185,
                  right: 16,
                  width: "28%",
                  maxHeight: 200,
                  elevation: 20,
                }}
              >
                <ScrollView
                  nestedScrollEnabled={true}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={true}
                >
                  {statusCategories.map((cat) => (
                    <TouchableOpacity
                      key={cat.value}
                      onPress={() => {
                        setSelectedCategory(cat.value);
                        setShowStatusDropdown(false);
                      }}
                      className={`p-3 border-b border-slate-100 ${selectedCategory === cat.value ? "bg-purple-50" : ""}`}
                    >
                      <Text
                        className={`text-[12px] ${selectedCategory === cat.value ? "font-bold text-blue-700" : "text-slate-700"}`}
                      >
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </TouchableOpacity>
          </Modal>
        </View>
      </View>

      {/* DASHBOARD SUMMARY WRAPPER CONTAINER */}
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {loading && (
          <View className="py-4 items-center justify-center">
            <ActivityIndicator size="small" color="#2563EB" />
          </View>
        )}

        {/* 2X2 ANALYTICAL METRICS GRID VIEW FRAME */}
        <View className="p-4 gap-y-3">
          <View className="flex-row gap-x-3">
            <View className="flex-1 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <Text className="text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                कुल ग्राम पंचायत
              </Text>
              <Text className="text-2xl font-black text-slate-800">
                {(
                  dashboardData.metrics?.totalGramPanchayats || 0
                ).toLocaleString("en-IN")}
              </Text>
            </View>

            <View className="flex-1 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <Text className="text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                लंबित मद की संख्या
              </Text>
              <Text className="text-2xl font-black text-slate-800">
                {dashboardData.metrics?.pendingFundsCount || 0}
              </Text>
            </View>
          </View>

          <View className="flex-row gap-x-3">
            <View className="flex-1 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <Text className="text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                कुल मद
              </Text>
              <Text
                className="text-lg font-black text-blue-600"
                numberOfLines={1}
              >
                ₹
                {(dashboardData.metrics?.totalAmount || 0).toLocaleString(
                  "en-IN",
                )}
              </Text>
            </View>

            <View className="flex-1 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <Text className="text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                कुल मद की संख्या
              </Text>
              <Text className="text-2xl font-black text-slate-800">
                {dashboardData.metrics?.totalFundsCount || 0}
              </Text>
            </View>
          </View>

          <View className="flex-row gap-x-3">
            <View className="flex-1 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <Text className="text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                कुल आवंटित ग्राम पंचायत
              </Text>
              <Text
                className="text-2xl font-black text-slate-800"
                numberOfLines={1}
              >
                {dashboardData.metrics?.totalGramPanchayatsAllotted || 0}
              </Text>
            </View>

            <View className="flex-1 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <Text className="text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                कुल आवंटित ग्राम
              </Text>
              <Text
                className="text-2xl font-black text-slate-800"
                numberOfLines={1}
              >
                {dashboardData.metrics?.totalGramsAllotted || 0}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
