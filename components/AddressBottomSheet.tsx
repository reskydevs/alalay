import React, { useCallback, useMemo, useRef } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import AddressForm from "./AddressForm";

interface AddressBottomSheetProps {
  fromAddress: string;
  toAddress: string;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  searchResults: any[];
  searchLoading: boolean;
  searchError: string | null;
  onSelectSearchResult: (result: any) => void;
  onSetDestination: () => void;
}

export default function AddressBottomSheet({
  fromAddress,
  toAddress,
  searchQuery,
  onSearchQueryChange,
  searchResults,
  searchLoading,
  searchError,
  onSelectSearchResult,
  onSetDestination,
}: AddressBottomSheetProps) {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["50%", "90%"], []);

  const handleSheetChanges = useCallback((index: number) => {
    console.log("Sheet index changed to:", index);
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <TouchableOpacity
        style={styles.openButton}
        onPress={() => bottomSheetRef.current?.expand()}
      >
        <Text style={styles.openButtonText}>Open Address Form</Text>
      </TouchableOpacity>

      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        onChange={handleSheetChanges}
        backgroundStyle={styles.bottomSheetBackground}
      >
        <BottomSheetView style={styles.sheetWrapper}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <AddressForm
              fromAddress={fromAddress}
              toAddress={toAddress}
              searchQuery={searchQuery}
              onSearchQueryChange={onSearchQueryChange}
              searchResults={searchResults}
              searchLoading={searchLoading}
              searchError={searchError}
              onSelectSearchResult={onSelectSearchResult}
            />

            <View style={styles.setButtonWrapper}>
              <TouchableOpacity
                style={styles.setButton}
                onPress={() => {
                  onSetDestination();
                  bottomSheetRef.current?.close();
                }}
              >
                <Text style={styles.setButtonText}>Set Destination</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </BottomSheetView>
      </BottomSheet>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flex: 1,
  },
  bottomSheetBackground: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  sheetWrapper: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 48, // leave space for final button
  },
  setButtonWrapper: {
    marginTop: 16,
    marginBottom: 40,
  },
  setButton: {
    backgroundColor: "#000",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  setButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  openButton: {
    alignItems: "center",
    paddingVertical: 16,
    marginHorizontal: 20,
    marginVertical: 12,
    backgroundColor: "#000",
    borderRadius: 12,
  },
  openButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
});
