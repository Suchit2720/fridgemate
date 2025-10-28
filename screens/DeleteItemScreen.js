// screens/DeleteItemScreen.js
import { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { collection, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
import { auth, db } from '../src/lib/firebase';
import { globalStyles } from '../components/globalStyles';
import RadiantBackground from '../components/RadiantBackground';

export default function DeleteItemScreen({ navigation }) {
  const [item, setItem] = useState('');

  const deleteItem = async () => {
    const name = item.trim();
    if (!name) return Alert.alert('Please enter an item name');

    const uid = auth.currentUser?.uid;
    if (!uid) return Alert.alert('You must be signed in');

    try {
      const q = query(collection(db, `users/${uid}/items`), where('name', '==', name));
      const snap = await getDocs(q);
      if (snap.empty) return Alert.alert('Not found', `No item named "${name}"`);

      // delete all matches (change to snap.docs[0] if you want only the first)
      await Promise.all(
        snap.docs.map(d => deleteDoc(doc(db, `users/${uid}/items/${d.id}`)))
      );

      Alert.alert('Deleted', `Removed "${name}"`);
      setItem('');
    } catch (e) {
      Alert.alert('Error', String(e));
    }
  };

  return (
<View style={{ flex: 1 }}>
  <RadiantBackground />
  <View style={[globalStyles.container, globalStyles.background]}>
    {/* ...existing content... */}
  </View>
  <View style={[globalStyles.container, globalStyles.background]}>
    <Text style={globalStyles.title}>Delete Item</Text>
    <TextInput
      style={{
        borderWidth: 1,
        borderColor: '#ccc',
        width: '80%',
        padding: 10,
        marginBottom: 20,
        borderRadius: 8,
      }}
      placeholder="Enter exact item name"
      value={item}
      onChangeText={setItem}
    />
    <View style={globalStyles.buttons}>
      <Button title="Delete Item" color="red" onPress={deleteItem} />
      <Button title="Go Back" onPress={() => navigation.goBack()} />
    </View>
  </View>
</View>
  );
}