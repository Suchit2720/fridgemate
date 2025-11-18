// screens/PreferencesScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  StyleSheet,
} from "react-native";
import { auth, db } from "../src/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Video } from "expo-av";

export default function PreferencesScreen({ navigation }) {
  const [dietary, setDietary] = useState({
    lowCalorie: false,
    vegan: false,
    glutenFree: false,
    dairyFree: false,
  });

  const [cuisine, setCuisine] = useState({
    mexican: false,
    italian: false,
    indian: false,
    japanese: false,
    chinese: false,
    american: false,
    german: false,
  });

  useEffect(() => {
    const loadPrefs = async () => {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      const docRef = doc(db, "users", uid);
      const snap = await getDoc(docRef);

      if (snap.exists() && snap.data().preferences) {
        const p = snap.data().preferences;
        setDietary(p.dietary || dietary);
        setCuisine(p.cuisine || cuisine);
      }
    };

    loadPrefs();
  }, []);

  const toggleDietary = (key) =>
    setDietary({ ...dietary, [key]: !dietary[key] });

  const toggleCuisine = (key) =>
    setCuisine({ ...cuisine, [key]: !cuisine[key] });

  const savePreferences = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    await updateDoc(doc(db, "users", uid), {
      preferences: { dietary, cuisine },
    });

    navigation.goBack();
  };

  const renderSwitch = (label, value, onToggle) => (
    <View style={styles.row}>
      <Text style={styles.option}>{label}</Text>
      <Switch value={value} onValueChange={onToggle} />
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      {/* Full-screen looping video background */}
      <Video
        source={require("../assets/background.mp4")} // replace with your video
        rate={1.0}
        volume={0}
        isMuted={true}
        resizeMode="cover"
        shouldPlay
        isLooping
        style={StyleSheet.absoluteFill}
      />

      {/* Semi-transparent overlay for readability */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(0,0,0,0.25)" }]} />

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Dietary Preferences</Text>

        {renderSwitch("Low Calorie", dietary.lowCalorie, () => toggleDietary("lowCalorie"))}
        {renderSwitch("Vegan", dietary.vegan, () => toggleDietary("vegan"))}
        {renderSwitch("Gluten Free", dietary.glutenFree, () => toggleDietary("glutenFree"))}
        {renderSwitch("Dairy Free", dietary.dairyFree, () => toggleDietary("dairyFree"))}

        <Text style={[styles.title, { marginTop: 20 }]}>Cuisine Types</Text>

        {renderSwitch("Mexican", cuisine.mexican, () => toggleCuisine("mexican"))}
        {renderSwitch("Italian", cuisine.italian, () => toggleCuisine("italian"))}
        {renderSwitch("Indian", cuisine.indian, () => toggleCuisine("indian"))}
        {renderSwitch("Japanese", cuisine.japanese, () => toggleCuisine("japanese"))}
        {renderSwitch("Chinese", cuisine.chinese, () => toggleCuisine("chinese"))}
        {renderSwitch("American", cuisine.american, () => toggleCuisine("american"))}
        {renderSwitch("German", cuisine.german, () => toggleCuisine("german"))}

        <TouchableOpacity style={styles.saveBtn} onPress={savePreferences}>
          <Text style={styles.saveText}>Save Preferences</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 18, marginTop: 40 },
  title: { fontSize: 22, fontWeight: "700", color: "#fff", marginBottom: 10, fontFamily: "Avenir" },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  option: { fontSize: 18, color: "#fff", fontWeight: "500", fontFamily: "Avenir" },
  saveBtn: {
    backgroundColor: "rgba(24, 95, 52, 0.85)", // slightly transparent
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    alignItems: "center",
  },
  saveText: { color: "#fff", fontWeight: "700", fontSize: 18, fontFamily: "Avenir" },
});
