import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { StyleSheet, Text, View, Pressable } from "react-native";

export default function ImageAdder({ setImageAdded, setMarkers, imageAdded, setViewImage, markers }) {

    const [deleteImage, setDeleteImage] = useState(null);

    const pickImage = async () => {
    // No permissions request is necessary for launching the image library

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImageAdded(true);
          setMarkers((currMarker) => {
          
            const position = currMarker.length - 1;

            currMarker[position]['image'] = result.assets[0].uri;

            return currMarker;    
          });   

      setDeleteImage(result.assets[0].uri);
    }
  };

    const openCamera = async () => {
    // Ask the user for the permission to access the camera
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      alert("You've refused to allow this app to access your camera!");
      return;
        }

    const result = await ImagePicker.launchCameraAsync();

    if (!result.canceled) {
      setImageAdded(true);
          setMarkers((currMarker) => {

            const position = currMarker.length - 1;

            currMarker[position]['image'] = result.assets[0].uri;

            return currMarker;    
          });
          
          setDeleteImage(result.assets[0].uri);
        }
    };

    const removeImage = () => {
      const filteredImage = markers.filter((marker) => {
        return marker.image !== deleteImage;
      })
      setMarkers(filteredImage);
      setImageAdded(false);
    }

    return (
      <>
      {
        imageAdded ?
        <View style={styles.buttonContainer}>
        <Pressable style={styles.appButtonContainer} onPress={removeImage}>
          <Text style={styles.appButtonText}>Remove Image</Text>
        </Pressable>
        <Pressable style={styles.appButtonContainer} onPress={() => setViewImage(true)}>
          <Text style={styles.appButtonText}>View Image</Text>
        </Pressable>
        </View>
      :
      <View style={styles.buttonContainer}>
      <Pressable style={styles.appButtonContainer} onPress={pickImage}>
        <Text style={styles.appButtonText}>Pick Image</Text>
      </Pressable>
      <Pressable style={styles.appButtonContainer} onPress={openCamera}>
        <Text style={styles.appButtonText}>Open Camera</Text>
      </Pressable>
   </View>
  }
      </>
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
    borderRadius: 50,
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
  },
  appButtonContainer: {
    elevation: 5,
    backgroundColor: "#009688",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 7,
    marginHorizontal: 4,
    marginBottom: 6,
    marginTop: 5,
    width: '40%'
  },
  appButtonText: {
    fontSize: 10,
    color: "#fff",
    fontWeight: "bold",
    alignSelf: "center",
    textTransform: "uppercase"
  }
});

