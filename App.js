import { useEffect, useState } from "react";

import { StatusBar } from "expo-status-bar";
import * as Location from "expo-location";
import * as TaskManager from 'expo-task-manager';

import { Pressable, StyleSheet, Text, View } from "react-native";
import { PROVIDER_GOOGLE, Polyline, Polygon, Geojson } from "react-native-maps";
import MapView from "react-native-maps";


import { requestPermissions } from "./locationPermissions";
import { TurfWorker } from "./turf";



const turfWorker = new TurfWorker();
export default function App() {
  // const [previousUserPosition, setpreviousUserPosition] = useState(null);
  // const [username, setUsername] = useState(null);

  const [currentUserPosition, setCurrentUserPosition] = useState(null);

  const [locationErrorMessage, setLocationErrorMessage] = useState(null);
  
  const [fogPolygon, setFogPolygon] = useState(null);

  useEffect(() => {

    //TODO: Decide how often the points data should be written to the database

    //ToDo: Make a modal to explain to the user why background permission is required.
    requestPermissions();
    
    Location.watchPositionAsync({
      accuracy: Location.Accuracy.Highest,
      distanceInterval: 20,
    }, (newUserLocation) => {
      setCurrentUserPosition(newUserLocation);
    });

  }, [])

  useEffect(() => {
    if (!fogPolygon) {
      const newFogPolygon = turfWorker.getFog(currentUserPosition);
      setFogPolygon(newFogPolygon);
      return;
    }

    const newFogPolygon = turfWorker.uncoverFog(currentUserPosition, fogPolygon);
    setFogPolygon(newFogPolygon);
  }, [currentUserPosition])


  if (locationErrorMessage) {
    return (
      <View style={styles.container}>
        <Text style={styles.paragraph}>{errorMsg}</Text>
      </View>
    );
  }

  if (!currentUserPosition) {
    return (
      <View style={styles.container}>
        <Text style={styles.paragraph}>Loading location...{currentUserPosition}</Text>
      </View>
    );
  }

  const PermissionsButton = () => (
    <View style={styles.container}>
      <Button onPress={requestPermissions} title="Enable background location" />
    </View>
  );

  if (currentUserPosition) {
    return (
      <View style={styles.container}>

        {/* For debugging only, print the state with a button */}
        <Pressable style={styles.button} onPress={printState}>
          <Text style={styles.text}>Print React state</Text>
        </Pressable>

        <Text>Open up App.js to start working on your app! A Change.</Text>
        <MapView
          initialRegion={{
            latitude: currentUserPosition.coords.latitude,
            longitude: currentUserPosition.coords.longitude,
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

          {
            fogPolygon ?
              <Geojson
                geojson={{
                  features: [fogPolygon]
                }}
                fillColor='rgba(0, 156, 0, 0.5)'
                strokeColor="green"
                strokeWidth={4}
              >

              </Geojson>
              : null
          }


        </MapView>
        <StatusBar style="auto" />
      </View>
    );
  }

  function printState() {
    console.log(fogPolygon, '<-- revealedCoords')
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  map: {
    width: "90%",
    height: "90%",
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 4,
    elevation: 3,
    backgroundColor: 'black',
  },
  text: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: 'bold',
    letterSpacing: 0.25,
    color: 'white',
  }
});
