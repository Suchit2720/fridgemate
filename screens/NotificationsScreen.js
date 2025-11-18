// screens/ProfileScreen.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  Switch,
  ScrollView,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/contexts/AuthContext';
import { auth, db } from '../src/lib/firebase';
import { doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { Video } from 'expo-av';

const COLORS = {
  darkGreen: '#1A3A1A',
  lightGreen: '#C8F4C8',
  mutedGreen: '#2E5E2E',
  greyDark: '#2C2C2C',
  greyLight: '#D3D3D3',
  cardBg: '#1F1F1F',
  buttonBg: '#3A6B3A',
  deleteBg: '#8B1C1C',
  cancelBg: '#555',
};

export default function ProfileScreen({ navigation }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    name: user?.email ? user.email.split('@')[0] : '',
    email: user?.email || '',
    photoUri: null,
    notificationsEnabled: true,
    notifyByPush: true,
    notifyByEmail: false,
  });
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState('');

  const handleChange = (field, value) => setProfile(prev => ({ ...prev, [field]: value }));

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets?.length) handleChange('photoUri', result.assets[0].uri);
  };

  const saveChanges = async () => {
    try {
      if (newName.trim()) {
        setProfile(prev => ({ ...prev, name: newName.trim() }));
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, { displayName: newName.trim() });
      }
      Alert.alert('Success', 'Profile updated successfully.');
      setEditing(false);
      setNewName('');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Could not save changes.');
    }
  };

  const deleteAccount = () => {
    Alert.alert('⚠️ Confirm Delete', 'Permanently delete your account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const userRef = doc(db, 'users', user.uid);
            await deleteDoc(userRef);
            await user.delete();
            Alert.alert('Deleted', 'Your account has been deleted.');
            navigation.replace('SignIn');
          } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Could not delete account.');
          }
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Full-screen looping video background */}
      <Video
        source={require('../assets/background.mp4')} // replace with your video
        rate={1.0}
        volume={0}
        isMuted={true}
        resizeMode="cover"
        shouldPlay
        isLooping
        style={StyleSheet.absoluteFill}
      />

      {/* Semi-transparent overlay for contrast */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.25)' }]} />

      <ScrollView contentContainerStyle={styles.container}>
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <Image
            source={
              profile.photoUri
                ? { uri: profile.photoUri }
                : require('../assets/profile-placeholder.png')
            }
            style={styles.avatar}
          />
          <TouchableOpacity style={styles.changePhotoBtn} onPress={pickImage}>
            <Ionicons name="camera-outline" size={18} color="#fff" />
            <Text style={styles.changePhotoText}>Change Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Buttons */}
        {!editing && (
          <View style={styles.buttonSection}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Preferences')}>
              <Text style={styles.actionText}>Preferences</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={() => setEditing(true)}>
              <Text style={styles.actionText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Profile Card */}
        <View style={styles.card}>
          {editing && (
            <>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Your name"
                placeholderTextColor={COLORS.greyLight}
                value={newName || profile.name}
                onChangeText={setNewName}
              />
              <TouchableOpacity style={[styles.actionBtn, { marginTop: 12 }]} onPress={saveChanges}>
                <Text style={styles.actionText}>Save Changes</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.deleteBtn, { marginTop: 10 }]} onPress={deleteAccount}>
                <Text style={styles.actionText}>Delete Account</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.cancelBtn, { marginTop: 10 }]} onPress={() => setEditing(false)}>
                <Text style={styles.actionText}>Cancel</Text>
              </TouchableOpacity>
            </>
          )}

          <Text style={styles.label}>Email</Text>
          <TextInput style={[styles.input, styles.inputDisabled]} value={profile.email} editable={false} />
        </View>

{/* Notifications Card */}
<View style={styles.card}>
  <Text style={styles.cardTitle}>Notifications</Text>
  <View style={styles.row}>
    <Text style={styles.rowLabel}>Enable notifications</Text>
    <Switch
      value={profile.notificationsEnabled}
      onValueChange={val => handleChange('notificationsEnabled', val)}
      thumbColor={profile.notificationsEnabled ? COLORS.lightGreen : COLORS.greyLight}
      trackColor={{ false: COLORS.greyLight, true: COLORS.mutedGreen }}
    />
  </View>
  <View style={styles.row}>
    <Text style={styles.rowLabel}>Push notifications</Text>
    <Switch
      value={profile.notifyByPush}
      onValueChange={val => handleChange('notifyByPush', val)}
      disabled={!profile.notificationsEnabled}
      thumbColor={profile.notifyByPush ? COLORS.lightGreen : COLORS.greyLight}
      trackColor={{ false: COLORS.greyLight, true: COLORS.mutedGreen }}
    />
  </View>
  <View style={styles.row}>
    <Text style={styles.rowLabel}>Email notifications</Text>
    <Switch
      value={profile.notifyByEmail}
      onValueChange={val => handleChange('notifyByEmail', val)}
      disabled={!profile.notificationsEnabled}
      thumbColor={profile.notifyByEmail ? COLORS.lightGreen : COLORS.greyLight}
      trackColor={{ false: COLORS.greyLight, true: COLORS.mutedGreen }}
    />
  </View>

  {/* ✅ New Button */}
<TouchableOpacity
  style={styles.actionBtn}
  onPress={() => navigation.navigate('Notifications2')}
>
  <Text style={styles.actionText}>Edit Notifications</Text>
</TouchableOpacity>

  <Text style={styles.helperText}>
    These preferences will be used for your fridge reminders.
  </Text>
</View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 40 },
  avatarSection: { alignItems: 'center', marginBottom: 24 },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: COLORS.lightGreen,
    backgroundColor: 'rgba(211,211,211,0.6)', // slightly transparent grey
  },
  changePhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(46, 94, 46, 0.54)', // muted green, semi-transparent
  },
  changePhotoText: { color: '#fff', marginLeft: 6, fontSize: 14, fontWeight: '500', fontFamily: 'Avenir' },
  buttonSection: { marginBottom: 20 },
  actionBtn: {
    backgroundColor: 'rgba(136, 204, 97, 0.51)', // button green semi-transparent
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  deleteBtn: {
    backgroundColor: 'rgba(136, 204, 97, 0.85)', // delete red semi-transparent
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: 'rgba(111, 165, 79, 0.85)', // cancel button semi-transparent
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionText: { color: '#fff', fontWeight: '600', fontSize: 16, fontFamily: 'Avenir' },
  card: {
    backgroundColor: 'rgba(31, 31, 31, 0.37)', // card semi-transparent
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  cardTitle: { fontSize: 18, fontWeight: '700', color: COLORS.lightGreen, marginBottom: 10, fontFamily: 'Avenir' },
  label: { fontSize: 13, color: COLORS.greyLight, marginTop: 8, marginBottom: 4, fontFamily: 'Avenir' },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(211,211,211,0.6)', // semi-transparent
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 15,
    backgroundColor: 'rgba(44,44,44,0.7)', // semi-transparent
    color: '#fff',
    fontFamily: 'Avenir',
  },
  inputDisabled: { backgroundColor: 'rgba(45, 55, 62, 0.7)', color: COLORS.greyLight, fontFamily: 'Avenir' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 },
  rowLabel: { fontSize: 15, color: COLORS.greyLight, flexShrink: 1, paddingRight: 10, fontFamily: 'Avenir' },
  helperText: { marginTop: 8, fontSize: 12, color: COLORS.greyLight, fontFamily: 'Avenir' },
});
