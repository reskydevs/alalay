export interface AddressFormProps {
  fromAddress: string;
  toAddress: string;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  searchResults: any[];
  searchLoading: boolean;
  searchError: string | null;
  onSelectSearchResult: (result: any) => void;
}