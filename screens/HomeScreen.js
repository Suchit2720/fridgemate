import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to FridgeMate </Text>

      <Button
        title="Add Item"
        onPress={() => navigation.navigate('AddItem')}
      />

      <Button
        title="Delete Item"
        color="red"
        onPress={() => navigation.navigate('DeleteItem')}
      />

      <Button
        title="Scan Barcode"
        onPress={() => navigation.navigate('BarcodeScanner')}
      />

      <Button
        title="Notifications"
        onPress={() => navigation.navigate('Notifications')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
});
