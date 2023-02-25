import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { PROVIDER_GOOGLE, Polyline, Polygon, Geojson } from "react-native-maps";
import { IconButton , MD3Colors, Avatar } from 'react-native-paper'
import MapView from "react-native-maps";
import { TurfWorker } from "./turf";
import { Locator } from "./Locator";

import * as Location from "expo-location";

const home = ({navigation}) => {
  const [previousUserPosition, setpreviousUserPosition] = useState(null);
  const [currentUserPosition, setCurrentUserPosition] = useState(null);
  const [loggedIn, setLoggedIn] = useState(true)
  const [locationErrorMessage, setLocationErrorMessage] = useState(null);

  const [username, setUsername] = useState(null);
  const [fogPolygon, setFogPolygon] = useState(null);

  const turfWorker = new TurfWorker();

  useEffect(() => {

    //Save fog data to DB every minute

    Location.requestForegroundPermissionsAsync()
      .then(({ status }) => {

        if (status !== "granted") {
          console.log("Permission to access location was denied");
          throw new Error("Permission to access location was denied");
        }

      })
      .catch((err) => {
        setLocationErrorMessage(err);
      })

    //ToDo: Make a modal to explain to the user why background permission is required.
    Location.requestBackgroundPermissionsAsync()
      .then(({ status }) => {

      });

    Location.watchPositionAsync({
      accuracy: Location.Accuracy.High,
      distanceInterval: 10,
    }, (newUserLocation) => {
      setCurrentUserPosition(newUserLocation);
      // console.log(newUserLocation, '<-- newLocation');
      // console.log(!fogPolygon, '<-- !fogPolygon true/false', fogPolygon, '<-- fogPolygon');
    });

    //Get DATA from DB here,
    //If no previous data is available then generate new fog.

    //Uncover the fog of a new location when the user's position changes.


    const newFogPolygon = turfWorker.getFog(currentUserPosition);
    setFogPolygon(newFogPolygon);
  }, [])

  useEffect(() => {
    console.log(fogPolygon);
    if (!fogPolygon) {
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

  if (currentUserPosition) {
    return (
      <View style={styles.container}>

        {/* For debugging only, print the state with a button */}
        <Pressable style={styles.button} onPress={printState}>
          <Text style={styles.text}>Print React state</Text>
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
             onPress={()=> loggedIn? navigation.navigate('Profile') : navigation.navigate('SignIn')}
             />
            {/* <Avatar.Image size={24} source={'https://www.google.com/search?q=dog&rlz=1C1CHBF_en-GBGB991GB991&sxsrf=AJOqlzUbfns4rj4KgJIHlZgFvX__FUTesA:1677347401935&tbm=isch&source=iu&ictx=1&vet=1&fir=NN1-QGCky_XgzM%252CvL0suvKfyYaqHM%252C%252Fm%252F0bt9lr%253BOyQGKst6Lara3M%252CDj243kHCP9nJ-M%252C_%253BeQsdEWaZ6MHrQM%252C2prjuOFdTo6X8M%252C_%253BGbsqgMoKCwHzMM%252C65_J7MmDboKEcM%252C_%253BLdkDcR8aYOxQXM%252CsmcHwKUZvdWsaM%252C_&usg=AI4_-kQerRqCtAwxi4UQGOMadH6_xZ-OOQ&sa=X&ved=2ahUKEwjjqLqAnrH9AhWVFcAKHRx_BwYQ_B16BAh8EAE#imgrc=NN1-QGCky_XgzM'}/>
             :
             <IconButton
                iconColor={MD3Colors.error50}
                size={40}
                //onPress={()=> loggedIn? navigation.navigate('Profile') : navigation.navigate('SignIn')}
                onPress={()=> navigation.navigate('SignIn')}
                />  */}
        </View>
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
  navButton: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    top: '20%',
    left: '75%',
    alignSelf: 'flex-end',
    paddingHorizontal:0
  },
  text: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: 'bold',
    letterSpacing: 0.25,
    color: 'white',
  }
});


export default home;

