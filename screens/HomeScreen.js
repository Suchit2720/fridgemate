// screens/HomeScreen.js
import { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Alert, Pressable,
  Animated, Easing, Image, StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  collection, onSnapshot, orderBy, query, deleteDoc, doc
} from 'firebase/firestore';
import { auth, db } from '../src/lib/firebase';
import { globalStyles } from '../components/globalStyles';
import RadiantBackground from '../components/RadiantBackground';
import { LinearGradient } from 'expo-linear-gradient';

const SPOONACULAR_KEY = 'ebce663ea86044a5acc15a0d9b5ae71e';

// Utility: detect URLs like exp:// or https://
const looksLikeUrl = (v) =>
  typeof v === 'string' &&
  (v.startsWith('exp://') || v.startsWith('http://') || v.startsWith('https://'));

export default function HomeScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [showRecipes, setShowRecipes] = useState(false);
  const [onlyInventory, setOnlyInventory] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showRecipeDetails, setShowRecipeDetails] = useState(false);
  const slideAnim = useState(new Animated.Value(0))[0];

  const hasSelection = selectedItems.length > 0;
  const allSelected = items.length > 0 && selectedItems.length === items.length;

  // ---- Delete selected docs ----
  const deleteSelected = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    try {
      await Promise.all(
        selectedItems.map((id) => deleteDoc(doc(db, `users/${uid}/items/${id}`)))
      );
      setSelectedItems([]);
      setDeleteMode(false);
    } catch (e) {
      Alert.alert('Delete error', String(e));
    }
  };

  // ---- Live items (keep manual, drop exp:// / http:// / https://) ----
  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const q = query(collection(db, `users/${uid}/items`), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const rows = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((r) => !looksLikeUrl(r.barcode)); // keep manual items
      setItems(rows);
    });
    return unsub;
  }, []);

  // ---- Header actions ----
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {deleteMode ? (
            <>
              <Text style={{ color: '#fff', marginRight: 8, fontWeight: '600' }}>
                {selectedItems.length} selected
              </Text>
              <Pressable
                onPress={() =>
                  allSelected ? setSelectedItems([]) : setSelectedItems(items.map((i) => i.id))
                }
                hitSlop={10}
                style={{ paddingRight: 12 }}
              >
                <Ionicons
                  name={allSelected ? 'remove-circle-outline' : 'add-circle-outline'}
                  size={22}
                  color="#fff"
                />
              </Pressable>
              <Pressable
                onPress={() => {
                  if (!hasSelection) return Alert.alert('Nothing selected');
                  Alert.alert('Delete items', 'Remove selected items?', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Delete', style: 'destructive', onPress: deleteSelected },
                  ]);
                }}
                hitSlop={10}
                style={{ paddingRight: 12 }}
              >
                <Ionicons name="trash-bin" size={22} color="#fff" />
              </Pressable>
              <Pressable
                onPress={() => {
                  setDeleteMode(false);
                  setSelectedItems([]);
                }}
                hitSlop={10}
              >
                <Ionicons name="close" size={22} color="#fff" />
              </Pressable>
            </>
          ) : (
            <Pressable onPress={() => setDeleteMode(true)} hitSlop={10} style={{ paddingRight: 12 }}>
              <Ionicons name="checkbox-outline" size={22} color="#fff" />
            </Pressable>
          )}
        </View>
      ),
    });
  }, [navigation, deleteMode, hasSelection, selectedItems, allSelected, items]);

  const toggleSelect = (id) => {
    setSelectedItems((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const remove = async (id) => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    try {
      await deleteDoc(doc(db, `users/${uid}/items/${id}`));
    } catch (e) {
      Alert.alert('Delete error', String(e));
    }
  };

  // ---- Recipes (unchanged logic) ----
  const fetchRecipes = async () => {
    if (!items.length) return Alert.alert('No items', 'Add some items to your fridge first!');
    try {
      const ingredientList = items.map((i) => i.name || '').filter(Boolean).join(',');
      if (!ingredientList) return Alert.alert('Missing names', 'Items need names to fetch recipes.');
      const url = onlyInventory
        ? `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${ingredientList}&number=5&apiKey=${SPOONACULAR_KEY}`
        : `https://api.spoonacular.com/recipes/complexSearch?query=${ingredientList}&number=5&apiKey=${SPOONACULAR_KEY}`;
      const res = await fetch(url);
      const data = await res.json();
      setRecipes(data);
      toggleRecipePopup(true);
    } catch {
      Alert.alert('Error', 'Could not fetch recipes');
    }
  };

  const toggleRecipePopup = (show) => {
    setShowRecipes(show);
    Animated.timing(slideAnim, {
      toValue: show ? 1 : 0,
      duration: 400,
      easing: Easing.out(Easing.poly(4)),
      useNativeDriver: true,
    }).start();
  };

  const slideUp = slideAnim.interpolate({ inputRange: [0, 1], outputRange: [300, 0] });

  // ---- CARD RENDER ----
  const renderItem = ({ item }) => {
    const isSelected = selectedItems.includes(item.id);
    const qty = item.exactAmount && item.unit ? `${item.exactAmount} ${item.unit}` : null;

    return (
      <TouchableOpacity
        onPress={() => deleteMode && toggleSelect(item.id)}
        onLongPress={() => {
          if (!deleteMode)
            Alert.alert('Delete', `Remove "${item.name || item.barcode || 'Item'}"?`, [
              { text: 'Cancel' },
              { text: 'Delete', style: 'destructive', onPress: () => remove(item.id) },
            ]);
        }}
        style={[styles.glassCard, isSelected && { borderColor: '#90e4a9', borderWidth: 2 }]}
      >
        <View style={{ flexDirection: 'row' }}>
          <Image
            source={
              item.imageUrl
                ? { uri: item.imageUrl }
                : require('../assets/icon.png')
            }
            style={styles.thumb}
          />
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={styles.itemName}>
                {item.name || (item.barcode ? `Item ${item.barcode}` : 'Unnamed item')}
              </Text>
              {deleteMode && (
                <Ionicons
                  name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
                  size={22}
                  color={isSelected ? '#90e4a9' : '#aaa'}
                />
              )}
            </View>
            {item.barcode ? <Text style={styles.itemMeta}>Barcode: {item.barcode}</Text> : null}
            {qty ? <Text style={styles.itemMeta}>Quantity: {qty}</Text> : null}
            {item.expiration ? (
              <Text style={styles.itemMeta}>Expires: {item.expiration}</Text>
            ) : null}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <RadiantBackground />
      <View style={[globalStyles.container, { alignItems: 'center' }]}>
        <Text style={[globalStyles.title, { marginBottom: 20 }]}>Welcome to FridgeMate</Text>

        <FlatList
          style={{ width: '90%' }}
          data={items}
          keyExtractor={(it) => it.id}
          ListEmptyComponent={<Text style={globalStyles.text}>No items yet.</Text>}
          renderItem={renderItem}
        />

        <TouchableOpacity onPress={fetchRecipes} style={{ width: '90%', marginTop: 10 }}>
          <LinearGradient
            colors={['#90e4a9ff', '#2b934bff']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.addButton}
          >
            <Text style={styles.addButtonText}>Get Recipe Suggestions</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  glassCard: {
    width: '100%',
    padding: 14,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    marginVertical: 6,
    shadowColor: '#101410',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: 10,
    marginRight: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  itemName: { fontSize: 16, fontWeight: '700', color: '#fff', flexShrink: 1, paddingRight: 6 },
  itemMeta: { fontSize: 13, color: '#ffffffbb', marginTop: 3 },
  addButton: { paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  addButtonText: { color: '#fff', fontWeight: '700', fontSize: 18 },
});