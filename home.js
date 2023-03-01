import { useEffect, useState } from "react";

import { StatusBar } from "expo-status-bar";
import * as Location from "expo-location";
import * as TaskManager from 'expo-task-manager';

import { StyleSheet, Text, View, Image, Pressable, TouchableWithoutFeedback, ImageBackground } from "react-native";
import { PROVIDER_GOOGLE, Geojson, Marker } from "react-native-maps";
import MapView from "react-native-maps";
import { IconButton, MD3Colors, Button } from 'react-native-paper';

import ImageAdder from "./ImageAdder";

import { requestPermissions } from "./locationPermissions";
import { TurfWorker } from "./turf";
import API from "./APIs";
import { center } from "@turf/turf";
import DisplayImages from "./DisplayImages";

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

    // console.log(newPartialFogData, '<-- parital fog data to save to local storage, then send to db after x time');


    //TODO: Write fog data to local storage. ------------------------------------------

    //TODO: Write fog data to database after set amount of time e.g. every minute. ---------------------------------------------
    //TODO: Reset fog data in local storage after database 200 OK. ---------------------------------------------

  }, [currentUserPosition]);

  const markerPositionSelected = (e) => {

    const markerPosition = e.nativeEvent.coordinate;

    const distance = turfWorker.distanceBetweenPoints(markerPosition, currentUserPosition);

    console.log(distance, '<-- distance');

    const checkUserWithinPolygon = turfWorker.checkUserPointsWithinPolygon(markerPosition, fogPolygon);

    
      if (checkUserWithinPolygon) {

        if(markerLimit < 3) {

          if(imageAdded === false) 
          setMarkerClicks((currmarkerClicks) => currmarkerClicks + 1);
        
          if(markerClicks === 1) {
            setPointsWithinPolygon(true);
            setMarkers([...markers, {
              coords: markerPosition
            }]);
              setMarkerLimit((currLimit) => currLimit + 1);
          }
        
          else if(markerClicks > 1) {
            if(imageAdded || markerDeleteStatus) {
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
        Reset fog - Irreversible
      </Button>
    </View>
  );

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

  if (currentUserPosition) {
    return (
      <View style={styles.container}>
        <Text>Fog-Of-War</Text>
        {
            viewImage ? 
            <DisplayImages markers={markers} setViewImage={setViewImage} /> : 
        
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
            pointsWithinPolygon ?
            
              markers.map((marker, i) => (
               <Marker
                  coordinate={marker.coords}
                  key={i}
                  pinColor={'blue'}
                  onPress={() => 
                  {
                    setClickMarker(current => !current)
                    setRemoveMarker(marker.coords)
                  }}>
                    {
                      clickMarker ?
                      (imageAdded ?
                        <ImageBackground source={require('./assets/marker.png')} style={{ height: 80, resizeMode: 'cover' }}>
                      <Image source={{ uri: marker.image }} style={{ width: 50, height: 50, borderRadius: 25, resizeMode: 'contain' }}/>
                      </ImageBackground>          
                      :
                      <Image source={require('./assets/marker.gif')} style={{ height: 40, width: 30, resizeMode: 'contain' }}/>
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
                fillColor='rgba(0, 156, 0, 0.5)'
                strokeColor="green"
                strokeWidth={4}
              >

              </Geojson>
              : null
          }
        </MapView>
  }
        {/* <ElevationButton/> */}

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
          viewImage ?
          null : 
          (clickMarker ?
            <ImageAdder setMarkers={setMarkers} setImageAdded={setImageAdded} imageAdded={imageAdded} setViewImage={setViewImage} markers={markers}/> : null)
        }
        {
          loggedIn ?
          (clickMarker ?
          <Pressable style={styles.deleteButton} onPress={deleteMarker}>
            <Text style={styles.text}>Remove Marker</Text>
          </Pressable> : null)
          : null
       
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


export default home;