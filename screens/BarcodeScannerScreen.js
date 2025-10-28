import { useState, useCallback } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { globalStyles } from '../components/globalStyles';
import RadiantBackground from '../components/RadiantBackground';

export default function BarcodeScannerScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  // ✅ Call this hook before any early return
  const handleBarCodeScanned = useCallback(({ type, data }) => {
    if (scanned) return;
    setScanned(true);
    Alert.alert('Barcode Scanned', `Type: ${type}\nData: ${data}`);
  }, [scanned]);

  if (!permission) {
    return (
      <View style={[globalStyles.container, globalStyles.background]}>
        <Text style={globalStyles.text}>Requesting camera permission…</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[globalStyles.container, globalStyles.background]}>
        <Text style={globalStyles.title}>Camera Access Needed</Text>
        <Text style={globalStyles.text}>
          FridgeMate needs your camera to scan barcodes and expiry dates.
        </Text>
        <View style={globalStyles.buttons}>
          <Button title="Grant Permission" onPress={requestPermission} />
          <Button title="Go Back" onPress={() => navigation.goBack()} />
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <CameraView
        style={{ flex: 1 }}
        barcodeScannerSettings={{
          barcodeTypes: ['qr', 'ean13', 'ean8', 'upc_e', 'upc_a', 'code128'],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />

      {/* 👇 Overlay the glow on top of the live camera */}
    <RadiantBackground />

      <View style={[globalStyles.center, { padding: 16 }]}>
        <View style={globalStyles.buttons}>
          {scanned && <Button title="Scan Again" onPress={() => setScanned(false)} />}
          <Button title="Go Back" onPress={() => navigation.goBack()} />
        </View>
      </View>
    </View>
  );
}