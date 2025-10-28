// components/RadiantBackground.js
import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing, Dimensions, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

// Big layers so rotations never show edges
const LAYER_W = width * 1.8;
const LAYER_H = height * 1.8;

export default function RadiantBackground() {
  const t1 = useRef(new Animated.Value(0)).current;
  const t2 = useRef(new Animated.Value(0)).current;
  const t3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = (v, delay, dur = 7000) => {
      const run = () => {
        v.setValue(0);
        Animated.timing(v, {
          toValue: 1,
          duration: dur,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
          delay,
        }).start(({ finished }) => finished && run());
      };
      run();
    };
    loop(t1, 0, 7000);
    loop(t2, 900, 8200);
    loop(t3, 1800, 9600);
  }, [t1, t2, t3]);

  // sweep across the whole screen (+ padding so no clipping)
  const sweep = (v) => v.interpolate({
    inputRange: [0, 1],
    outputRange: [-LAYER_W * 0.5, LAYER_W * 0.5],
  });

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {/* Soft global tint (very subtle) */}
      <LinearGradient
        colors={['#e9f7ef', '#e9f7ef']}
        style={StyleSheet.absoluteFill}
      />

      {/* Aurora beams, full-screen, edge-to-edge */}
      <Animated.View
        style={[
          styles.layer,
          { transform: [{ translateX: sweep(t1) }, { rotate: '-18deg' }] },
          { opacity: 0.65 },
        ]}
      >
        <LinearGradient
          colors={['transparent', '#0B3D0B99', '#2A6B2Acc', '#0B3D0B99', 'transparent']}
          start={{ x: 0, y: 0.2 }}
          end={{ x: 1, y: 0.8 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.layer,
          { transform: [{ translateX: sweep(t2) }, { rotate: '12deg' }] },
          { opacity: 0.55 },
        ]}
      >
        <LinearGradient
          colors={['transparent', '#17a34a88', '#22c55ecc', '#17a34a88', 'transparent']}
          start={{ x: 0, y: 0.2 }}
          end={{ x: 1, y: 0.8 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.layer,
          { transform: [{ translateX: sweep(t3) }, { rotate: '-6deg' }] },
          { opacity: 0.45 },
        ]}
      >
        <LinearGradient
          colors={['transparent', '#6ee7b777', '#b7f7d5bb', '#6ee7b777', 'transparent']}
          start={{ x: 0, y: 0.2 }}
          end={{ x: 1, y: 0.8 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    position: 'absolute',
    width: LAYER_W,
    height: LAYER_H,
    left: -LAYER_W * 0.25,
    top: -LAYER_H * 0.25,
  },
});