import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/auth";

interface GramPanchayat {
  code: null;
  id: number;
  name: string;
  villages: string; // "मनियावदा, सुराखेडी"
}

interface GramPanchayatNested {
  id: number;
  name: string;
  code: string | null;
  wardId: number;
  createdAt: string;
}

interface FundRecord {
  id: number;
  gramPanchayatId: number;
  villageName: string;
  workName: string;
  workDetails: string;
  amount: string;
  status: string;
  address: string;
  allocationTime: string;
  createdAt: string;
  updatedAt: string;
  gramPanchayat: GramPanchayatNested;
}

export default function FundsPage() {
  const { logout, authToken, user } = useAuth();

  const [gpDropdownOpen, setGpDropdownOpen] = useState(false);
  const [gramDropdownOpen, setGramDropdownOpen] = useState(false);
  const [gpDropdownData, setGpDropdownData] = useState<GramPanchayat[]>([]);
  const [funds, setFunds] = useState<FundRecord[]>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Dropdown Pickers local state (temporary until Apply is clicked)
  const [selectedGP, setSelectedGP] = useState<GramPanchayat | null>(null);
  const [selectedGPName, setSelectedGPName] = useState<string>("सभी ग्राम पंचायत");
  const [selectedGram, setSelectedGram] = useState<string>("सभी ग्राम");

  // Filter criteria that actually controls runtime data array visibility
  const [appliedGPId, setAppliedGPId] = useState<number | null>(null);
  const [appliedGram, setAppliedGram] = useState<string>("सभी ग्राम");
  const [expandedFundId, setExpandedFundId] = useState<number | null>(null);
  // Fetching Gram Panchayats master list
  useEffect(() => {
    const fetchAllGPs = async () => {
      let combinedGPs: any[] = [];
      let currentPage = 1;
      let keepFetching = true;
      const MAX_SAFE_PAGES = 50; 

      try {
        while (keepFetching && currentPage <= MAX_SAFE_PAGES) {
          
          const response = await fetch(
            `https://panchayat.jyada.in/api/gram-panchayats?janpadId=1&page=${currentPage}&limit=50`, 
            {
              headers: { "Authorization": `Bearer ${authToken}` }
            }
          );

          if (!response.ok) {
            throw new Error(`API error encountered on page context: ${currentPage}`);
          }

          const json = await response.json();
          
          if (json && json.data && Array.isArray(json.data)) {
            const rows = json.data;
            if (rows.length === 0) {
              keepFetching = false;
            } else {
              combinedGPs = [...combinedGPs, ...rows];
              if (json.totalPages && currentPage >= json.totalPages) {
                keepFetching = false;
              } else {
                currentPage++;
              }
            }
          } else if (Array.isArray(json)) {
            if (json.length === 0) {
              keepFetching = false;
            } else {
              combinedGPs = [...combinedGPs, ...json];
              currentPage++;
            }
          } else {
            keepFetching = false;
          }
        }
        setGpDropdownData(combinedGPs);
      } catch (error) {
        console.error("Failed consolidating paginated third-party api sets:", error);
      }
    };

    if (authToken) fetchAllGPs();
  }, [authToken]);

  // Fetching funds master list
  useEffect(() => { 
    const fetchLedgerData = async () => {
      setIsLoadingData(true);
      setErrorMessage("");

      try {
        let url = "https://panchayat.jyada.in/api/funds";
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authToken}`
          }
        });

        if (!response.ok) {
          throw new Error(`Server returned error status code: ${response.status}`);
        }

        const apiResponse = await response.json();
        const dataArray = Array.isArray(apiResponse) ? apiResponse : apiResponse.data || [];
        setFunds(dataArray);

      } catch (error: any) {
        console.error("Fetch Funds Error Log:", error);
        setErrorMessage("Failed to refresh ledger data.");
      } finally {
        setIsLoadingData(false);
      }
    };

    if (authToken) {
      fetchLedgerData();
    }
  }, [authToken]); 

  // Extract unique Grams/Villages conditionally based on selected Gram Panchayat dropdown state
  const uniqueGramOptions = useMemo(() => {
    if (!selectedGP || !selectedGP.villages) return [];
    return selectedGP.villages.split(",").map(v => v.trim()).filter(Boolean);
  }, [selectedGP]);

  // RUNTIME FILTER COMPLIANCE (Runs purely on applied configurations)
  const filteredFunds = useMemo(() => {
    return funds.filter(item => {
      const matchGP = appliedGPId === null || item.gramPanchayatId === appliedGPId;
      const matchGram = appliedGram === "सभी ग्राम" || item.villageName === appliedGram;
      return matchGP && matchGram;
    });
  }, [funds, appliedGPId, appliedGram]);

  // Click Action Handlers
  const handleApplyFilters = () => {
    setAppliedGPId(selectedGP ? selectedGP.id : null);
    setAppliedGram(selectedGram);
  };

  const handleResetFilters = () => {
    setSelectedGPName("सभी ग्राम पंचायत");
    setSelectedGP(null);
    setSelectedGram("सभी ग्राम");
    setAppliedGPId(null);
    setAppliedGram("सभी ग्राम");
    setGpDropdownOpen(false);
    setGramDropdownOpen(false);
  };

  const formatAllocationTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const day = date.getDate();
      const month = date.toLocaleString('en-US', { month: 'short' });
      const year = date.getFullYear();
      let hours = date.getHours();
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'pm' : 'am';
      hours = hours % 12 || 12;
      return `${day} ${month} ${year}, ${hours}:${minutes} ${ampm}`;
    } catch (e) {
      return isoString;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-100" edges={["top", "left", "right"]}>
    

       <View className="bg-white px-4 pt-4 pb-2">
              <Text className="text-1xl font-black text-slate-500 tracking-tight">मद</Text>
            </View>

      <ScrollView 
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }} 
        className="px-4 pt-4"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* FILTER CARD */}
        <View style={{ zIndex: 40 }} className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm mb-4">
          
          {/* Gram Panchayat Filter */}
          <View className="mb-3.5 relative" style={{ zIndex: 51 }}>
            <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5"> ग्राम पंचायत</Text>
            <TouchableOpacity 
              onPress={() => { setGpDropdownOpen(!gpDropdownOpen); setGramDropdownOpen(false); }} 
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 flex-row justify-between items-center active:bg-slate-50"
            >
              <Text className="text-xs font-bold text-slate-800">{selectedGPName}</Text>
              <Text className="text-slate-400 text-[10px]">▼</Text>
            </TouchableOpacity>

            {gpDropdownOpen && (
              <View className="absolute top-[64px] left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-xl z-50 max-h-48 overflow-y-scroll">
                {/* Default Choice option to clear GP dropdown picking */}
                <TouchableOpacity 
                  onPress={() => {
                    setSelectedGP(null);
                    setSelectedGPName("सभी ग्राम पंचायत");
                    setSelectedGram("सभी ग्राम");
                    setGpDropdownOpen(false);
                  }}
                  className="px-3 py-2.5 border-b border-slate-50 active:bg-slate-50"
                >
                  <Text className="text-xs text-blue-600 font-bold">सभी ग्राम पंचायत</Text>
                </TouchableOpacity>

                {gpDropdownData.map((gpName) => (
                  <TouchableOpacity 
                    key={gpName?.id} 
                    onPress={() => {
                      setSelectedGP(gpName);
                      setSelectedGPName(gpName?.name);
                      setSelectedGram("सभी ग्राम"); 
                      setGpDropdownOpen(false);
                    }} 
                    className="px-3 py-2.5 border-b border-slate-50 active:bg-slate-50"
                  >
                    <Text className="text-xs text-slate-700 font-semibold">{gpName?.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Gram / Village Filter */}
          <View className="mb-4 relative" style={{ zIndex: 49 }}>
            <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5"> ग्राम</Text>
            <TouchableOpacity 
              onPress={() => { setGramDropdownOpen(!gramDropdownOpen); setGpDropdownOpen(false); }} 
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 flex-row justify-between items-center active:bg-slate-50"
            >
              <Text className="text-xs font-bold text-slate-800">{selectedGram}</Text>
              <Text className="text-slate-400 text-[10px]">▼</Text>
            </TouchableOpacity>

            {gramDropdownOpen && (
              <View className="absolute top-[64px] left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-xl z-50 max-h-48 overflow-y-scroll">
                <TouchableOpacity 
                  onPress={() => {
                    setSelectedGram("सभी ग्राम ");
                    setGramDropdownOpen(false);
                  }}
                  className="px-3 py-2.5 border-b border-slate-50 active:bg-slate-50"
                >
                  <Text className="text-xs text-blue-600 font-bold">सभी ग्राम</Text>
                </TouchableOpacity>

                {uniqueGramOptions.map((gramName) => (
                  <TouchableOpacity 
                    key={gramName} 
                    onPress={() => {
                      setSelectedGram(gramName);
                      setGramDropdownOpen(false);
                    }} 
                    className="px-3 py-2.5 border-b border-slate-50 active:bg-slate-50"
                  >
                    <Text className="text-xs text-slate-700 font-semibold">{gramName}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Actions */}
          <View className="flex-row gap-x-3">
            <TouchableOpacity 
              onPress={handleApplyFilters}
              className="flex-1 bg-blue-600 py-2.5 rounded-lg items-center justify-center shadow-md shadow-blue-600/10 active:opacity-90"
            >
              <Text className="text-white font-bold text-xs tracking-wide">लागू करना</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={handleResetFilters}
              className="flex-1 bg-slate-50 border border-slate-200 py-2.5 rounded-lg items-center justify-center active:bg-slate-100"
            >
              <Text className="text-slate-700 font-bold text-xs tracking-wide">फ़िल्टर हटाएं</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* RESULTS METRIC SUB-HEADER */}
        <View className="flex-row justify-between items-center mb-3 px-1">
          <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            मद
          </Text>
        </View>

        {/* DYNAMIC CARDS LIST CONTAINER */}
        <View className="gap-y-3">
          {isLoadingData ? (
            <View className="bg-white rounded-xl p-12 justify-center items-center border border-slate-200">
              <ActivityIndicator size="small" color="#2563eb" />
            </View>
          ) : filteredFunds.length > 0 ? (
          filteredFunds.map((fund) => {
      const isExpanded = expandedFundId === fund.id;

      return (
        <View 
          key={fund.id} 
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm gap-y-3"
        >
          {/* UPPER ROW: WORK NAME & STATUS */}
          <View className="flex-row justify-between items-start">
            <View className="flex-1 pr-2">
              <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">कार्य</Text>
              <Text className="text-base font-bold text-slate-900 leading-tight">{fund.workName}</Text>
            </View>
            
            <View>
              <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 text-right">कार्य की स्थिति</Text>
              <View className={`px-2.5 py-1 rounded ${
                fund.status === 'APPROVED' ? 'bg-emerald-50' : fund.status === 'PENDING' ? 'bg-amber-50' : 'bg-slate-100'
              }`}>
                <Text className={`text-[10px] font-black tracking-wider ${
                  fund.status === 'APPROVED' ? 'text-emerald-600' : fund.status === 'PENDING' ? 'text-amber-600' : 'text-slate-500'
                }`}>{fund.status}</Text>
              </View>
            </View>
          </View>

          {/* MIDDLE ROW: JURISDICTION (GP & GRAM) */}
          <View className="flex-row gap-x-4 border-t border-slate-100 pt-2.5">
            <View className="flex-1">
              <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">ग्राम पंचायत</Text>
              <Text className="text-xs font-semibold text-slate-700">{fund.gramPanchayat?.name || "N/A"}</Text>
            </View>

            <View className="flex-1">
              <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">ग्राम</Text>
              <Text className="text-xs font-semibold text-slate-700">{fund.villageName}</Text>
            </View>
          </View>

          {/* BOTTOM ROW: AMOUNT & TIME / HIDE BUTTON ON EXPAND */}
          <View className="flex-row items-end justify-between border-t border-slate-100 pt-3 mt-1">
            <View>
              <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">मद</Text>
              <Text className="text-lg font-black text-blue-600">
                ₹ {parseFloat(fund.amount).toLocaleString('en-IN')}
              </Text>
              <Text className="text-[10px] font-medium text-slate-400 mt-1">
                आवंटन का समय: {formatAllocationTime(fund.allocationTime)}
              </Text>
            </View>

            {/* BUTTON SHOWN ONLY IF CARD IS NOT EXPANDED */}
            {!isExpanded ? (
              <TouchableOpacity 
                onPress={() => setExpandedFundId(fund.id)}
                className="bg-blue-50 border border-blue-100 px-4 py-1.5 rounded-lg active:bg-blue-100"
              >
                <Text className="text-blue-600 font-bold text-xs">विवरण</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {/* DYNAMIC EXTRA DETAILS SECTION (SHOWS AT THE BOTTOM ON CLICK) */}
          {isExpanded ? (
            <View className="border-t border-dashed border-slate-200 pt-3 mt-1 gap-y-3">
              
              {/* WORK DETAILS */}
              <View>
                <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">कार्य का विवरण</Text>
                <Text className="text-xs font-medium text-slate-600 leading-relaxed bg-slate-50 border border-slate-100 p-2.5 rounded-lg">
                  {fund.workDetails || "No detailed description provided."}
                </Text>
              </View>

              {/* ADDRESS */}
              <View>
                <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">पता</Text>
                <Text className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-100 p-2.5 rounded-lg">
                  {fund.address || "N/A"}
                </Text>
              </View>

              {/* HIDE DETAILS BUTTON (OPTIONAL: TO CLOSE THE CARD BACK) */}
              <TouchableOpacity 
                onPress={() => setExpandedFundId(null)}
                className="bg-slate-100 border border-slate-200 py-1.5 rounded-lg items-center justify-center mt-1 active:bg-slate-200"
              >
                <Text className="text-slate-600 font-bold text-[11px]">विवरण छुपाएं </Text>
              </TouchableOpacity>

            </View>
          ) : null}

        </View>
      );
    })
          ) : (
            <View className="bg-white rounded-xl py-12 items-center justify-center border border-slate-200">
              <Text className="text-xs font-semibold text-slate-400">No active allocations match this criteria.</Text>
            </View>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}