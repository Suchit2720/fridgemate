// screens/SplashScreen.js
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Image } from 'react-native';

export default function SplashScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
  Animated.timing(fadeAnim, {
    toValue: 1,
    duration: 2000,           // ⏳ slower fade (2 seconds instead of 1)
    useNativeDriver: true,
  }),
  Animated.spring(scaleAnim, {
    toValue: 1,
    friction: 5,              // 🌀 higher friction = slower, smoother bounce
    tension: 50,              // 💫 reduces stiffness for a gentler motion
    useNativeDriver: true,
  }),
]).start();

    const timer = setTimeout(() => {
      navigation.replace('Root'); // switch to your main app
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      {/* Replace with your logo image if you have one */}
      <Animated.Image
        source={require('../assets/fridgemate.png')}
        style={[styles.logo, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}
      />
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef5fb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 220,
    height: 220,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2563eb',
    letterSpacing: 1.5,
  },
});