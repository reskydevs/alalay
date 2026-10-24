import axios from "axios";

export const searchLocation = async (query: string) => {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5`;
  const response = await axios.get(url, {
    headers: { "Accept-Language": "en" },
  });
  return response.data;
};