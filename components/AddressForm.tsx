import { AddressFormProps } from "@/app/types/AddressFormProps";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function AddressForm({
  fromAddress,
  toAddress,
  searchQuery,
  onSearchQueryChange,
  searchResults,
  searchLoading,
  searchError,
  onSelectSearchResult,
}: AddressFormProps) {
  return (
    <View className="px-4 pt-2">
      <Text className="mb-1 text-xs font-semibold text-gray-500">FROM</Text>
      <View className="px-4 py-3 bg-white rounded-xl border border-gray-300 shadow-sm">
        <Text className="text-base text-gray-700">{fromAddress}</Text>
      </View>

      <Text className="mt-5 mb-1 text-xs font-semibold text-gray-500">TO</Text>
      <TextInput
        className="px-4 py-3 text-base text-gray-800 bg-white rounded-xl border border-gray-300 shadow-sm"
        placeholder="Enter destination..."
        placeholderTextColor="#999"
        value={searchQuery}
        onChangeText={onSearchQueryChange}
        returnKeyType="search"
      />

      {searchLoading && <ActivityIndicator className="my-3" color="#27ae60" />}

      {searchError && (
        <Text className="mt-2 text-sm text-red-500">{searchError}</Text>
      )}

      {searchResults.length > 0 && (
        <FlatList
          className="mt-3 max-h-40 bg-white rounded-xl border border-gray-300 shadow-sm"
          data={searchResults}
          keyExtractor={(_, idx) => idx.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => onSelectSearchResult(item)}
              className="p-4 border-b border-gray-200"
            >
              <Text className="text-sm text-gray-700" numberOfLines={2}>
                {item.display_name}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}

      {searchQuery === "" && (
        <View className="px-4 py-3 mt-3 bg-white rounded-xl border border-gray-300 shadow-sm">
          <Text className="text-base text-gray-700">{toAddress}</Text>
        </View>
      )}
    </View>
  );
}
