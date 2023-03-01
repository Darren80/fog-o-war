import React from 'react';
import { Button, View, StyleSheet } from 'react-native';
import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';

const LOCATION_TASK_NAME = 'background-location-task';

export function requestPermissions() {

    TaskManager.defineTask(LOCATION_TASK_NAME, ({ data, error }) => {
        if (error) {
            // Error occurred - check `error.message` for more details.
            return;
        }
        if (data) {
            const { locations } = data;
            //TODO: Track location even when app is in the background.
            // do something with the locations captured in the background
        }
    });

    return Location.requestForegroundPermissionsAsync()
        .then(({ status: foregroundStatus }) => {
            if (foregroundStatus === 'granted') {
                return Location.requestBackgroundPermissionsAsync();
            } else {
                console.log("Permission to access location was denied");
                throw new Error("Permission to access location was denied");
            }
        })
        .then(({ status: backgroundStatus }) => {
            if (backgroundStatus === 'granted') {
                //Will run expo-taskmanager if location changes while app is in the background
                Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
                    accuracy: Location.Accuracy.Highest,
                    deferredUpdatesDistance: 20,
                    deferredUpdatesInterval: 1000
                });
            } else {
                console.log("Permission to access location in the background was denied");
                throw new Error("Permission to access location in the background was denied");
            }
        })

    const PermissionsButton = () => (
        <View style={styles.container}>
            <Button onPress={requestPermissions} title="Enable background location" />
        </View>
    );
}


const styles = StyleSheet.create({

});