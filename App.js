import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { PROVIDER_GOOGLE, Geojson, Marker } from "react-native-maps";

import MapView from "react-native-maps";
import { TurfWorker } from "./turf";
import { Locator } from "./Locator";

import * as Location from 'expo-location';
import ImageAdder from "./ImageAdder";

export default function App() {
  const [location, setLocation] = useState(null);
  const [locationErrorMessage, setLocationErrorMessage] = useState(null);
  const [revealedFog, setRevealedFog] = useState(null);
  
  const [marker, setMarker] = useState([]);
  const [clickMarker, setClickMarker] = useState(false);

  const locator = new Locator();
  const turfWorker = new TurfWorker();

  useEffect(() => {
    locator.requestLocationPermissions()
      .catch((err) => {
        setLocationErrorMessage(err);
      })

    locator.getCurrentPositionAsync()
      .then((newLocation) => {

        // console.log(newLocation, '<-- newLocation');
        setLocation(newLocation);

        const revealedFog = turfWorker.generateNewFog(newLocation);
        const revealedFog2 = turfWorker.uncoverFog(newLocation, revealedFog);

        setRevealedFog(revealedFog2);
      })
      .catch((err) => {
        console.log(err);
      })

      Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 10000, 
          distanceInterval: 1},
        (changedLocation) => {
          setLocation(changedLocation);

          const revealedFog2 = turfWorker.uncoverFog(changedLocation, revealedFog);

          setRevealedFog(revealedFog2);
        }
      );


      //Get DATA from DB here,
      //If no previous data is available then generate new fog.

      //Uncover the fog of a new location when the user's position changes.

  }, [])
  console.log(marker, '<-- marker');

  if (locationErrorMessage) {
    return (
      <View style={styles.container}>
        <Text style={styles.paragraph}>{errorMsg}</Text>
      </View>
    );
  }

  if (!location) {
    return (
      <View style={styles.container}>
        <Text style={styles.paragraph}>Loading location...{location}</Text>
      </View>
    );
  }

  if (location) {
    return (
      <View style={styles.container}>
                      {/* <View style={styles.buttonContainer}> */}
   
   {/* <Pressable style={styles.button} onPress={pickImage}>
     <Text style={styles.text}>Pick Image</Text>
   </Pressable>
   <Pressable style={styles.button} onPress={openCamera}>
     <Text style={styles.text}>Open Camera</Text>
   </Pressable> */}
   {/* </View> */}
        {/* <Text>Open up App.js to start working on your app! A Change.</Text> */}
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
          onPress={(e) => setMarker([...marker,{
            coords: e.nativeEvent.coordinate
          }])}
        >
          {
            marker.map((marker, i) => (
              <Marker 
              coordinate={marker.coords} 
              key={i}
              onPress={() => setClickMarker(true)}>
              </Marker>
            ))
          }
          {
            revealedFog ?
            (
              <Geojson
                geojson={{
                  features: [revealedFog]
                }}
                fillColor='rgba(0, 156, 0, 0.5)'
                strokeColor="green"
                strokeWidth={4}
              >
              </Geojson>
              )
              : null
          }
        </MapView>
        {
              
              clickMarker ?
              <ImageAdder/>: null
  
        }
      </View>
    );
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
    width: "88%",
    height: "88%",
  },
  buttonContainer: {
    flex:1, 
    flexDirection:'row',     
    alignItems:'flex-end',
    marginLeft: 50
  },
  button: {
    width:'40%',
    marginHorizontal: 10,
    marginBottom: 10,
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 4,
    elevation: 2,
    backgroundColor: 'black',
  },
  imageContainer: {
    padding: 30
  },
  text: {
    fontSize: 12,
    lineHeight: 15,
    fontWeight: 'bold',
    letterSpacing: 0.25,
    alignSelf: 'center',
    color: 'white',
  }
});
