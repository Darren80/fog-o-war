import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { PROVIDER_GOOGLE } from 'react-native-maps';
import MapView from 'react-native-maps';

export default function App() {
  return (
    <View style={styles.container}>
      <Text>Open up App.js to start working on your app! A Change.</Text>
      <MapView provider={PROVIDER_GOOGLE} style={styles.map} />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    width: '100%',
    height: '100%',
  },
});
