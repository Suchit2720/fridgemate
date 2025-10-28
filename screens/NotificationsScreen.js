import { useEffect } from 'react';
import { View, Text, Button, Alert, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { globalStyles } from '../components/globalStyles';
import RadiantBackground from '../components/RadiantBackground'; 

export default function NotificationsScreen({ navigation }) {
  useEffect(() => {
    // Foreground behavior
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    (async () => {
      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        Alert.alert('Alert', 'Permission for notifications was denied.');
        return;
      }

      // Android channel (required for sound/importance on Android 8+)
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
          sound: 'default',
        });
      }

      if (!Device.isDevice) {
        console.log('Running in simulator — notifications may be limited.');
      }
    })();
  }, []);

  const scheduleNotification = async () => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'FridgeMate Reminder',
          body: 'Time to check your fridge!',
        },
        trigger: { seconds: 5 }, // fires in 5s
      });
      Alert.alert('Scheduled', 'Test notification will arrive in ~5 seconds.');
    } catch (e) {
      Alert.alert('Error', String(e));
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* 🌈 Glowing animated background */}
      <RadiantBackground />
      <View style={[globalStyles.container, globalStyles.background]}>
        <Text style={globalStyles.title}>Notifications</Text>
        <View style={globalStyles.buttons}>
          <Button title="Send Test Notification" onPress={scheduleNotification} />
          <Button title="Go Back" onPress={() => navigation.goBack()} />
        </View>
      </View>
    </View>
  );
}