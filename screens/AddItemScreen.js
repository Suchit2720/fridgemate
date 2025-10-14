import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';

export default function AddItemScreen({ navigation }) {
  const [item, setItem] = useState('');

  const addItem = () => {
    if (item.trim() === '') {
      Alert.alert('Please enter an item name');
      return;
    }
    Alert.alert('Item added!', `You added: ${item}`);
    setItem('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add New Item</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter item name"
        value={item}
        onChangeText={setItem}
      />
      <Button title="Add Item" onPress={addItem} />
      <Button title="Go Back" onPress={() => navigation.goBack()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    width: '80%',
    padding: 10,
    marginBottom: 20,
    borderRadius: 8,
  },
});
