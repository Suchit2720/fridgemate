// components/globalStyles.js
import { StyleSheet } from 'react-native';

export const globalStyles = StyleSheet.create({
  //  Screen layout basics
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  // Title text for all screens
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#0B3D0B', // deep green
    marginBottom: 10,
    fontFamily: 'Avenir', // ✅ global font
  },

  // General body text
  text: {
    fontSize: 16,
    textAlign: 'center',
    color: '#114D1A', // softer green
    marginBottom: 30,
    fontFamily: 'Avenir', // ✅ global font
  },

  //  Button layout wrapper
  buttons: {
    width: 220,
    gap: 12, // consistent spacing
  },

  // Consistent center alignment
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // 🌿 Global background color (if ever needed)
  background: {
    backgroundColor: '#E9F7EF', // pale green tint
  },

  // 🌿 Extra reusable text style for small text/buttons
  smallText: {
    fontSize: 14,
    fontFamily: 'Avenir', // ✅ ensure consistent small text
    color: '#114D1A',
  },
});
