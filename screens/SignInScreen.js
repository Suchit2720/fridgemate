// screens/SignInScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../src/lib/firebase';
import { globalStyles } from '../components/globalStyles';
import RadiantBackground from '../components/RadiantBackground';

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
      <RadiantBackground />
      <View style={[globalStyles.container, { paddingHorizontal: 20 }]}>
        <Text style={globalStyles.title}>Welcome back</Text>

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
          placeholder="Password"
          secureTextEntry
          style={{
            width: '90%', borderWidth: 1, borderColor: '#ccc',
            padding: 12, borderRadius: 10, marginBottom: 16,
          }}
        />
        <View style={globalStyles.buttons}>
          <Button title="Sign In" onPress={signIn} />
          <Button
            title="Create account"
            onPress={() => navigation.navigate('SignUp')}
          />
        </View>
      </View>
    </View>
  );
}