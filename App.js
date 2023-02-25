import { useEffect, useState } from "react";
import { StyleSheet, Text, View, Image } from "react-native";
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
  
  const [markers, setMarkers] = useState([]);
  const [clickMarker, setClickMarker] = useState(false);
  const [imageAdded, setImageAdded] = useState(false);

  const [pointsWithingPolygon, setPointsWithinPolygon] = useState(false);

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
  
  // console.log('----------------------------------------');
  // console.log(markers, '<-- markers');
  // console.log(clickMarker, '<-- clickMarker');
  // console.log(imageAdded, '<-- imageAdded');
  // console.log('----------------------------------------');

  console.log('----------------------------------------');
  console.log(pointsWithingPolygon, '<-- pointsWithingPolygon');
  // console.log(clickMarker, '<-- clickMarker');
  // console.log(imageAdded, '<-- imageAdded');
  console.log('----------------------------------------');

  const markerPositionSelected = (e) => {
    
    const markerPosition = e.nativeEvent.coordinate;

    const checkUserWithinPolygon = turfWorker.checkUserPointsWithinPolygon(markerPosition,revealedFog);

    if(checkUserWithinPolygon) {
      setPointsWithinPolygon(true);
      setMarkers([...markers,{
        coords: markerPosition
      }]);
    }      
  }

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
          onPress={(e) => markerPositionSelected(e)}
        >
          {
            pointsWithingPolygon ?
            (
              markers.map((marker, i) => (
              <Marker 
              coordinate={marker.coords} 
              key={i}
              onPress={() => {
                setClickMarker(current => !current);
                setImageAdded(current => !current);
              }}>
                {
                  imageAdded ? 
                  <Image source={{uri: marker.image}} style={{width: 30, height: 30}} />
                 : null
                }
              </Marker>
            ))
            ) : null
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
              <ImageAdder setMarkers={setMarkers} setImageAdded={setImageAdded}/>: null
  
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
