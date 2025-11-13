// screens/NotificationsScreen.js
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  Alert,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  Animated,
  Easing,
  StyleSheet,
  Platform,
} from 'react-native';
import {
  signOut,
  updatePassword,
  updateProfile,
  deleteUser,
} from 'firebase/auth';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../src/lib/firebase';
import { globalStyles } from '../components/globalStyles';
import RadiantBackground from '../components/RadiantBackground';

export default function NotificationsScreen({ navigation }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          Alert.alert('Error', 'No user signed in.');
          navigation.navigate('SignIn');
          return;
        }

        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        } else {
          setUserData({
            displayName: user.displayName || 'N/A',
            email: user.email,
          });
        }
      } catch (e) {
        Alert.alert('Error loading profile', e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    if (!loading) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }).start();
    }
  }, [loading]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigation.replace('SignIn');
    } catch (e) {
      Alert.alert('Error signing out', e.message);
    }
  };

  const handleSaveChanges = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      if (newName.trim()) {
        await updateProfile(user, { displayName: newName });
        await updateDoc(doc(db, 'users', user.uid), { displayName: newName });
      }

      if (newPassword.trim()) {
        if (newPassword.length < 6) {
          Alert.alert('Error', 'Password must be at least 6 characters.');
          return;
        }
        await updatePassword(user, newPassword);
      }

      Alert.alert('✅ Success', 'Profile updated successfully.');
      setEditing(false);
      setNewName('');
      setNewPassword('');
    } catch (e) {
      Alert.alert('Update failed', e.message);
    }
  };

  const handleDeleteAccount = async () => {
    const user = auth.currentUser;
    if (!user) return;

    Alert.alert('⚠️ Confirm Delete', 'Permanently delete your account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDoc(doc(db, 'users', user.uid));
            await deleteUser(user);
            Alert.alert('Account Deleted', 'Your profile has been removed.');
            navigation.replace('SignIn');
          } catch (e) {
            Alert.alert('Error deleting account', e.message);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={[globalStyles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="rgba(255, 255, 255, 1)" />
        <Text style={[styles.textBase, { color: '#eee', marginTop: 10 }]}>
          Loading profile...
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <RadiantBackground />
      <Animated.View
        style={[
          globalStyles.container,
          { paddingHorizontal: 20, opacity: fadeAnim },
        ]}
      >
        <View style={styles.card}>
          <Text style={styles.title}>👤 Your Profile</Text>

          {!editing ? (
            <>
              <Text style={styles.field}>
                <Text style={styles.label}>Name:</Text>{' '}
                {userData?.displayName || 'N/A'}
              </Text>
              <Text style={styles.field}>
                <Text style={styles.label}>Email:</Text> {userData?.email}
              </Text>
              <Text style={styles.field}>
                <Text style={styles.label}>Password:</Text> ********
              </Text>

              <View style={styles.buttonGroup}>
                <TouchableOpacity style={styles.button} onPress={() => setEditing(true)}>
                  <Text style={styles.buttonText}>Edit Profile</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.button} onPress={handleSignOut}>
                  <Text style={styles.buttonText}>Sign Out</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, { backgroundColor: '#08360eff' }]}
                  onPress={handleDeleteAccount}
                >
                  <Text style={styles.buttonText}>Delete Profile</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <TextInput
                value={newName}
                onChangeText={setNewName}
                placeholder="New Name"
                placeholderTextColor="#f0f0f0ff"
                style={styles.input}
              />
              <TextInput
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="New Password (min 6)"
                secureTextEntry
                placeholderTextColor="#edededff"
                style={styles.input}
              />
              <View style={styles.buttonGroup}>
                <TouchableOpacity style={styles.button} onPress={handleSaveChanges}>
                  <Text style={styles.buttonText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: '#666' }]}
                  onPress={() => setEditing(false)}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </Animated.View>
    </View>
  );
}

const fontFamily = Platform.select({
  ios: 'Avenir',
  android: 'Verdana',
});

const styles = StyleSheet.create({
  textBase: {
    fontFamily,
  },
  card: {
    backgroundColor: 'rgba(3, 2, 2, 0.17)',
    borderRadius: 20,
    padding: 25,
    width: '100%',
    shadowColor: '#031705ff',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 0.5,
    fontFamily,
  },
  label: {
    fontWeight: '700',
    color: '#08360eff',
    fontFamily,
  },
  field: {
    fontSize: 18,
    color: '#eee',
    marginBottom: 10,
    fontFamily,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    padding: 12,
    borderRadius: 10,
    color: '#fff',
    marginBottom: 15,
    backgroundColor: 'rgba(255,255,255,0.1)',
    fontFamily,
  },
  buttonGroup: {
    marginTop: 15,
    gap: 10,
  },
  button: {
    backgroundColor: '#7bac83ff',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    shadowColor: '#4a4e4aff',
    shadowOpacity: 0.5,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    letterSpacing: 0.5,
    fontFamily,
  },
});