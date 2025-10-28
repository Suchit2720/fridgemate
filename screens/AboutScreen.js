import { View, Text, Button } from 'react-native';
import { globalStyles } from '../components/globalStyles';
import RadiantBackground from '../components/RadiantBackground';

export default function AboutScreen({ navigation }) {
  return (
    <View style={{ flex: 1 }}>
      {/* 👇 Radiant background sits behind everything */}
      <RadiantBackground />
      
      <View style={[globalStyles.container, globalStyles.background]}>
      <Text style={globalStyles.title}>About This App</Text>
      <Text style={globalStyles.text}>
        FridgeMate lets you add, remove, and track fridge items.
        Scan barcodes to add groceries instantly.
      </Text>

      <View style={globalStyles.buttons}>
        <Button title="Go Back" onPress={() => navigation.goBack()} />
      </View>
      </View>
    </View>
  );
}