import * as React from "react";
import { StyleSheet, Text, View } from "react-native";
import { TextInput, Button } from "react-native-paper";
import * as WebBrowser from "expo-web-browser";
import { userLogIn, getHome } from "./APIs";
import { LoggedInContext, UserContext } from "./App";

const signIn = ({ navigation }) => {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loggingIn, setLoggingIn] = React.useState(false);

  const { user, setUser } = React.useContext(UserContext);
  const { loggedIn, setLoggedIn } = React.useContext(LoggedInContext);

  const handleClick = (e) => {
    e.preventDefault();
    setLoggingIn(true);
    setLoggedIn(false);
    let loggedInUser = {
      username: username,
      password: password,
    };
    userLogIn(loggedInUser)
      .then((response) => {
        setLoggingIn(false);
        setLoggedIn(true);
        setUser(response.data);
        navigation.navigate("Profile");
      })
      .catch((err) => {
        console.log(err);
        return err;
      });
  };

  if (loggingIn) {
    console.log("logging in...");
  }

  if (loggedIn) {
    console.log("logged in!");
  }

  React.useEffect(() => {
    getHome().then((response) => {
      if (response.loggedIn === true) {
        setUser(response);
      } else if (response.loggedIn === false) {
        setLoggedIn(false);
      }
    });
  }, [setUser]);

  return (
    <View>
      <TextInput
        label="Email/Username"
        style={styles.textInput}
        value={username}
        onChangeText={(text) => setUsername(text)}
      />
      <TextInput
        label="Password"
        value={password}
        style={styles.textInput}
        secureTextEntry={true}
        onChangeText={(text) => setPassword(text)}
      />
      <Button
        style={styles.Buttons}
        mode="contained"
        onPress={(e) => handleClick(e)}
      >
        Log In
      </Button>
      <Button
        style={styles.Buttons}
        mode="Text"
        onPress={() => navigation.navigate("userRegistration")}
      >
        Sign Up
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  textInput: {
    mode: "outlined",
    height: 50,
    width: 340,
    marginTop: 10,
    marginBottom: 10,
    marginRight: "auto",
    marginLeft: "auto",
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
