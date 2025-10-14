import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';

export default function DeleteItemScreen({ navigation }) {
  const [item, setItem] = useState('');

  const deleteItem = () => {
    if (item.trim() === '') {
      Alert.alert('Please enter an item name');
      return;
    }
    Alert.alert('Item deleted!', `You deleted: ${item}`);
    setItem('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Delete Item</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter item name to delete"
        value={item}
        onChangeText={setItem}
      />
      <Button title="Delete Item" color="red" onPress={deleteItem} />
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
