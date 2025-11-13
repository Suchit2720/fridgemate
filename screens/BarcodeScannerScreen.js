// screens/BarcodeScannerScreen.js
import { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, Button, Alert, StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { auth, db, storage } from '../src/lib/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function BarcodeScannerScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const cameraRef = useRef(null);
  const isMounted = useRef(true);

  useEffect(() => () => { isMounted.current = false; }, []);

  // accept only numeric EAN/UPC (8–14 digits). Reject URLs & QR links.
  const isProductBarcode = (s) => /^\d{8,14}$/.test(s);

  const handleBarCodeScanned = useCallback(async ({ type, data }) => {
    if (scanned) return;
    setScanned(true);

    // 1) filter out URLs / QR text
    if (data.includes('://') || !isProductBarcode(data)) {
      Alert.alert('Not a product barcode',
        'This looks like a QR/URL or a non-food code. Try a product UPC/EAN.');
      setTimeout(() => setScanned(false), 600);
      return;
    }

    try {
      // 2) take a photo
      const photo = await cameraRef.current?.takePictureAsync({ quality: 0.7 });
      if (!isMounted.current) return;

      // 3) upload photo to Storage
      const uid = auth.currentUser?.uid;
      if (!uid) throw new Error('You must be signed in.');
      const fileName = `${Date.now()}_${data}.jpg`;
      const storageRef = ref(storage, `users/${uid}/items/${fileName}`);

      const resp = await fetch(photo.uri);
      const blob = await resp.blob();
      await uploadBytes(storageRef, blob);
      const imageUrl = await getDownloadURL(storageRef);

      // 4) save Firestore doc
      await addDoc(collection(db, `users/${uid}/items`), {
        barcode: data,
        name: `Item ${data}`,        // later: replace with OpenFoodFacts name
        imageUrl,
        createdAt: serverTimestamp(),
        kind: 'food',
      });

      // 5) go back (Home will live-update)
      Alert.alert('Saved ✅', `Barcode: ${data}`);
      navigation.navigate('Home');
      setTimeout(() => setScanned(false), 400);
    } catch (err) {
      if (isMounted.current) Alert.alert('Scan error', String(err.message || err));
      setTimeout(() => setScanned(false), 600);
    }
  }, [scanned, navigation]);

  if (!permission) {
    return <View style={styles.center}><Text>Requesting camera permission…</Text></View>;
  }
  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text>FridgeMate needs your camera to scan barcodes.</Text>
        <Button title="Grant Permission" onPress={requestPermission} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128'] }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />
    </View>
  );
}

const styles = {
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
};