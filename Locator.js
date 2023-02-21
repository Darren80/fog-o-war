import * as Location from "expo-location";

export class Locator {

    constructor() {

    }

    // doLocationStuff() {
    //     const response = [];

    //     this.requestLocationPermissions();
    //     this.getCurrentPositionAsync();
    // }

    requestLocationPermissions() {
        return Location.requestForegroundPermissionsAsync()
            .then(({ status }) => {

                if (status !== "granted") {
                    console.log("Permission to access location was denied");
                    throw new Error("Permission to access location was denied");
                }

            })

        //ToDo: Make a modal to explain to the user why background permission is required.
        Location.requestBackgroundPermissionsAsync()
            .then(({ status }) => {

            });
    }

    getCurrentPositionAsync() {
        const maximumAgeOfLocationDataInMilliseconds = 60000;
        const minimumAccuracyOfLocationInMeters = 10;

        return Location.getLastKnownPositionAsync({
            maxAge: maximumAgeOfLocationDataInMilliseconds,
            requiredAccuracy: minimumAccuracyOfLocationInMeters
        })
            .then((locationObject) => {
                if (!locationObject) {
                    return Location.getCurrentPositionAsync({
                        enableHighAccuracy: true,
                    });
                } else {
                    return locationObject;
                }
            })




    }
}