// App.js
import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar, TouchableOpacity, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import HomeScreen from './screens/HomeScreen';
import AddItemScreen from './screens/AddItemScreen';
import BarcodeScannerScreen from './screens/BarcodeScannerScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import DeleteItemScreen from './screens/DeleteItemScreen';
import SplashScreen from './screens/SplashScreen';

import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import SignInScreen from './screens/SignInScreen';
import SignUpScreen from './screens/SignUpScreen';

const BRAND = { green: '#0B3D0B', greenLight: '#E9F7EF' };

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();

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
        screenOptions={({ route }) => ({
          headerTitleAlign: 'center',
          headerStyle: { backgroundColor: BRAND.green },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '600' },
          headerRight: () => <LogoutButton />,        // 👈 add button to every tab header
          tabBarStyle: {
            backgroundColor: BRAND.green,
            borderTopColor: BRAND.green,
            height: 64, paddingBottom: 8, paddingTop: 6,
          },
          tabBarLabelStyle: { fontSize: 12 },
          tabBarActiveTintColor: BRAND.greenLight,
          tabBarInactiveTintColor: '#b5d8b5',
          tabBarIcon: ({ color, size }) => {
            if (route.name === 'Home') return <Ionicons name="home-outline" size={size} color={color} />;
            if (route.name === 'Add Item') return <Ionicons name="add-circle-outline" size={size} color={color} />;
            if (route.name === 'Scan') return <MaterialCommunityIcons name="barcode-scan" size={size} color={color} />;
            if (route.name === 'Notifications') return <Ionicons name="notifications-outline" size={size} color={color} />;
            return null;
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Add Item" component={AddItemScreen} />
        <Tab.Screen name="Scan" component={BarcodeScannerScreen} options={{ title: 'Scan Barcode' }} />
        <Tab.Screen name="Notifications" component={NotificationsScreen} />
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
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}