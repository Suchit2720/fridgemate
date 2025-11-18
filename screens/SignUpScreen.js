// screens/SignUpScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../src/lib/firebase';
import { globalStyles } from '../components/globalStyles';
import { Video } from 'expo-av';

export default function SignUpScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [name, setName] = useState('');

  const signUp = async () => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      if (name) await updateProfile(cred.user, { displayName: name });

      await setDoc(doc(db, 'users', cred.user.uid), {
        email: cred.user.email,
        displayName: name || '',
        createdAt: serverTimestamp(),
      });

      Alert.alert('Account created', 'Welcome to FridgeMate!');
    } catch (e) {
      Alert.alert('Sign up failed', e.message);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Background video */}
      <Video
        source={require('../assets/background2.mp4')}
        rate={1.0}
        volume={0}
        isMuted
        resizeMode="cover"
        shouldPlay
        isLooping
        style={StyleSheet.absoluteFill}
      />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.25)' }]} />

      <View style={[globalStyles.container, { paddingHorizontal: 20 }]}>
        <Text style={[globalStyles.title, { fontFamily: 'Avenir' }]}>Create your account</Text>

        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Name (optional)"
          placeholderTextColor="#ccc"
          style={styles.input}
        />
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
          placeholder="Password (min 6)"
          secureTextEntry
          placeholderTextColor="#ccc"
          style={styles.input}
        />

        <View style={styles.buttons}>
          <TouchableOpacity style={styles.btn} onPress={signUp}>
            <Text style={styles.btnText}>Create Account</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: '#224f2c8f' }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.btnText}>Back to Sign In</Text>
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
    backgroundColor: '#224f2ce0',
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
