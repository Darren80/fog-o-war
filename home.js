import { useEffect, useState } from "react";

import { StatusBar } from "expo-status-bar";
import * as Location from "expo-location";
import * as TaskManager from 'expo-task-manager';

import { Pressable, StyleSheet, Text, View, Image } from "react-native";
import { PROVIDER_GOOGLE, Geojson, Marker } from "react-native-maps";
import MapView from "react-native-maps";
import { IconButton, MD3Colors, Avatar, Button } from 'react-native-paper'

import ImageAdder from "./ImageAdder";

import { requestPermissions } from "./locationPermissions";
import { TurfWorker } from "./turf";
import API from "./APIs";
const api = new API();


function home({ navigation }) {
  const [username, setUsername] = useState(null);
  const [userID, setUserID] = useState('test123');
  const turfWorker = new TurfWorker(userID);


  const [currentUserPosition, setCurrentUserPosition] = useState(null);

  const [locationErrorMessage, setLocationErrorMessage] = useState(null);

  const [fogPolygon, setFogPolygon] = useState(null);

  const [loggedIn, setLoggedIn] = useState(false);

  //Markers
  const [markers, setMarkers] = useState([]);
  const [clickMarker, setClickMarker] = useState(false);
  const [imageAdded, setImageAdded] = useState(false);
  const [pointsWithingPolygon, setPointsWithinPolygon] = useState(false);

  //Data to send via /trips/:trip_id
  const [partialFogData, setPartialFogData] = useState(null);

  //Runs once at the start of the program.
  useEffect(() => {
    //TODO: Make a MODAL to explain to the user why background permission is required.

    //Request both background and foreground location permissions.
    requestPermissions()
      .catch((err) => {
        setLocationErrorMessage(err);
      })

    // GET trips from DB.
    api.getFogData(userID)
      .then((fogData) => {
        const newFogPolygon = turfWorker.rebuildFogPolygonFromFogData(fogData)
        setFogPolygon(newFogPolygon);
      })
      .catch(() => {
        const newFogPolygon = turfWorker.generateNewFogPolygon();
        setFogPolygon(newFogPolygon);
      })
      .finally(() => {
        //Will change current position when location changes while app is in the foreground.
        Location.watchPositionAsync({
          accuracy: Location.Accuracy.Highest,
          distanceInterval: 20,
        }, (newUserLocation) => {
          setCurrentUserPosition(newUserLocation);
        });
      })

  }, [])

  //Runs every time the user's current location changes.
  useEffect(() => {
    if (!currentUserPosition) { return }

    //Uncover new area in fog
    const { newFogPolygon, newPartialFogData } = turfWorker.uncoverFog(currentUserPosition, fogPolygon, partialFogData);
    setFogPolygon(newFogPolygon);
    //Object to be saved in localstorage for later sending to db.
    setPartialFogData(newPartialFogData);

    console.log(newPartialFogData, '<-- parital fog data to save to local storage, then send to db after x time');


    //TODO: Write fog data to local storage. ------------------------------------------

    //TODO: Write fog data to database after set amount of time e.g. every minute. ---------------------------------------------
    //TODO: Reset fog data in local storage after database 200 OK. ---------------------------------------------

  }, [currentUserPosition])

  const markerPositionSelected = (e) => {
    const markerPosition = e.nativeEvent.coordinate;

    const checkUserWithinPolygon = turfWorker.checkUserPointsWithinPolygon(markerPosition, fogPolygon);

    if (checkUserWithinPolygon) {
      setPointsWithinPolygon(true);
      setMarkers([...markers, {
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

  if (!currentUserPosition) {
    return (
      <View style={styles.container}>
        <Text style={styles.paragraph}>Loading location...{currentUserPosition}</Text>
      </View>
    );
  }

  //TODO: Move this button to the profile page.
  const ResetFogButton = () => (
    <View style={styles.container}>
      <Button onPress={requestPermissions} compact={true}>
        {'Reset fog - Irreversible'}
      </Button>
    </View>
  );

  //TODO: Put button at bottom of map.
  const ElevationButton = () => (
    <View style={styles.container}>
      <Button onPress={requestPermissions} compact={true}>
        Reveal fog based on elevation
      </Button>
    </View>
  );

  if (currentUserPosition) {
    return (
      <View style={styles.container}>
        <Text>Fog-Of-War</Text>
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
                        <Image source={{ uri: marker.image }} style={{ width: 30, height: 30 }} />
                        : null
                    }
                  </Marker>
                ))
              ) : null
          }

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

        <ElevationButton/>

        <View style={styles.navButton}>
          <IconButton
            icon='account'
            iconColor={MD3Colors.error50}
            style={styles.navButton}
            size={40}
            onPress={() => loggedIn ? navigation.navigate('Profile') : navigation.navigate('SignIn')}
          />
          <StatusBar style="auto" />
        </View>

        {
          clickMarker ?
            <ImageAdder setMarkers={setMarkers} setImageAdded={setImageAdded} /> : null
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
  navButton: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    top: '20%',
    left: '75%',
    alignSelf: 'flex-end',
    paddingHorizontal: 0
  },
  text: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: 'bold',
    letterSpacing: 0.25,
    color: 'white',
    width: "88%",
    height: "88%"
  }
})


export default home;