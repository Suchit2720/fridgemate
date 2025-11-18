import { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  Pressable,
  Animated,
  Easing,
  Image,
  ScrollView,
  StyleSheet,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, onSnapshot, orderBy, query, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../src/lib/firebase';
import { globalStyles } from '../components/globalStyles';
import { LinearGradient } from 'expo-linear-gradient';
import { Video } from 'expo-av'; // ✅ replaced expo-video with expo-av

const stripHtml = (html) => html.replace(/<[^>]*>?/gm, '');
const SPOONACULAR_KEY = 'ebce663ea86044a5acc15a0d9b5ae71e';

export default function HomeScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [showRecipes, setShowRecipes] = useState(false);
  const [onlyInventory, setOnlyInventory] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showRecipeDetails, setShowRecipeDetails] = useState(false);
  const slideAnim = useState(new Animated.Value(0))[0];

  const hasSelection = selectedItems.length > 0;
  const allSelected = items.length > 0 && selectedItems.length === items.length;

  // ---- FETCH ITEMS FROM FIREBASE ----
  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const q = query(collection(db, `users/${uid}/items`), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return unsub;
  }, []);

  // ---- HEADER BUTTON ----
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {deleteMode ? (
            <>
              <Text style={styles.headerText}>{selectedItems.length} selected</Text>

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
            <Pressable
              onPress={() => setDeleteMode(true)}
              hitSlop={10}
              style={{ paddingRight: 12 }}
            >
              <Ionicons name="checkbox-outline" size={22} color="#fff" />
            </Pressable>
          )}
        </View>
      ),
    });
  }, [navigation, deleteMode, hasSelection, selectedItems, allSelected, items]);

  // ---- REFRESH RECIPES WHEN TOGGLE CHANGES ----
  useEffect(() => {
    if (showRecipes) fetchRecipes();
  }, [onlyInventory]);

  // ---- DELETE SELECTED ITEMS ----
  const deleteSelected = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    try {
      for (const id of selectedItems) {
        await deleteDoc(doc(db, `users/${uid}/items/${id}`));
      }
      setSelectedItems([]);
      setDeleteMode(false);
    } catch (e) {
      Alert.alert('Delete error', String(e));
    }
  };

  const toggleSelect = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
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

  // ---- FETCH RECIPES ----
  const fetchRecipes = async () => {
    try {
      const uid = auth.currentUser?.uid;
      let prefs = { dietary: {}, cuisine: {} };

      if (uid) {
        const docSnap = await getDoc(doc(db, 'users', uid));
        if (docSnap.exists() && docSnap.data().preferences) {
          prefs = docSnap.data().preferences;
        }
      }

      const singularMap = {
        tomatoes: 'tomato', onions: 'onion', potatoes: 'potato', carrots: 'carrot',
        peppers: 'pepper', mushrooms: 'mushroom', cucumbers: 'cucumber', zucchinis: 'zucchini',
        spinach: 'spinach', lettuces: 'lettuce', kale: 'kale', broccoli: 'broccoli',
        cauliflowers: 'cauliflower', garlics: 'garlic', chilies: 'chili', cabbages: 'cabbage',
        radishes: 'radish', beets: 'beet', turnips: 'turnip', eggplants: 'eggplant',
        peas: 'pea', corn: 'corn', pumpkin: 'pumpkin', apples: 'apple', bananas: 'banana',
        oranges: 'orange', lemons: 'lemon', limes: 'lime', grapes: 'grape', berries: 'berry',
        honey: 'honey', eggs: 'egg', milks: 'milk', cheeses: 'cheese', butters: 'butter',
        yogurts: 'yogurt', meats: 'meat', chicken: 'chicken', beefs: 'beef', porks: 'pork',
        fish: 'fish', tunas: 'tuna', shrimps: 'shrimp', rices: 'rice', pastas: 'pasta',
        oils: 'oil', spices: 'spice', sugars: 'sugar', salts: 'salt', teas: 'tea',
        coffees: 'coffee', nuts: 'nut', beans: 'bean', breads: 'bread',
      };

      const cleanIngredient = (name) =>
        name.toLowerCase().trim().replace(/[^a-zA-Z\s]/g, '').replace(/\s+/g, ' ');

      const ingredientList = items
        .map((i) => singularMap[i.name.toLowerCase().trim()] || cleanIngredient(i.name))
        .map(encodeURIComponent)
        .join(',');

      let url = `https://api.spoonacular.com/recipes/complexSearch?number=20&addRecipeInformation=true&apiKey=${SPOONACULAR_KEY}`;

      const preferredCuisines = Object.keys(prefs.cuisine || {}).filter((k) => prefs.cuisine[k]);

      if (onlyInventory && items.length > 0) {
        url += `&includeIngredients=${ingredientList}&ignorePantry=true`;
      } else if (preferredCuisines.length > 0) {
        url += `&cuisine=${preferredCuisines.join(',')}`;
      } else {
        url += `&query=easy`;
      }

      let fetchedRecipes = [];

      try {
        const res = await fetch(url);
        const data = await res.json();
        fetchedRecipes = data.results || [];

        if (prefs.dietary) {
          fetchedRecipes = fetchedRecipes.filter((r) => {
            if (prefs.dietary.vegan && !r.vegan) return false;
            if (prefs.dietary.glutenFree && !r.glutenFree) return false;
            if (prefs.dietary.dairyFree && !r.dairyFree) return false;
            return true;
          });
        }
      } catch (err) {
        console.log('API fail:', err);
      }

      if (!fetchedRecipes.length) {
        fetchedRecipes = [
          {
            id: 101,
            title: 'Blueberry Muffins',
            image: 'https://images.unsplash.com/photo-1563805042-7684f65e2f6e?auto=format&fit=crop&w=400&q=80',
            extendedIngredients: [
              { name: 'flour', amount: 2, unit: 'cups' },
              { name: 'sugar', amount: 1, unit: 'cup' },
              { name: 'butter', amount: 0.5, unit: 'cup' },
              { name: 'milk', amount: 1, unit: 'cup' },
              { name: 'blueberries', amount: 1, unit: 'cup' },
              { name: 'egg', amount: 2, unit: 'pcs' },
            ],
            instructions: '1. Preheat oven to 375°F.\n2. Mix flour and sugar.\n3. Add butter, milk, eggs.\n4. Fold blueberries.\n5. Bake 20–25 min.',
          },
          {
            id: 102,
            title: 'Pancakes',
            image: 'https://images.unsplash.com/photo-1584270354949-3a6eaccd37e4?auto=format&fit=crop&w=400&q=80',
            extendedIngredients: [
              { name: 'flour', amount: 1.5, unit: 'cups' },
              { name: 'milk', amount: 1.25, unit: 'cups' },
              { name: 'egg', amount: 1, unit: 'pcs' },
              { name: 'butter', amount: 3, unit: 'tbsp' },
              { name: 'sugar', amount: 2, unit: 'tbsp' },
              { name: 'baking powder', amount: 1, unit: 'tbsp' },
            ],
            instructions: '1. Mix dry ingredients.\n2. Add milk, egg, butter.\n3. Cook until golden.',
          },
        ];
      }

      fetchedRecipes = fetchedRecipes.map((r) => ({
        ...r,
        image: r.image || 'https://via.placeholder.com/60',
      }));

      setRecipes(fetchedRecipes);
      toggleRecipePopup(true);
    } catch (e) {
      Alert.alert('Error', 'Could not load recipes.');
    }
  };

  // ---- OPEN/CLOSE RECIPE POPUP ----
  const toggleRecipePopup = (show) => {
    setShowRecipes(show);
    Animated.timing(slideAnim, {
      toValue: show ? 1 : 0,
      duration: 400,
      easing: Easing.out(Easing.poly(4)),
      useNativeDriver: true,
    }).start();
  };

  // ---- RECIPE DETAILS ----
  const fetchRecipeDetails = async (id) => {
    try {
      const url = `https://api.spoonacular.com/recipes/${id}/information?includeNutrition=false&apiKey=${SPOONACULAR_KEY}`;
      const res = await fetch(url);
      const data = await res.json();
      if (!data) return Alert.alert('Error', 'No recipe details.');
      setSelectedRecipe(data);
      setShowRecipeDetails(true);
    } catch (e) {
      Alert.alert('Error', 'Could not load recipe details.');
    }
  };

  const closeRecipeDetails = () => {
    setShowRecipeDetails(false);
    setSelectedRecipe(null);
  };

  const slideUp = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [300, 0],
  });

  const renderItem = ({ item }) => {
    const isSelected = selectedItems.includes(item.id);
    const displayAmount = item.exactAmount ? `${item.exactAmount} ${item.unit}` : '';

    return (
      <TouchableOpacity
        onPress={() => deleteMode && toggleSelect(item.id)}
        onLongPress={() => {
          if (!deleteMode)
            Alert.alert('Delete', `Remove "${item.name}"?`, [
              { text: 'Cancel' },
              { text: 'Delete', style: 'destructive', onPress: () => remove(item.id) },
            ]);
        }}
        style={[styles.glassCard, isSelected && { borderColor: '#90e4a9', borderWidth: 2 }]}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={styles.itemName}>{item.name}</Text>
          {deleteMode && (
            <Ionicons
              name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
              size={22}
              color={isSelected ? '#90e4a9' : '#aaa'}
            />
          )}
        </View>

        {displayAmount ? <Text style={styles.itemDetail}>Quantity: {displayAmount}</Text> : null}
        {item.expiration ? <Text style={styles.itemDetail}>Expires: {item.expiration}</Text> : null}
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <Video
        source={require('../assets/background2.mp4')}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
        shouldPlay
        isLooping
        isMuted
      />

      <View style={[globalStyles.container, { alignItems: 'center' }]}>
<Text
  style={[
    globalStyles.title,
    {
      marginBottom: 20,
      fontFamily: 'Avenir',
      color: '#ffffffff',         // Text color
      textShadowColor: '#0000009b',  // Shadow color
      textShadowOffset: { width: 2, height: 2 }, // Shadow position
      textShadowRadius: 4,      // Blur radius
    }
  ]}
>
  Welcome to FridgeMate
</Text>

        <FlatList
          style={{ width: '90%' }}
          data={items}
          keyExtractor={(it) => it.id}
          ListEmptyComponent={<Text style={[globalStyles.text, { fontFamily: 'Avenir' }]}>No items yet.</Text>}
          renderItem={renderItem}
        />

<TouchableOpacity onPress={fetchRecipes} style={{ width: '90%', marginTop: 10 }}>
  <View
    style={{
      borderRadius: 14, // match your button's borderRadius
      shadowColor: '#000', // shadow color
      shadowOffset: { width: 0, height: 4 }, // shadow position
      shadowOpacity: 0.3, // shadow opacity
      shadowRadius: 6, // blur
      elevation: 8, // Android shadow
    }}
  >
    <LinearGradient
      colors={['#c0ff91ff', '#2b934bff']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.addButton}
    >
      <Text style={styles.addButtonText}>Get Recipe Suggestions</Text>
    </LinearGradient>
  </View>
</TouchableOpacity>
      </View>

      {/* ---- POPUPS ---- */}
      {showRecipes && (
        <Animated.View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 350,
            backgroundColor: '#000000cc',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: 16,
            transform: [{ translateY: slideUp }],
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <Text style={styles.popupTitle}>Recipe Suggestions</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.popupLabel}>Only Inventory</Text>
              <Switch
                value={onlyInventory}
                onValueChange={setOnlyInventory}
                trackColor={{ false: '#767577', true: '#2b934b' }}
                thumbColor={onlyInventory ? '#90e4a9' : '#f4f3f4'}
              />
            </View>
          </View>

          <ScrollView>
            {recipes.map((r) => (
              <TouchableOpacity
                key={r.id}
                style={{ flexDirection: 'row', marginBottom: 12, alignItems: 'center' }}
                onPress={() => fetchRecipeDetails(r.id)}
              >
                <Image
                  source={{ uri: r.image }}
                  style={{ width: 60, height: 60, borderRadius: 8, marginRight: 12 }}
                />
                <Text style={styles.recipeTitle}>{r.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Pressable onPress={() => toggleRecipePopup(false)} style={{ position: 'absolute', top: 8, right: 16 }}>
            <Ionicons name="close-circle" size={28} color="#fff" />
          </Pressable>
        </Animated.View>
      )}

      {showRecipeDetails && selectedRecipe && (
        <View style={{ position: 'absolute', top: 50, left: 20, right: 20, bottom: 50, backgroundColor: '#000000ee', borderRadius: 20, padding: 16 }}>
          <ScrollView>
            <Text style={styles.recipeDetailTitle}>{selectedRecipe.title}</Text>
            <Image source={{ uri: selectedRecipe.image }} style={{ width: '100%', height: 200, borderRadius: 12, marginBottom: 12 }} />
            <Text style={styles.recipeDetailLabel}>Instructions:</Text>
            <Text style={styles.recipeDetailText}>
              {selectedRecipe.instructions ? stripHtml(selectedRecipe.instructions) : 'No instructions available.'}
            </Text>
            <Pressable onPress={closeRecipeDetails} style={{ alignSelf: 'center', marginTop: 8 }}>
              <Ionicons name="close-circle" size={28} color="#fff" />
            </Pressable>
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headerText: { color: '#fff', marginRight: 8, fontWeight: '600', fontFamily: 'Avenir' },
  glassCard: {
    width: '100%',
    padding: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(48, 96, 53, 0.27)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    marginVertical: 6,
    shadowColor: '#101410',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  itemName: { fontSize: 16, fontWeight: '700', color: '#fff', fontFamily: 'Avenir' },
  itemDetail: { fontSize: 14, color: '#ffffffbb', marginTop: 4, fontFamily: 'Avenir' },
  addButton: { paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  addButtonText: { color: '#fff', fontWeight: '700', fontSize: 18, fontFamily: 'Avenir' },
  popupTitle: { color: '#fff', fontSize: 18, fontWeight: '700', fontFamily: 'Avenir' },
  popupLabel: { color: '#fff', fontSize: 14, marginRight: 8, fontFamily: 'Avenir' },
  recipeTitle: { color: '#fff', fontSize: 16, fontFamily: 'Avenir', fontWeight: '600' },
  recipeDetailTitle: { color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 8, fontFamily: 'Avenir' },
  recipeDetailLabel: { color: '#fff', fontWeight: '600', marginBottom: 4, fontFamily: 'Avenir' },
  recipeDetailText: { color: '#fff', marginBottom: 12, fontFamily: 'Avenir' },
});
