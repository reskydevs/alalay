import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function InstructionsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Instructions</Text>
      <Text style={styles.text}>How to use ParaPo! will be shown here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  text: { fontSize: 16, color: '#444', textAlign: 'center', paddingHorizontal: 24 },
});
