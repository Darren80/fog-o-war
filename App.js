import { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { PROVIDER_GOOGLE, Polyline, Polygon, Geojson } from "react-native-maps";
import * as Location from "expo-location";
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

  let points = [];

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
    points.push([location.coords.longitude, location.coords.latitude]);
    points.push([location.coords.longitude, location.coords.latitude]);
    text = JSON.stringify(location);
  }

  if (!location) {
    return (
      <View style={styles.container}>
        <Text style={styles.paragraph}>Loading location {location}</Text>
      </View>
    );
  }

  const line = turf.lineString(points);

  if (
    Math.abs(points[points.length - 1][0]) -
      Math.abs(location.coords.longitude) >=
      0.000001 ||
    Math.abs(points[points.length - 1][1]) -
      Math.abs(location.coords.latitude) >=
      0.000001
  ) {
    points.push([location.coords.longitude, location.coords.latitude]);
  }

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
      [0, 89],
      [179, 89],
      [179, -89],
      [0, -89],
      [-179, -89],
      [-179, 0],
      [-179, 89],
      [0, 89],
    ],
  ]);
  var masked = turf.mask(simplified, mask);
  masked.properties = {
    stroke: "#555555",
    "stroke-width": 2,
    "stroke-opacity": 1,
    fill: "#555555",
    "fill-opacity": 1,
  };
  const turfCoOrds = {
    type: "FeatureCollection",
    features: [masked],
  };
  console.log(JSON.stringify(masked));

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
        showsUserLocation={true}
        mapPadding={{
          top: 30,
        }}
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
