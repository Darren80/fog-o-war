import { useEffect, useState } from "react";

import { StatusBar } from "expo-status-bar";
import * as Location from "expo-location";
import * as TaskManager from 'expo-task-manager';

import { StyleSheet, Text, View, Image, Pressable, TouchableWithoutFeedback, ImageBackground } from "react-native";
import { PROVIDER_GOOGLE, Geojson, Marker } from "react-native-maps";
import MapView from "react-native-maps";
import { IconButton, MD3Colors, Avatar, Button, Card, Title, Paragraph } from 'react-native-paper'

import ImageAdder from "./ImageAdder";

import { requestPermissions } from "./locationPermissions";
import { TurfWorker } from "./turf";
import API from "./APIs";
import { center } from "@turf/turf";
import DisplayImages from "./DisplayImages";

import { LocationAccuracy } from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
const api = new API();


function home({ navigation }) {

  const [username, setUsername] = useState(null);
  const [userID, setUserID] = useState('1');
  const turfWorker = new TurfWorker(userID);


  const [currentUserLocation, setCurrentUserLocation] = useState(null);

  const [locationErrorMessage, setLocationErrorMessage] = useState(null);

  const [fogPolygon, setFogPolygon] = useState(null);

  const [loggedIn, setLoggedIn] = useState(true);

  const [elevationButtonText, setElevationButtonText] = useState('Reveal fog based on elevation');
  const [elevationButtonDisabled, setElevationButtonDisabled] = useState(false);
  const [maxSpeed, setMaxSpeed] = useState(20); //in mph

  const [showExcessSpeed, setShowExcessSpeed] = useState(false);

  const [savePartialFogData, setSavePartialFogData] = useState(false);

  //Markers
  const [markers, setMarkers] = useState([]);
  const [clickMarker, setClickMarker] = useState(false);
  const [markerClicks, setMarkerClicks] = useState(0);
  const [markerLimit, setMarkerLimit] = useState(0);
  const [imageAdded, setImageAdded] = useState(false);
  const [pointsWithinPolygon, setPointsWithinPolygon] = useState(false);
  const [removeMarker, setRemoveMarker] = useState(null);
  const [markerDeleteStatus, setMarkerDeleteStatus] = useState(false);

  const [viewImage, setViewImage] = useState(false);

  //Data to send via /trips/:trip_id
  const [partialFogData, setPartialFogData] = useState(null);

  //Runs once at the start of the program.
  useEffect(() => {
    //TODO: Make a MODAL to explain to the user why background permission is required.

    //Request both background and foreground location permissions.
    requestPermissions()
      .then(() => {
        console.log('Permissions granted');

        // GET trips from DB.
        api.getFogData(userID)
          .then((fogData) => {
            const newFogPolygon = turfWorker.rebuildFogPolygonFromFogData(fogData)
            setFogPolygon(newFogPolygon);
          })
          .catch((err) => {
            console.log('Couldn\'t get newest fog data: ', err);

            const newFogPolygon = turfWorker.generateNewFogPolygon();
            setFogPolygon(newFogPolygon);
          })
          .finally(() => {
            //Retrive background fog data if exists
            AsyncStorage.getItem('@partial_fog_data')
              .then((fogData) => {
                setPartialFogData(fogData !== null ? JSON.parse(fogData) : null);
              })

            //Will change current position when location changes while app is in the foreground.
            Location.watchPositionAsync({
              accuracy: Location.Accuracy.Highest,
              distanceInterval: 20,
            }, (newUserLocation) => {
              setCurrentUserLocation(newUserLocation);
            });
          })

      })
      .catch((err) => {
        setLocationErrorMessage(err);
      })

    //When true the app can tack on the fog data to the database.
    setInterval(() => {
      setSavePartialFogData(true);
    }, 10000);

  }, [])

  //Runs every time the user's current location changes.
  useEffect(() => {
    if (!currentUserLocation) { return }

    let maxMph = maxSpeed;
    let maxMetersPerSecond = maxMph / 2.237;
    //If the user's speed is above maxSpeed, then stop uncovering fog.
    if (currentUserLocation.coords.speed > maxMetersPerSecond) {
      console.log(currentUserLocation.coords.speed, '<-- Speed exceeds maximum!');
      setShowExcessSpeed(true);
      return;
    } else {
      setShowExcessSpeed(false);
    }

    uncoverFog();

    // console.log(partialFogData, '<-- parital fog data');
    // console.log(newPartialFogData, '<-- parital fog data to save to local storage, then send to db after x time');

    // console.log(newPartialFogData, '<-- parital fog data to save to local storage, then send to db after x time');
    //TODO: Write partial fog data to local storage, in case app closes. ------------------------------------------
    AsyncStorage

  }, [currentUserLocation])

  //Runs when savePartialFogData becomes true, i.e. every 10 seconds.
  useEffect(() => {
    //Save fog data to database every 'x' milliseconds.
    if (!partialFogData || !savePartialFogData) { return }
    setSavePartialFogData(false)

    console.log(partialFogData, '<-- parital fog data to save');

    api.postFogData(partialFogData)
      .then(() => {
        setPartialFogData(null)
      })
      .catch((err) => {
        console.log(err)
      })

  }, [savePartialFogData])

  //Runs every time the partial fog data is updated, i.e. when the user moves.
  useEffect(() => {
    AsyncStorage.setItem('@partial_fog_data', JSON.stringify(partialFogData))
      .catch(e => { console.log(e) })
  }, [partialFogData])

  const uncoverFog = (userHeightAboveGround) => {
    if (userHeightAboveGround) {
      //expand the circle more when the user is higher up.
      const circleMultiplyer = Math.ceil(userHeightAboveGround / 5);
      turfWorker.circleSize = turfWorker.circleSize * circleMultiplyer;
    }

    //Check overlapping


    //Uncover new area in fog
    const { newFogPolygon, newPartialFogData } = turfWorker.uncoverFog(currentUserLocation, fogPolygon, partialFogData);
    const newFogPolygon2 = turfWorker.fixFog(newFogPolygon);
    setFogPolygon(newFogPolygon2);
    //Object to be saved in localstorage for later sending to db.
    setPartialFogData(newPartialFogData);
  }

  const markerPositionSelected = (e) => {

    const markerPosition = e.nativeEvent.coordinate;

    const distance = turfWorker.distanceBetweenPoints(markerPosition, currentUserPosition);

    console.log(distance, '<-- distance');

    const checkUserWithinPolygon = turfWorker.checkUserPointsWithinPolygon(markerPosition, fogPolygon);


    if (checkUserWithinPolygon) {

      if (markerLimit < 3) {

        if (imageAdded === false)
          setMarkerClicks((currmarkerClicks) => currmarkerClicks + 1);

        if (markerClicks === 1) {
          setPointsWithinPolygon(true);
          setMarkers([...markers, {
            coords: markerPosition
          }]);
          setMarkerLimit((currLimit) => currLimit + 1);
        }

        else if (markerClicks > 1) {
          if (imageAdded || markerDeleteStatus) {
            setPointsWithinPolygon(true);
            setMarkers([...markers, {
              coords: markerPosition
            }]);
            setMarkerLimit((currLimit) => currLimit + 1);
          }
          setImageAdded(false);
        }
      }
      else {
        alert('You have reached maximum number of markers!');
      }



    }
  }

  // if (locationErrorMessage) {
  //   return (
  //     <View style={styles.container}>
  //       <Text style={styles.paragraph}>{locationErrorMessage}</Text>
  //     </View>
  //   );
  // }

  if (!currentUserPosition) {
    const getCurrentElevation = (e) => {

      //Get current elevation according to GPS.
      Location.getCurrentPositionAsync({
        accuracy: LocationAccuracy.BestForNavigation
      })
        .then((newUserLocation) => {
          const currentLatitude = newUserLocation.coords.latitude;
          const currentLongitude = newUserLocation.coords.longitude;

          setCurrentUserLocation(newUserLocation);

          return Promise.all([api.getElevation(currentLatitude, currentLongitude), newUserLocation])
        })
        .then((data) => {
          const elevationResponse = data[0];
          const newUserLocation = data[1];

          const currentAltitude = newUserLocation.coords.altitude;
          const currentAltitudeAccuracy = newUserLocation.coords.altitudeAccuracy;

          const userHeightAboveGround = currentAltitude - elevationResponse.results[0].elevation;

          console.log('---------------------------------');
          console.log('accuracy: ', currentAltitudeAccuracy, 'm');
          console.log('user height above ground sea level: ', currentAltitude, 'm');
          console.log('height of ground above sea level: ', elevationResponse.results[0].elevation, 'm');
          console.log('user is ', userHeightAboveGround, 'm above ground level.');
          console.log('---------------------------------');

          if (userHeightAboveGround >= 0) {
            uncoverFog(userHeightAboveGround);
          }

          //Display data to user through the button.
          setElevationButtonText('Your elevation is: ' + userHeightAboveGround.toPrecision(3) + 'm above ground')
          setElevationButtonDisabled(true)
          setTimeout(() => {
            setElevationButtonText('Reveal fog based on elevation')
            setElevationButtonDisabled(false)
          }, 4000)
        })

    }

    const myPic = require('./images/speedometer.jpg');
    const ExcessSpeedCard = () => {
      return (
        <View style={styles.excessSpeedCard}>
          {showExcessSpeed ?
            <Card>
              <Card.Content>
                <Title>Speed too fast</Title>
                <Paragraph>{`Fog motion will not be tracked when your speed exceeds ${maxSpeed}M/ph`}</Paragraph>
              </Card.Content>
              <Card.Cover source={{ uri: 'https://thumbs.dreamstime.com/b/speedometer-going-too-fast-11058210.jpg' }} />
            </Card>
            : <Text>FASFAFAF</Text>}
        </View>
      )
    }

    if (locationErrorMessage) {
      return (
        <View style={styles.container}>
          <Text style={styles.paragraph}>{errorMsg}</Text>
        </View>
      );
    }

    if (!currentUserLocation) {
      return (
        <View style={styles.container}>
          <Text style={styles.paragraph}>Loading location...{currentUserLocation}</Text>
        </View>
      );
    }

    //TODO: Move this button to the profile page.
    const ResetFogButton = () => {
      <View style={styles.container}>
        <Button onPress={requestPermissions} compact={true}>
          Reset fog - Irreversible
        </Button>
      </View>
    };

    const deleteMarker = () => {

      setMarkerDeleteStatus(true);

      setMarkerLimit((currMarkerLimit) => currMarkerLimit - 1);

      const filteredMarkers = markers.filter((marker) => {
        return marker.coords !== removeMarker;
      })
      setMarkers(filteredMarkers);
    }

    //TODO: Put button at bottom of map.
    // const ElevationButton = () => (
    //   <View style={styles.container}>
    //     <Button onPress={requestPermissions} compact={true}>
    //       Reveal fog based on elevation
    //     </Button>
    //   </View>
    // );
    // console.log(imageAdded, '<-- imageAdded');
    // console.log(clickMarker, '<-- clickMarker');
    const ElevationButton = () => (
      <View style={styles.container}>
        <Button onPress={getCurrentElevation} icon='access-point' mode="outlined" compact={true} disabled={elevationButtonDisabled}>
          {elevationButtonText}
        </Button>
      </View>
    );

    if (currentUserLocation) {
      return (
        <View style={styles.container}>
          <Text>Fog-Of-War</Text>
          {
            viewImage ?
              <DisplayImages markers={markers} setViewImage={setViewImage} /> :

              <MapView
                initialRegion={{
                  latitude: currentUserLocation.coords.latitude,
                  longitude: currentUserLocation.coords.longitude,
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
                  pointsWithinPolygon ?

                    markers.map((marker, i) => (
                      <Marker
                        coordinate={marker.coords}
                        key={i}
                        pinColor={'blue'}
                        onPress={() => {
                          setClickMarker(current => !current)
                          setRemoveMarker(marker.coords)
                        }}>
                        {
                          clickMarker ?
                            (imageAdded ?
                              <ImageBackground source={require('./assets/marker.png')} style={{ height: 80, resizeMode: 'cover' }}>
                                <Image source={{ uri: marker.image }} style={{ width: 50, height: 50, borderRadius: 25, resizeMode: 'contain' }} />
                              </ImageBackground>
                              :
                              <Image source={require('./assets/marker.gif')} style={{ height: 40, width: 30, resizeMode: 'contain' }} />
                            )
                            : null
                        }
                      </Marker>
                    )) : null
                }
                {
                  fogPolygon ?
                    <Geojson
                      geojson={{
                        features: [fogPolygon]
                      }}
                      fillColor='rgba(118,	119,	121	, 0.8)'
                      strokeColor="rgba(218, 223, 225, 1)"
                      strokeWidth={3}
                    >

                    </Geojson>
                    : null
                }
              </MapView>
          }
          <ElevationButton />

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

          <ExcessSpeedCard />

          {
            viewImage ?
              null :
              (clickMarker ?
                <ImageAdder setMarkers={setMarkers} setImageAdded={setImageAdded} imageAdded={imageAdded} setViewImage={setViewImage} markers={markers} /> : null)
          }
          {
            clickMarker ?
              <Pressable style={styles.deleteButton} onPress={deleteMarker}>
                <Text style={styles.text}>Remove Marker</Text>
              </Pressable> : null

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
    button: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      paddingHorizontal: 32,
      borderRadius: 4,
      elevation: 3,
      backgroundColor: 'black',
    },
    deleteButton: {
      alignItems: 'center',
      justifyContent: 'center',
      // paddingVertical: 12,
      paddingHorizontal: 32,
      borderRadius: 50,
      elevation: 3,
      backgroundColor: 'red',
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
    excessSpeedCard: {
      position: 'absolute',
      top: '25%',
      left: '0%',
    },
    text: {
      fontSize: 16,
      // lineHeight: 21,
      fontWeight: 'bold',
      letterSpacing: 0.25,
      color: 'white',
      // width: "88%",
      // height: "88%"
    }
  })
}

export default home