import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { PROVIDER_GOOGLE, Polyline, Polygon, Geojson } from "react-native-maps";
import MapView from "react-native-maps";

let worldPolygonCoordinates = [
  { latitude: 85, longitude: 90 },
  { latitude: 85, longitude: 0.1 },
  { latitude: 85, longitude: -90 },
  { latitude: 85, longitude: -179.9 },
  { latitude: 0, longitude: -179.9 },
  { latitude: -85, longitude: -179.9 },
  { latitude: -85, longitude: 90 },
  { latitude: -85, longitude: 0.1 },
  { latitude: -85, longitude: 90 },
  { latitude: -85, longitude: 179.9 },
  { latitude: 0, longitude: 179.9 },
  { latitude: 85, longitude: 179.9 },
];

export default function App() {
  return (
    <View style={styles.container}>
      <Text>Open up App.js to start working on your app! A Change.</Text>
      <MapView
        initialRegion={{
          latitude: 51.560609,
          longitude: 0.153528,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
      ></MapView>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  map: {
    width: "100%",
    height: "100%",
  },
});
