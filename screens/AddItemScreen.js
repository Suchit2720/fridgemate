import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  Platform,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Keyboard,
  KeyboardAvoidingView,
} from 'react-native';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../src/lib/firebase';
import { globalStyles } from '../components/globalStyles';
import * as Notifications from 'expo-notifications';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { Picker } from '@react-native-picker/picker';
import { Video } from 'expo-av'; // ✅ Video background

export default function AddItemScreen({ navigation }) {
  const [item, setItem] = useState('');
  const [expirationDate, setExpirationDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [unit, setUnit] = useState('pcs');
  const [exactAmount, setExactAmount] = useState('');
  const [unitModalVisible, setUnitModalVisible] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const formatDate = (date) => {
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const year = String(d.getFullYear()).slice(2);
    return `${month}/${day}/${year}`;
  };

  const scheduleExpirationReminders = async (name, expDate) => {
    try {
      const now = new Date();
      const msInDay = 24 * 60 * 60 * 1000;
      const reminderDays = [3, 2, 1];
      for (const daysBefore of reminderDays) {
        const triggerDate = new Date(expDate.getTime() - daysBefore * msInDay);
        if (triggerDate > now) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: '🥦 FridgeMate Reminder',
              body: `${name} expires in ${daysBefore} day${daysBefore > 1 ? 's' : ''}!`,
              sound: 'default',
            },
            trigger: triggerDate,
          });
        }
      }
    } catch (err) {
      console.error('Error scheduling reminders:', err);
    }
  };

  const addItem = async () => {
  const name = item.trim();
  if (!name) return Alert.alert('Please enter an item name');

  const uid = auth.currentUser?.uid;
  if (!uid) return Alert.alert('You must be signed in');

    try {
      const expString = formatDate(expirationDate);
      await addDoc(collection(db, `users/${uid}/items`), {
        name,
        unit,
        exactAmount: exactAmount ? Number(exactAmount) : null,
        expiration: expString,
        createdAt: serverTimestamp(),
      });

      await scheduleExpirationReminders(name, expirationDate);

      Alert.alert(
        '✅ Item Added!',
        `${name}${exactAmount ? ` (${exactAmount} ${unit})` : ''} (Expires: ${expString})`
      );

      setItem('');
      setUnit('pcs');
      setExactAmount('');
      setExpirationDate(new Date());
    } catch (error) {
      console.error(error);
      Alert.alert('❌ Error adding item', error.message);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Video
        source={require('../assets/background2.mp4')}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
        shouldPlay
        isLooping
        isMuted
      />

      <View style={[globalStyles.container, styles.container]}>
        <View style={styles.glassCard}>
          <Text style={styles.title}>Add New Item</Text>

          <TextInput
            style={styles.input}
            placeholder="Enter item name"
            placeholderTextColor="#ffffffff"
            value={item}
            onChangeText={setItem}
          />

          {/* Unit & Exact Amount */}
          <View style={styles.unitRow}>
            <TouchableOpacity
              style={styles.unitButton}
              onPress={() => setUnitModalVisible(true)}
            >
              <Text style={styles.unitText}>{unit}</Text>
            </TouchableOpacity>

            <View style={styles.exactWrapper}>
              <Text style={styles.unitLabel}>Amount</Text>
              <TextInput
                style={styles.exactInput}
                placeholder="0"
                placeholderTextColor="#ffffff88"
                keyboardType="numeric"
                value={exactAmount}
                onChangeText={setExactAmount}
              />
              {keyboardVisible && (
                <TouchableOpacity style={styles.closeKeyboardButton} onPress={Keyboard.dismiss}>
                  <Text style={styles.closeKeyboardText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Unit Picker Modal */}
          <Modal
            visible={unitModalVisible}
            transparent={true}
            animationType="slide"
          >
            <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={Keyboard.dismiss}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Select Unit</Text>
                  <TouchableOpacity onPress={() => setUnitModalVisible(false)}>
                    <Text style={styles.modalCloseText}>✕</Text>
                  </TouchableOpacity>
                </View>
                <Picker
                  selectedValue={unit}
                  onValueChange={(value) => setUnit(value)}
                  style={styles.modalPicker}
                >
                  {['pcs','g','kg','oz','lb','ml','L','tsp','tbsp','cups','quarts','gallons'].map(u => (
                    <Picker.Item key={u} label={u} value={u} />
                  ))}
                </Picker>
              </View>
            </TouchableOpacity>
          </Modal>

          {/* Expiration Date */}
          <TouchableOpacity style={styles.dateButton} onPress={() => setShowPicker(true)}>
            <Text style={styles.dateText}>
              Expiration Date:{' '}
              <Text style={{ color: '#9de8a6ff', fontFamily: 'Avenir' }}>{formatDate(expirationDate)}</Text>
            </Text>
          </TouchableOpacity>

          {showPicker && (
            <DateTimePicker
              value={expirationDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              textColor="#ffffff"
              themeVariant="dark"
              onChange={(event, selectedDate) => {
                setShowPicker(false);
                if (selectedDate) setExpirationDate(selectedDate);
              }}
            />
          )}

          <TouchableOpacity onPress={addItem} activeOpacity={0.8} style={{ width: '100%' }}>
            <LinearGradient
              colors={['#a2e68fff', '#277e36ff']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.addButton}
            >
              <Text style={styles.addButtonText}>Add Item</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.secondaryButton}>
            <Text style={styles.secondaryText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  glassCard: {
    width: '90%',
    padding: 24,
    borderRadius: 20,
    backgroundColor: 'rgba(50, 95, 38, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,.20)',
    shadowColor: '#101410ff',
    shadowOpacity: 0.25,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
  title: { fontSize: 24, fontWeight: '800', color: '#fff', marginBottom: 20, textAlign: 'center', fontFamily: 'Avenir' },
  input: { width: '100%', padding: 14, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.12)', color: '#fff', fontSize: 16, marginBottom: 20, fontFamily: 'Avenir' },
  unitRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25, alignItems: 'center' },
  unitButton: { flex: 1, backgroundColor: 'rgba(255,255,255,0.12)', padding: 12, borderRadius: 12, alignItems: 'center', marginRight: 10 },
  unitText: { color: '#fff', fontSize: 16, fontWeight: '600', fontFamily: 'Avenir' },
  exactWrapper: { width: 100, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 12, alignItems: 'center', paddingVertical: 4 },
  unitLabel: { color: '#fff', fontSize: 16, marginBottom: 4, textAlign: 'center', fontWeight: '600', fontFamily: 'Avenir' },
  exactInput: { width: '80%', padding: 6, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.08)', color: '#fff', textAlign: 'center', fontSize: 16, fontFamily: 'Avenir' },
  closeKeyboardButton: { position: 'absolute', top: -22, right: -4, backgroundColor: '#444', borderRadius: 12, paddingHorizontal: 6, paddingVertical: 2 },
  closeKeyboardText: { color: '#a2e68fff', fontWeight: '600', fontSize: 16, fontFamily: 'Avenir' },
  dateButton: { width: '100%', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.08)', marginBottom: 25, alignItems: 'center' },
  dateText: { color: '#fff', fontSize: 16, fontFamily: 'Avenir' },
  addButton: { paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  addButtonText: { color: '#fff', fontWeight: '700', fontSize: 18, fontFamily: 'Avenir' },
  secondaryButton: { marginTop: 14, paddingVertical: 12, alignItems: 'center' },
  secondaryText: { color: '#ffffffcc', fontSize: 16, fontFamily: 'Avenir' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#222', width: '80%', borderRadius: 16, padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: '600', fontFamily: 'Avenir' },
  modalPicker: { backgroundColor: '#333', color: '#fff', height: 200 },
  modalCloseText: { color: '#a2e68fff', fontSize: 22, fontWeight: '600', fontFamily: 'Avenir' },
});
