import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { PROVIDER_GOOGLE, Polyline, Polygon, Geojson } from "react-native-maps";
import * as turf from "@turf/turf";
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
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  (async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      console.log("Permission to access location was denied");
      setErrorMsg("Permission to access location was denied");
      return;
    }

    let newLocation = await Location.getCurrentPositionAsync({
      enableHighAccuracy: true,
    });
    setLocation(newLocation);
  })();

  let text = "Waiting..";
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    text = JSON.stringify(location);
  }

  if (!location) {
    return (
      <View style={styles.container}>
        <Text style={styles.paragraph}>Loading location {location}</Text>
      </View>
    );
  }

  const line = turf.lineString([
    [-1.6017298904997403, 53.80479853581707],
    [-1.568058581035217, 53.81433492617265],
    [-1.5298847127455986, 53.807341785372216],
    [-1.5403580560971193, 53.78745408568],
    [-1.4877955759136512, 53.798786605379604],
    [-1.499051972973632, 53.77415181590533],
    [-1.5750081826972746, 53.76113464536641],
    [-1.6189570720875395, 53.7819023466522],
  ]);

  const radius = 50; // meters

  const options = {
    steps: 64, // number of points on the circle
    units: "meters", // radius units
  };

  const buffer = turf.buffer(line, radius, options);

  // Extract the coordinates of the outer ring of the buffer and use them to create a new Polygon
  const coordinates = buffer.geometry.coordinates[0];
  const polygon = turf.polygon([coordinates]);

  var options2 = { tolerance: 0.0001, highQuality: true };
  var simplified = turf.simplify(polygon, options2);

  var mask = turf.polygon([
    [
      [0, 90],
      [180, 90],
      [180, -90],
      [0, -90],
      [-180, -90],
      [-180, 0],
      [-180, 90],
      [0, 90],
    ],
  ]);
  var masked = turf.mask(simplified, mask);

  const turfCoOrds = {
    type: "FeatureCollection",
    features: [masked],
  };

  return (
    <View style={styles.container}>
      <Text>Open up App.js to start working on your app! A Change.</Text>
      <MapView
        initialRegion={{
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
      >
        <Geojson geojson={turfCoOrds} />
      </MapView>
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
