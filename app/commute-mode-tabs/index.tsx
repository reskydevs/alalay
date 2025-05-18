// Commute Mode main screen: handles upper tab selector and renders the selected tab
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import IDCardTab from "./IDCardTab";
import PUVTab from "./PUVTab";
import TransitTab from "./TransitTab";
import VoicePromptsTab from "./VoicePromptsTab";


const TABS = ["PUV", "Transit", "Voice Prompts", "ID Card"];

export default function CommuteModeScreen() {
  const [selectedTab, setSelectedTab] = useState("PUV");

  let Content;
  switch (selectedTab) {
    case "PUV":
      Content = <PUVTab />;
      break;
    case "Transit":
      Content = <TransitTab />;
      break;
    case "Voice Prompts":
      Content = <VoicePromptsTab />;
      break;
    case "ID Card":
      Content = <IDCardTab />;
      break;
    default:
      Content = null;
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.tabSelector}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              selectedTab === tab ? styles.activeTab : styles.inactiveTab,
            ]}
            onPress={() => setSelectedTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === tab ? styles.activeText : styles.inactiveText,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={{ flex: 1 }}>{Content}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabSelector: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
    marginBottom: 10,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginHorizontal: 5,
  },
  activeTab: {
    backgroundColor: "#222",
  },
  inactiveTab: {
    backgroundColor: "#eee",
  },
  tabText: {
    fontWeight: "bold",
  },
  activeText: {
    color: "#fff",
  },
  inactiveText: {
    color: "#888",
  },
});
