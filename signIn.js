import * as React from "react";
import { StyleSheet, Text, View } from "react-native";
import { TextInput, Button } from "react-native-paper";
import * as WebBrowser from "expo-web-browser";
import { UserContext } from "./UserContext";

const signIn = () => {
  const [value, onChangeText] = React.useState("");
  const user = React.useContext(UserContext);

  const googleSignIn = async () => {
    await WebBrowser.openBrowserAsync(
      `https://fog-of-war-auth.onrender.com/auth/google`
    );
  }

  return (
    <View>
      <Button style={styles.Buttons} mode="contained" onPress={googleSignIn}>
        Log In With Google
      </Button>
      <TextInput
        label="Email"
        style={styles.textInput}
        value={value}
        onChangeText={(text) => onChangeText(text)}
      />
      <TextInput
        label="Password"
        style={styles.textInput}
        secureTextEntry={true}
      />

      <Button style={styles.Buttons} mode="contained">
        Log In
      </Button>
      <Button style={styles.Buttons} mode="Text">
        Sign Up
      </Button>
    </View>
  );
};

// ...

const styles = StyleSheet.create({
  textInput: {
    mode: "outlined",
    height: 50,
    width: 340,
    margin: 20,
    borderWidth: 2,
    padding: -20,
    top: "40%",
  },
  Buttons: {
    width: 200,
    top: "40%",
    margin: 5,
    alignItems: "center",
    left: "25%",
  },
});

export default signIn;
