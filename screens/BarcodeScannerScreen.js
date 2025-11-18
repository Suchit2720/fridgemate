// screens/BarcodeScannerScreen.js
import { useState, useCallback } from 'react';
import {
  View,
  Text,
  Button,
  Alert,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { ref, uploadString } from 'firebase/storage';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { globalStyles } from '../components/globalStyles';
import RadiantBackground from '../components/RadiantBackground';
import { auth, db, storage } from '../src/lib/firebase';

const OPEN_FOOD_API = 'https://world.openfoodfacts.org/api/v0/product';

const formatDate = (date) => {
  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const year = String(d.getFullYear()).slice(2);
  return `${month}/${day}/${year}`;
};

const productIsLikelyEdible = (product) => {
  const tags = product?.categories_tags || [];
  const keywords = [
    'food',
    'beverage',
    'drink',
    'snack',
    'meal',
    'fruit',
    'vegetable',
    'dairy',
  ];

  return (
    tags.some((tag) =>
      keywords.some((keyword) => tag.toLowerCase().includes(keyword))
    ) || Boolean(product?.ingredients_text)
  );
};

const buildDetailSnippet = (product) => {
  const details = [];

  if (product?.brands) details.push(product.brands.split(',')[0].trim());
  if (product?.categories)
    details.push(product.categories.split(',').slice(0, 2).join(', ').trim());
  if (product?.ingredients_text)
    details.push(product.ingredients_text.replace(/<[^>]+>/g, ' ').trim());

  return details.filter(Boolean).join(' • ');
};

export default function BarcodeScannerScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [productInfo, setProductInfo] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [expiryDate, setExpiryDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const resetScanner = () => {
    setModalVisible(false);
    setProductInfo(null);
    setExpiryDate(new Date());
    setShowPicker(false);
    setScanned(false);
  };

  // --- SCANNER LOGIC ---
  const handleBarCodeScanned = useCallback(
    async ({ data }) => {
      if (scanned || loadingProduct) return;

      setScanned(true);
      setLoadingProduct(true);

      try {
        const response = await fetch(`${OPEN_FOOD_API}/${data}.json`);
        if (!response.ok) throw new Error('Unable to reach product database.');

        const payload = await response.json();
        if (payload.status !== 1 || !payload.product) {
          throw new Error('No product details found for this barcode.');
        }

        if (!productIsLikelyEdible(payload.product)) {
          Alert.alert(
            'Not an edible item',
            'This barcode is not recognised as food or drink.'
          );
          resetScanner();
          return;
        }

        setProductInfo({
          barcode: data,
          name:
            payload.product.product_name ||
            payload.product.generic_name ||
            `Barcode ${data}`,
          brand: payload.product.brands || '',
          details: buildDetailSnippet(payload.product),
        });

        setModalVisible(true);
      } catch (error) {
        Alert.alert(
          'Scan Error',
          error.message || 'Unable to process this barcode.'
        );
        setScanned(false);
      } finally {
        setLoadingProduct(false);
      }
    },
    [scanned, loadingProduct]
  );

  // --- SAVE ITEM TO FIREBASE ---
  const saveScannedItem = async () => {
    if (!productInfo) return;

    const uid = auth.currentUser?.uid;
    if (!uid) {
      Alert.alert('Sign in required', 'Please sign in to save scanned items.');
      return;
    }

    try {
      const firestorePayload = {
        name: productInfo.name,
        details: productInfo.details || null,
        brand: productInfo.brand || null,
        barcode: productInfo.barcode,
        unit: 'pcs',
        exactAmount: 1,
        expiration: formatDate(expiryDate),
        createdAt: serverTimestamp(),
        source: 'barcode',
      };

      const docRef = await addDoc(
        collection(db, `users/${uid}/items`),
        firestorePayload
      );

      const storagePayload = {
        ...firestorePayload,
        savedAt: new Date().toISOString(),
      };

      const storageRef = ref(storage, `users/${uid}/items/${docRef.id}.json`);
      await uploadString(storageRef, JSON.stringify(storagePayload), 'raw', {
        contentType: 'application/json',
      });

      Alert.alert('Item saved', `${productInfo.name} added to your fridge.`);
      resetScanner();
    } catch (error) {
      Alert.alert(
        'Save failed',
        error.message || 'Unable to store this item right now.'
      );
    }
  };

  // --- PERMISSION STATES ---
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

  // --- MAIN UI ---
  return (
    <View style={{ flex: 1 }}>
      <RadiantBackground />

      <CameraView
        style={StyleSheet.absoluteFill}
        barcodeScannerSettings={{
          barcodeTypes: ['qr', 'ean13', 'ean8', 'upc_e', 'upc_a', 'code128'],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />

      {loadingProduct && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Looking up product…</Text>
        </View>
      )}

      <View
        style={[
          StyleSheet.absoluteFill,
          { justifyContent: 'flex-end', alignItems: 'center', padding: 16 },
        ]}
      >
        <View style={globalStyles.buttons}>
          {scanned && !modalVisible && (
            <Button title="Scan Again" onPress={resetScanner} />
          )}
          <Button title="Go Back" onPress={() => navigation.goBack()} />
        </View>
      </View>

      {/* PRODUCT MODAL */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{productInfo?.name}</Text>

            {productInfo?.details ? (
              <Text style={styles.modalSubtitle} numberOfLines={3}>
                {productInfo.details}
              </Text>
            ) : null}

            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowPicker(true)}
            >
              <Text style={styles.dateText}>
                Expiration Date:{' '}
                <Text style={styles.dateValue}>{formatDate(expiryDate)}</Text>
              </Text>
            </TouchableOpacity>

            {showPicker && (
              <DateTimePicker
                value={expiryDate}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowPicker(false);
                  if (selectedDate) setExpiryDate(selectedDate);
                }}
              />
            )}

            <View style={styles.modalActions}>
              <View style={styles.actionButton}>
                <Button title="Save to Fridge" onPress={saveScannedItem} />
              </View>
              <View style={styles.actionButton}>
                <Button title="Scan Another" onPress={resetScanner} />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#102515',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#63c57a',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  modalSubtitle: {
    color: '#cfead5',
    marginBottom: 16,
  },
  dateButton: {
    padding: 12,
    backgroundColor: '#1b3a24',
    borderRadius: 12,
    marginBottom: 16,
  },
  dateText: {
    color: '#fff',
    fontWeight: '600',
  },
  dateValue: {
    color: '#90e4a9',
  },
  modalActions: {
    width: '100%',
  },
  actionButton: {
    marginBottom: 10,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  loadingText: {
    color: '#fff',
    marginTop: 12,
    fontWeight: '600',
  },
});
