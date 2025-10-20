// App.js
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

// Screens
import HomeScreen from './screens/HomeScreen';
import AddItemScreen from './screens/AddItemScreen';
import DeleteItemScreen from './screens/DeleteItemScreen';
import BarcodeScannerScreen from './screens/BarcodeScannerScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import SplashScreen from './screens/SplashScreen'; // 👈 add this line

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

/** Bottom tabs: shows at the bottom like your Amazon example */
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerTitleAlign: 'center',
        tabBarShowLabel: true,
        tabBarLabelStyle: { fontSize: 12 },
        tabBarStyle: {
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: '#2563eb',   // blue
        tabBarInactiveTintColor: '#6b7280', // gray
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'Home') {
            return <Ionicons name="home-outline" size={size} color={color} />;
          }
          if (route.name === 'Add Item') {
            return <Ionicons name="add-circle-outline" size={size} color={color} />;
          }
          if (route.name === 'Scan') {
            return <MaterialCommunityIcons name="barcode-scan" size={size} color={color} />;
          }
          if (route.name === 'Notifications') {
            return <Ionicons name="notifications-outline" size={size} color={color} />;
          }
          return null;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen
        name="Add Item"
        component={AddItemScreen}
        options={{ title: 'Add Item' }}
      />
      <Tab.Screen
        name="Scan"
        component={BarcodeScannerScreen}
        options={{ title: 'Scan Barcode' }}
      />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
    </Tab.Navigator>
  );
}

/** Root stack: mounts Splash first, then tabs and other screens */
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash">
        {/* 👇 Splash screen will show first */}
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{ headerShown: false }}
        />
        {/* 👇 Tabs (main app) */}
        <Stack.Screen
          name="Root"
          component={MainTabs}
          options={{ headerShown: false }}
        />
        {/* 👇 Extra page */}
        <Stack.Screen
          name="DeleteItem"
          component={DeleteItemScreen}
          options={{ title: 'Delete Item' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}