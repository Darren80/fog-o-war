import { useEffect, useState, useContext } from "react";

import { StatusBar } from "expo-status-bar";
import * as Location from "expo-location";

import { Pressable, StyleSheet, Text, View, Image } from "react-native";
import { PROVIDER_GOOGLE, Geojson, Marker } from "react-native-maps";
import MapView from "react-native-maps";
import { IconButton, MD3Colors, Avatar, Button } from "react-native-paper";

import ImageAdder from "./ImageAdder";

import { requestPermissions } from "./locationPermissions";
import { TurfWorker } from "./turf";
import API from "./APIs";
import { LocationAccuracy } from "expo-location";
import { LoggedInContext, UserContext } from "./App";
const api = new API();

function home({ navigation }) {
  const { user, setUser } = useContext(UserContext);
  const { loggedIn, setLoggedIn } = useContext(LoggedInContext);
  const [username, setUsername] = useState(null);
  const [userID, setUserID] = useState("test123");
  const turfWorker = new TurfWorker(userID);

  const [currentUserLocation, setCurrentUserLocation] = useState(null);

  const [locationErrorMessage, setLocationErrorMessage] = useState(null);

  const [fogPolygon, setFogPolygon] = useState(null);

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
    requestPermissions().catch((err) => {
      setLocationErrorMessage(err);
    });

    // GET trips from DB.
    api
      .getFogData(userID)
      .then((fogData) => {
        const newFogPolygon = turfWorker.rebuildFogPolygonFromFogData(fogData);
        setFogPolygon(newFogPolygon);
      })
      .catch(() => {
        const newFogPolygon = turfWorker.generateNewFogPolygon();
        setFogPolygon(newFogPolygon);
      })
      .finally(() => {
        //Will change current position when location changes while app is in the foreground.
        Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Highest,
            distanceInterval: 20,
          },
          (newUserLocation) => {
            setCurrentUserLocation(newUserLocation);
          }
        );
      });
  }, []);

  //Runs every time the user's current location changes.
  useEffect(() => {
    if (!currentUserLocation) {
      return;
    }

    uncoverFog();

    // console.log(newPartialFogData, '<-- parital fog data to save to local storage, then send to db after x time');

    //TODO: Write fog data to local storage. ------------------------------------------

    //TODO: Write fog data to database after set amount of time e.g. every minute. ---------------------------------------------
    //TODO: Reset fog data in local storage after database 200 OK. ---------------------------------------------
  }, [currentUserLocation]);

  const uncoverFog = (userHeightAboveGround) => {
    if (userHeightAboveGround) {
      //expand the circle more when the user is higher up.
      const circleMultiplyer = Math.ceil(userHeightAboveGround / 5);
      turfWorker.circleSize = turfWorker.circleSize * circleMultiplyer;
    }

    //Check overlapping

    //Uncover new area in fog
    const { newFogPolygon, newPartialFogData } = turfWorker.uncoverFog(
      currentUserLocation,
      fogPolygon,
      partialFogData
    );
    const newFogPolygon2 = turfWorker.fixFog(newFogPolygon);
    setFogPolygon(newFogPolygon2);
    //Object to be saved in localstorage for later sending to db.
    setPartialFogData(newPartialFogData);
  };

  const markerPositionSelected = (e) => {
    const markerPosition = e.nativeEvent.coordinate;

    const checkUserWithinPolygon = turfWorker.checkUserPointsWithinPolygon(
      markerPosition,
      fogPolygon
    );

    if (checkUserWithinPolygon) {
      setPointsWithinPolygon(true);
      setMarkers([
        ...markers,
        {
          coords: markerPosition,
        },
      ]);
    }
  };

  const getCurrentElevation = () => {
    //Get current elevation according to GPS.
    Location.getCurrentPositionAsync({
      accuracy: LocationAccuracy.BestForNavigation,
    })
      .then((newUserLocation) => {
        const currentLatitude = newUserLocation.coords.latitude;
        const currentLongitude = newUserLocation.coords.longitude;

        setCurrentUserLocation(newUserLocation);

        return Promise.all([
          api.getElevation(currentLatitude, currentLongitude),
          newUserLocation,
        ]);
      })
      .then((data) => {
        const elevationResponse = data[0];
        const newUserLocation = data[1];

        const currentAltitude = newUserLocation.coords.altitude;
        const currentAltitudeAccuracy = newUserLocation.coords.altitudeAccuracy;

        const userHeightAboveGround =
          currentAltitude - elevationResponse.results[0].elevation;

        console.log("accuracy: ", currentAltitudeAccuracy, "m");
        console.log(
          "user height above ground sea level: ",
          currentAltitude,
          "m"
        );
        console.log(
          "height of ground above sea level: ",
          elevationResponse.results[0].elevation,
          "m"
        );
        console.log("user is ", userHeightAboveGround, "m above ground level.");

        if (userHeightAboveGround >= 0) {
          uncoverFog(userHeightAboveGround);
        }
      });
  };

  const handleClick = (e) => {
    e.preventDefault();
    navigation.navigate("SignIn");
  };

  if (loggedIn === false) {
    return (
      <View>
        <Button
          style={styles.Buttons}
          mode="contained"
          onPress={(e) => handleClick(e)}
        >
          Please log in
        </Button>
      </View>
    );
  }

  if (locationErrorMessage) {
    return (
      <View style={styles.container}>
        {/* <Text style={styles.paragraph}>{errorMsg}</Text> */}
      </View>
    );
  }

  if (!currentUserLocation) {
    return (
      <View style={styles.container}>
        <Text style={styles.paragraph}>
          Loading location...{currentUserLocation}
        </Text>
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

  //TODO: Put button at bottom of map.
  const ElevationButton = () => (
    <View style={styles.container}>
      <Button onPress={getCurrentElevation} compact={true}>
        Reveal fog based on elevation
      </Button>
    </View>
  );

  if (currentUserLocation) {
    return (
      <View style={styles.container}>
        <Text>Fog-Of-War</Text>
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
          {pointsWithingPolygon
            ? markers.map((marker, i) => (
                <Marker
                  coordinate={marker.coords}
                  key={i}
                  onPress={() => {
                    setClickMarker((current) => !current);
                    setImageAdded((current) => !current);
                  }}
                >
                  {imageAdded ? (
                    <Image
                      source={{ uri: marker.image }}
                      style={{ width: 30, height: 30 }}
                    />
                  ) : null}
                </Marker>
              ))
            : null}

          {fogPolygon ? (
            <Geojson
              geojson={{
                features: [fogPolygon],
              }}
              fillColor="rgba(118,	119,	121	, 0.85)"
              strokeColor="rgba(218, 223, 225, 1)"
              strokeWidth={4}
            ></Geojson>
          ) : null}
        </MapView>

        <ElevationButton />

        <View style={styles.navButton}>
          <IconButton
            icon="account"
            iconColor={MD3Colors.error50}
            style={styles.navButton}
            size={40}
            onPress={() =>
              loggedIn === true
                ? navigation.navigate("Profile")
                : navigation.navigate("SignIn")
            }
          />
          <StatusBar style="auto" />
        </View>

        {clickMarker ? (
          <ImageAdder setMarkers={setMarkers} setImageAdded={setImageAdded} />
        ) : null}
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
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 4,
    elevation: 3,
    backgroundColor: "black",
  },
  navButton: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    top: "20%",
    left: "75%",
    alignSelf: "flex-end",
    paddingHorizontal: 0,
  },
  text: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "bold",
    letterSpacing: 0.25,
    color: "white",
    width: "88%",
    height: "88%",
  },
  Buttons: {
    width: 200,
    top: "40%",
    margin: 5,
    alignItems: "center",
    left: "25%",
  },
});

export default home;
