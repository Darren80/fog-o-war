import * as Location from "expo-location";

export class Locator {

    constructor() {

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