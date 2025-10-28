// screens/SignUpScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../src/lib/firebase';
import { globalStyles } from '../components/globalStyles';
import RadiantBackground from '../components/RadiantBackground';

export default function SignUpScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [name, setName] = useState('');

  const signUp = async () => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      // optional display name on the auth profile
      if (name) await updateProfile(cred.user, { displayName: name });

      // ✅ Create a user doc in Firestore for your app’s data
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
      <RadiantBackground />
      <View style={[globalStyles.container, { paddingHorizontal: 20 }]}>
        <Text style={globalStyles.title}>Create your account</Text>

        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Name (optional)"
          style={{
            width: '90%', borderWidth: 1, borderColor: '#ccc',
            padding: 12, borderRadius: 10, marginBottom: 12,
          }}
        />
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          style={{
            width: '90%', borderWidth: 1, borderColor: '#ccc',
            padding: 12, borderRadius: 10, marginBottom: 12,
          }}
        />
        <TextInput
          value={pass}
          onChangeText={setPass}
          placeholder="Password (min 6)"
          secureTextEntry
          style={{
            width: '90%', borderWidth: 1, borderColor: '#ccc',
            padding: 12, borderRadius: 10, marginBottom: 16,
          }}
        />
        <View style={globalStyles.buttons}>
          <Button title="Create Account" onPress={signUp} />
          <Button title="Back to Sign In" onPress={() => navigation.goBack()} />
        </View>
      </View>
    </View>
  );
}