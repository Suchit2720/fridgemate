// App.js
import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { StatusBar, TouchableOpacity, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import * as Notifications from 'expo-notifications';

import HomeScreen from './screens/HomeScreen';
import AddItemScreen from './screens/AddItemScreen';
import BarcodeScannerScreen from './screens/BarcodeScannerScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import DeleteItemScreen from './screens/DeleteItemScreen';
import PreferencesScreen from './screens/PreferencesScreen';
import SplashScreen from './screens/SplashScreen';

import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import SignInScreen from './screens/SignInScreen';
import SignUpScreen from './screens/SignUpScreen';

const BRAND = { green: '#175831ff', greenLight: '#E9F7EF' };

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();

// --- Notification registration ---
export const registerForNotifications = async () => {
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    const { status: newStatus } = await Notifications.requestPermissionsAsync();
    if (newStatus !== 'granted') {
      alert('Enable notifications to get expiration reminders!');
      return false;
    }
  }
  return true;
};

// ---- Header right logout button ----
function LogoutButton() {
  const { logout } = useAuth();
  const confirm = () =>
    Alert.alert('Sign out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: logout },
    ]);
  return (
    <TouchableOpacity onPress={confirm} style={{ paddingHorizontal: 12 }}>
      <Ionicons name="log-out-outline" size={22} color="#fff" />
    </TouchableOpacity>
  );
}

function MainTabs() {
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={BRAND.green} />
      <Tab.Navigator
        sceneContainerStyle={{ backgroundColor: 'transparent' }}
        screenOptions={{
          headerTitleAlign: 'center',
          headerStyle: { backgroundColor: BRAND.green },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '600' },
          headerRight: () => <LogoutButton />,
          tabBarStyle: {
            backgroundColor: BRAND.green,
            borderTopColor: BRAND.green,
            height: 64,
            paddingBottom: 8,
            paddingTop: 6,
          },
          tabBarLabelStyle: { fontSize: 12 },
          tabBarActiveTintColor: BRAND.greenLight,
          tabBarInactiveTintColor: '#b5d8b5',
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home-outline" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Add Item"
          component={AddItemScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="add-circle-outline" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Scan"
          component={BarcodeScannerScreen}
          options={{
            title: 'Scan Barcode',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="barcode-scan" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Profile"
          component={NotificationsScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person-outline" size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </>
  );
}

function AuthRoutes() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="SignIn" component={SignInScreen} />
      <AuthStack.Screen name="SignUp" component={SignUpScreen} />
    </AuthStack.Navigator>
  );
}

function RootNavigator() {
  const { user, loading } = useAuth();
  if (loading) return <SplashScreen />;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <Stack.Screen name="Auth" component={AuthRoutes} />
      ) : (
        <>
          <Stack.Screen name="Root" component={MainTabs} />
          <Stack.Screen
            name="DeleteItem"
            component={DeleteItemScreen}
            options={{ headerShown: true, title: 'Delete Item' }}
          />
          <Stack.Screen
            name="Preferences"
            component={PreferencesScreen}
            options={{
              headerShown: true,
              title: 'Preferences',
              headerStyle: { backgroundColor: BRAND.green },
              headerTintColor: '#fff',
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  useEffect(() => {
    // request notification permissions on app start
    registerForNotifications();
  }, []);

  return (
    <AuthProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
