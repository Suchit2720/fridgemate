// screens/SignInScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../src/lib/firebase';
import { globalStyles } from '../components/globalStyles';
import RadiantBackground from '../components/RadiantBackground';
import { Video } from 'expo-av';

export default function SignInScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');

  const signIn = async () => {
    try {
      await signInWithEmailAndPassword(auth, email.trim(), pass);
    } catch (e) {
      Alert.alert('Sign in failed', e.message);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Background video */}
      <Video
        source={require('../assets/background.mp4')}
        rate={1.0}
        volume={0}
        isMuted
        resizeMode="cover"
        shouldPlay
        isLooping
        style={StyleSheet.absoluteFill}
      />
      {/* Optional overlay for better contrast */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.25)' }]} />

      <View style={[globalStyles.container, { paddingHorizontal: 20 }]}>
        <Text style={[globalStyles.title, { fontFamily: 'Avenir' }]}>Welcome back</Text>

        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#ccc"
          style={styles.input}
        />
        <TextInput
          value={pass}
          onChangeText={setPass}
          placeholder="Password"
          secureTextEntry
          placeholderTextColor="#ccc"
          style={styles.input}
        />

        <View style={styles.buttons}>
          <TouchableOpacity style={styles.btn} onPress={signIn}>
            <Text style={styles.btnText}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: '#18311ebd' }]}
            onPress={() => navigation.navigate('SignUp')}
          >
            <Text style={styles.btnText}>Create account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    width: '90%',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    color: '#fff',
    fontFamily: 'Avenir',
  },
  buttons: {
    width: '90%',
    alignItems: 'center',
  },
  btn: {
    width: '100%',
    backgroundColor: '#274e30bd',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  btnText: {
    color: '#fff',
    fontFamily: 'Avenir',
    fontSize: 16,
    fontWeight: '600',
  },
});
