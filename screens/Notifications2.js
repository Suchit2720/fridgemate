// screens/NotificationsScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Platform, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Video } from 'expo-av';

// 🌿 Global text override (in case not set in App.js)
Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.style = { fontFamily: 'Avenir' };

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const COLORS = {
  darkGreen: '#1A3A1A',
  lightGreen: '#C8F4C8',
  mutedGreen: '#2E5E2E',
  greyDark: '#2C2C2C',
  greyLight: '#D3D3D3',
  cardBg: 'rgba(31, 31, 31, 0.37)',
  buttonBg: 'rgba(136, 204, 97, 0.51)',
  dangerBg: 'rgba(38, 64, 34, 0.85)',
};

export default function NotificationsScreen({ navigation }) {
  const [permissionStatus, setPermissionStatus] = useState(null);
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [time, setTime] = useState(() => {
    const t = new Date();
    t.setHours(9, 0, 0, 0);
    return t;
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    (async () => {
      const ok = await ensurePermissions();
      setPermissionStatus(ok ? 'granted' : 'denied');
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.DEFAULT,
        });
      }
    })();
  }, []);

  async function ensurePermissions() {
    if (!Device.isDevice) {
      Alert.alert('Simulator', 'Use a real device for notifications.');
      return false;
    }
    const current = await Notifications.getPermissionsAsync();
    if (current.granted || current.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
      return true;
    }
    const req = await Notifications.requestPermissionsAsync({
      ios: { allowAlert: true, allowBadge: true, allowSound: true },
    });
    return req.granted || req.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
  }

  const fmtTime = (d) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const fmtDate = (d) => d.toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' });

  const combineDateTime = () => {
    const fireAt = new Date(date);
    fireAt.setHours(time.getHours(), time.getMinutes(), 0, 0);
    return fireAt;
  };

  async function scheduleOnDate() {
    if (permissionStatus !== 'granted') {
      Alert.alert('Permission needed', 'Enable notifications in Settings.');
      return;
    }
    const fireAt = combineDateTime();
    if (fireAt <= new Date()) {
      Alert.alert('Pick a future time', 'Selected date/time is in the past.');
      return;
    }
    await Notifications.scheduleNotificationAsync({
      content: { title: 'FridgeMate', body: 'Reminder to check your fridge 🧊' },
      trigger: fireAt,
    });
    Alert.alert('Scheduled', `Reminder set for ${fmtDate(fireAt)} at ${fmtTime(fireAt)}.`);
  }

  async function scheduleDaily() {
    if (permissionStatus !== 'granted') {
      Alert.alert('Permission needed', 'Enable notifications in Settings.');
      return;
    }
    await Notifications.scheduleNotificationAsync({
      content: { title: 'FridgeMate', body: 'Daily reminder to review your fridge 🧊' },
      trigger: { hour: time.getHours(), minute: time.getMinutes(), repeats: true },
    });
    Alert.alert('Scheduled', `Daily reminder set for ${fmtTime(time)}.`);
  }

  async function cancelAll() {
    await Notifications.cancelAllScheduledNotificationsAsync();
    Alert.alert('Cancelled', 'All scheduled notifications were cancelled.');
  }

  return (
    <View style={{ flex: 1 }}>
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
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.25)' }]} />

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Notifications</Text>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Choose Date</Text>
          <Text style={styles.valueText}>{fmtDate(date)}</Text>
          <Pressable onPress={() => setShowDatePicker(true)} style={({ pressed }) => [styles.btnSecondary, pressed && styles.pressed]}>
            <Text style={styles.btnSecondaryText}>Pick Date (Month / Day / Year)</Text>
          </Pressable>
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(e, selected) => {
                if (Platform.OS !== 'ios') setShowDatePicker(false);
                if (selected) setDate(selected);
              }}
            />
          )}

          <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Choose Time</Text>
          <Text style={styles.valueText}>{fmtTime(time)}</Text>
          <Pressable onPress={() => setShowTimePicker(true)} style={({ pressed }) => [styles.btnSecondary, pressed && styles.pressed]}>
            <Text style={styles.btnSecondaryText}>Pick Time</Text>
          </Pressable>
          {showTimePicker && (
            <DateTimePicker
              value={time}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(e, selected) => {
                if (Platform.OS !== 'ios') setShowTimePicker(false);
                if (selected) setTime(selected);
              }}
            />
          )}

          <View style={styles.row}>
            <Pressable onPress={scheduleOnDate} style={({ pressed }) => [styles.btn, pressed && styles.pressed]}>
              <Text style={styles.btnText}>Schedule on Date</Text>
            </Pressable>
            <Pressable onPress={scheduleDaily} style={({ pressed }) => [styles.btn, pressed && styles.pressed]}>
              <Text style={styles.btnText}>Schedule Daily</Text>
            </Pressable>
          </View>

          <Pressable onPress={cancelAll} style={({ pressed }) => [styles.btnDanger, pressed && styles.pressed]}>
            <Text style={styles.btnDangerText}>Cancel All</Text>
          </Pressable>

          <Pressable onPress={() => navigation.goBack()} style={styles.linkBtn}>
            <Text style={styles.linkText}>Go Back</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: '700', color: COLORS.lightGreen, textAlign: 'center', marginBottom: 16, fontFamily: 'Avenir' },
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: COLORS.greyLight, marginBottom: 4, fontFamily: 'Avenir' },
  valueText: { fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 8, fontFamily: 'Avenir' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  btn: { flex: 0.49, backgroundColor: COLORS.buttonBg, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 16, fontFamily: 'Avenir' },
  btnSecondary: { backgroundColor: 'rgba(46, 94, 46, 0.54)', paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginBottom: 8 },
  btnSecondaryText: { color: '#fff', fontWeight: '600', fontSize: 16, fontFamily: 'Avenir' },
  btnDanger: { backgroundColor: COLORS.dangerBg, paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  btnDangerText: { color: '#fff', fontWeight: '700', fontSize: 16, fontFamily: 'Avenir' },
  linkBtn: { alignItems: 'center', marginTop: 12 },
  linkText: { color: COLORS.lightGreen, fontSize: 16, fontWeight: '600', fontFamily: 'Avenir' },
  pressed: { opacity: 0.85 },
});
