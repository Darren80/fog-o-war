import { useEffect, useState } from "react";
import { StyleSheet, Text, View, Image } from "react-native";
import { PROVIDER_GOOGLE, Geojson, Marker } from "react-native-maps";

import MapView from "react-native-maps";
import { TurfWorker } from "./turf";
import { Locator } from "./Locator";

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
      });

      //Get DATA from DB here,
      //If no previous data is available then generate new fog.

      //Uncover the fog of a new location when the user's position changes.

  }, []);

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
        <Text>Fog-Of-War</Text>
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
  }
});
