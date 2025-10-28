// screens/SplashScreen.js
import { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';
import RadiantBackground from '../components/RadiantBackground';

export default function SplashScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Logo fade + bounce
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulsing ring loop
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0, duration: 1200, useNativeDriver: true }),
      ])
    );
    loop.start();

    const timer = setTimeout(() => navigation.replace('Root'), 2500);

    return () => {
      loop.stop();
      clearTimeout(timer);
    };
  }, [fadeAnim, scaleAnim, pulseAnim, navigation]);

  const scale = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.5] });
  const opacity = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0] });

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <RadiantBackground />

      {/* Glowing pulse ring behind the logo */}
      <Animated.View
        style={{
          position: 'absolute',
          width: 280,
          height: 280,
          borderRadius: 140,
          backgroundColor: '#0B3D0B',
          opacity,
          transform: [{ scale }],
        }}
      />

      {/* Logo */}
      <Animated.Image
        source={require('../assets/fridgemate.png')}
        style={{
          width: 220,
          height: 220,
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }}
      />

      {/* Tagline */}
      <Animated.Text
        style={{
          fontSize: 20,
          color: '#0B3D0B',
          opacity: fadeAnim,
          marginTop: 25,
          letterSpacing: 1,
          fontWeight: '600',
          textShadowColor: 'rgba(11,61,11,0.4)',
          textShadowOffset: { width: 1, height: 1 },
          textShadowRadius: 6,
        }}
      >
        Reduce Waste. Stay Fresh. 🌱
      </Animated.Text>
    </View>
  );
}