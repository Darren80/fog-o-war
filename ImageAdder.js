import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { StyleSheet, Text, View, Pressable } from "react-native";

export default function ImageAdder({ setImageAdded, setMarkers }) {

    const pickImage = async () => {
    // No permissions request is necessary for launching the image library

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.canceled) {
      setImageAdded(true);
          setMarkers((currMarker) => {
          
            const position = currMarker.length - 1;

            currMarker[position]['image'] = result.assets[0].uri;

            return currMarker;    
          });   
    }
  };

    const openCamera = async () => {
    // Ask the user for the permission to access the camera
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      alert("You've refused to allow this appp to access your camera!");
      return;
        }

    const result = await ImagePicker.launchCameraAsync();

    // Explore the result
    console.log(result);

    if (!result.canceled) {
      setImageAdded(true);
          setMarkers((currMarker) => {
          
            const position = currMarker.length - 1;

            currMarker[position]['image'] = result.assets[0].uri;

            return currMarker;    
          });   
        }
    };

    return (
      <View style={styles.buttonContainer}>
      <Pressable style={styles.button} onPress={pickImage}>
        <Text style={styles.text}>Pick Image</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={openCamera}>
        <Text style={styles.text}>Open Camera</Text>
      </Pressable>
   </View>
    )

}

const styles = StyleSheet.create({
  buttonContainer: {
    flex:1, 
    flexDirection:'row',     
    alignItems:'flex-end',
    marginLeft: 10
  },
  button: {
    width:'40%',
    marginHorizontal: 10,
    marginBottom: 10,
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 4,
    elevation: 2,
    backgroundColor: 'black',
  },
  text: {
    fontSize: 12,
    lineHeight: 15,
    fontWeight: 'bold',
    letterSpacing: 0.25,
    alignSelf: 'center',
    color: 'white',
  }
});

