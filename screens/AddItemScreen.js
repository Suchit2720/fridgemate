import { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../src/lib/firebase';
import { globalStyles } from '../components/globalStyles';
import RadiantBackground from '../components/RadiantBackground'; 

export default function AddItemScreen({ navigation }) {
  const [item, setItem] = useState('');

  const addItem = async () => {
    const name = item.trim();
    if (!name) return Alert.alert('Please enter an item name');

    const uid = auth.currentUser?.uid;
    if (!uid) return Alert.alert('You must be signed in');

    try {
      await addDoc(collection(db, `users/${uid}/items`), {
        name,
        createdAt: serverTimestamp(),
      });
      Alert.alert('✅ Item Added!', `You added: ${name}`);
      setItem('');
    } catch (error) {
      console.error(error);
      Alert.alert('❌ Error adding item', error.message);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* 🌈 Radiant animated background */}
      <RadiantBackground />

      <View style={[globalStyles.container, globalStyles.background]}>
        <Text style={globalStyles.title}>Add New Item</Text>

        <TextInput
          style={{
            borderWidth: 1,
            borderColor: '#ccc',
            width: '80%',
            padding: 10,
            marginBottom: 20,
            borderRadius: 8,
            backgroundColor: '#fff',
          }}
          placeholder="Enter item name"
          value={item}
          onChangeText={setItem}
        />

        <View style={globalStyles.buttons}>
          <Button title="Add Item" onPress={addItem} />
          <Button title="Go Back" onPress={() => navigation.goBack()} />
        </View>
      </View>
    </View>
  );
}