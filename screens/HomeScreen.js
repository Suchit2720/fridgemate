// screens/HomeScreen.js
import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { collection, onSnapshot, orderBy, query, deleteDoc, doc } from 'firebase/firestore';
import { auth, db } from '../src/lib/firebase';
import { globalStyles } from '../components/globalStyles';
import RadiantBackground from '../components/RadiantBackground';

export default function HomeScreen({ navigation }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const q = query(
      collection(db, `users/${uid}/items`),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(q, (snap) => {
      const rows = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setItems(rows);
    });

    return unsub;
  }, []);

  const remove = async (id) => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    try {
      await deleteDoc(doc(db, `users/${uid}/items/${id}`));
    } catch (e) {
      Alert.alert('Delete error', String(e));
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* 🌈 Animated glowing background (edge-to-edge, behind content) */}
      <RadiantBackground />

      <View style={[globalStyles.container, globalStyles.background]}>
        <Text style={globalStyles.title}>Welcome to FridgeMate</Text>

        <FlatList
          style={{ width: '90%' }}
          data={items}
          keyExtractor={(it) => it.id}
          ListEmptyComponent={<Text style={globalStyles.text}>No items yet.</Text>}
          renderItem={({ item }) => (
            <TouchableOpacity
              onLongPress={() =>
                Alert.alert('Delete', `Remove "${item.name}"?`, [
                  { text: 'Cancel' },
                  { text: 'Delete', style: 'destructive', onPress: () => remove(item.id) },
                ])
              }
              style={{
                padding: 14,
                marginVertical: 6,
                borderRadius: 10,
                backgroundColor: '#fff',
                width: '100%',
                // iOS shadow + Android elevation
                shadowColor: '#000',
                shadowOpacity: 0.08,
                shadowRadius: 6,
                shadowOffset: { width: 0, height: 2 },
                elevation: 2,
              }}
            >
              <Text style={{ fontSize: 16 }}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </View>
  );
}


