import { useState } from "react";
import { Image, StyleSheet, View, Pressable, Text, ScrollView, ActivityIndicator } from "react-native";

export default function DisplayImages({ markers, setViewImage }) {

  const [loading, setLoading] = useState(false);
  const [enlargeImage, setEnlargeImage] = useState(false);
  const [imageSelected, setImageSelected] = useState(null);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.ImageContainer}
        contentContainerStyle={{
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
        horizontal={false}
      >
        {
          markers.map((marker, i) => {
            const source = { uri: marker.image };
            return (
              <View
                style={{
                  padding: 5,
                }}
                key={i}
              >
                <Pressable onPress={() => {
                  setEnlargeImage(true)
                  setImageSelected(source)
                }}>
                  <Image source={source}
                    // style={{ height: 500, width: 500, resizeMode: 'center' }} 
                    style={[
                      styles.Image,
                      {
                        width: i % 2 === 1 ? 150 : 95,
                        height: i % 2 === 1 ? 150 : 95,
                      },
                    ]}
                    resizeMode="center"
                    onLoadStart={() => setLoading(true)}
                    onLoadEnd={() => setLoading(false)}
                  />
                </Pressable>
                {loading && <ActivityIndicator color="green" size="large" />}
                {
                  enlargeImage ?
                    <Image source={imageSelected} style={{ height: 500, width: 500, resizeMode: 'contain' }}>
                    </Image> : null
                }
              </View>
            )

          })

        }
      </ScrollView>
      <Pressable style={styles.button} onPress={() => setViewImage(false)}>
        <Text style={styles.text}>Back</Text>
      </Pressable>
    </View>
  )

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    // paddingVertical: 10,
    // paddingHorizontal: 32,
    borderRadius: 30,
    backgroundColor: 'black',
  },
  text: {
    fontSize: 16,
    // lineHeight: 21,
    // fontWeight: 'bold',
    // letterSpacing: 0.25,
    color: 'white',
    width: "60%",
    padding: "3%"

  },
  ImageContainer: {
    marginHorizontal: 16,
    marginTop: 30,
    width: "100%",
  },
  Image: {
    shadowColor: "black",
    shadowOffset: {
      width: -10,
      height: 9,
    },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 5
  },
});