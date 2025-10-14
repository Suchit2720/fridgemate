import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import AddItemScreen from './screens/AddItemScreen';
import DeleteItemScreen from './screens/DeleteItemScreen';
import BarcodeScannerScreen from './screens/BarcodeScannerScreen';
import NotificationsScreen from './screens/NotificationsScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="AddItem" component={AddItemScreen} />
        <Stack.Screen name="DeleteItem" component={DeleteItemScreen} />
        <Stack.Screen name="BarcodeScanner" component={BarcodeScannerScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
