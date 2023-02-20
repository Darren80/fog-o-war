import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { PROVIDER_GOOGLE, Polyline, Polygon, Geojson } from "react-native-maps";
import turf from "@turf/turf";
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

/* const line = turf.lineString([
  [-1.6017298904997403, 53.80479853581707],
  [-1.568058581035217, 53.81433492617265],
  [-1.5298847127455986, 53.807341785372216],
  [-1.5403580560971193, 53.78745408568],
  [-1.4877955759136512, 53.798786605379604],
  [-1.499051972973632, 53.77415181590533],
  [-1.5750081826972746, 53.76113464536641],
  [-1.6189570720875395, 53.7819023466522],
]);

const radius = 100; // meters

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
 */
const turfCoOrds = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {},
      geometry: {
        type: "Polygon",
        coordinates: [
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
          [
            [-1.6204084261662106, 53.78217325908804],
            [-1.6203959329474011, 53.78160910667121],
            [-1.6199071835927454, 53.78119976535687],
            [-1.5759585596238745, 53.76043241159686],
            [-1.5746924151784052, 53.76025491141098],
            [-1.4981634328323887, 53.77342171864565],
            [-1.4975827705856382, 53.77391749167441],
            [-1.4862832367599024, 53.7986820601333],
            [-1.4863924203888272, 53.79913586196907],
            [-1.4868367919710905, 53.799485253940716],
            [-1.487507547507344, 53.799669689815914],
            [-1.4882463119038025, 53.799645621121286],
            [-1.5379908607867296, 53.78892254996656],
            [-1.5284198357709682, 53.807095767265565],
            [-1.5284353313398211, 53.80761797454176],
            [-1.5289396825295907, 53.80804703068227],
            [-1.5681700059828716, 53.8152318372308],
            [-1.6024223340135801, 53.80559951609734],
            [-1.603077027699326, 53.80521794755826],
            [-1.6032349904292207, 53.80466151176067],
            [-1.6029912740972945, 53.80429464918629],
            [-1.602472955121106, 53.804013538366235],
            [-1.6011391281052805, 53.803969641365235],
            [-1.5679388970914945, 53.81337149173191],
            [-1.531791586848616, 53.806749771438085],
            [-1.5418319956092392, 53.78767886959823],
            [-1.5417082075080362, 53.78703871563734],
            [-1.5408564253428154, 53.786604328271416],
            [-1.539835607812308, 53.78660939142748],
            [-1.4900303737788478, 53.79734814058928],
            [-1.500297981119482, 53.77487495103564],
            [-1.5746743465458966, 53.76212848464564],
            [-1.6180664188245202, 53.78263162084515],
            [-1.6189395987755095, 53.78280160768499],
            [-1.619849678672217, 53.78263078660137],
            [-1.6204084261662106, 53.78217325908804],
          ],
        ],
      },
    },
  ],
};

console.log(turfCoOrds);

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
