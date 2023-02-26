import { useEffect, useState } from "react";

import { StatusBar } from "expo-status-bar";
import * as Location from "expo-location";
import * as TaskManager from 'expo-task-manager';

import { Pressable, StyleSheet, Text, View } from "react-native";
import { PROVIDER_GOOGLE, Polyline, Polygon, Geojson } from "react-native-maps";
import MapView from "react-native-maps";
import { IconButton, MD3Colors, Avatar } from 'react-native-paper'


import { requestPermissions } from "./locationPermissions";
import { TurfWorker } from "./turf";
import API from "./models/model-apis";



const turfWorker = new TurfWorker();
function home({ navigation }) {
  const [username, setUsername] = useState(null);

  const [currentUserPosition, setCurrentUserPosition] = useState(null);

  const [locationErrorMessage, setLocationErrorMessage] = useState(null);

  const [fogPolygon, setFogPolygon] = useState(null);

  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    //Create new user
    const api = new API('bobby', 'password');
    api.postNewUser()
      .then((username) => { setUsername(username); console.log(username); })
      .catch((error) => {
        console.error(error);
      })

    //TODO: Decide how often the points data should be written to the database
    //TODO: Make a modal to explain to the user why background permission is required.

    requestPermissions()
      .catch((err) => {
        setLocationErrorMessage(err);
      })

    //Will run when location changes while app is in the foreground
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

  function printState() {
    const newFogPolygon = turfWorker.getFog(currentUserPosition);
    setFogPolygon(newFogPolygon);
  }

  if (currentUserPosition) {
    return (
      <View style={styles.container}>

        {/* For debugging only, print the state with a button */}
        <Pressable style={styles.button} onPress={printState}>
          <Text style={styles.text}>Reset fog</Text>
        </Pressable>

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
    }
  })


  export default home;