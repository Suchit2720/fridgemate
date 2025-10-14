import React, { useEffect } from 'react';
import { View, Text, Button, Alert, StyleSheet } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

export default function NotificationsScreen({ navigation }) {
  useEffect(() => {
    // Configure how notifications behave
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    // Ask for permission
    (async () => {
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

      if (Device.isDevice) {
        console.log('Notifications permission granted ✅');
      }
    })();
  }, []);

  const scheduleNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'FridgeMate Reminder',
        body: 'Time to check your fridge!',
      },
      trigger: { seconds: 5 },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notifications</Text>
      <Button title="Send Test Notification" onPress={scheduleNotification} />
      <Button title="Go Back" onPress={() => navigation.goBack()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    marginBottom: 20,
  },
});
