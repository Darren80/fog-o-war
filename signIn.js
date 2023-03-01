import * as React from "react";
import { StyleSheet, Text, View } from "react-native";
import { TextInput, Button } from "react-native-paper";
import * as WebBrowser from "expo-web-browser";
import { UserContext } from "./UserContext";
import { userLogIn, getHome} from "./APIs";

const signIn = ({ navigation }) => {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loggingIn, setLoggingIn] = React.useState(false);
  const [loggedIn, setLoggedIn] = React.useState(false);
  const [user, setUser] = React.useState({});

  const googleSignIn = async () => {
    await WebBrowser.openBrowserAsync(
      `https://fog-of-war-auth.onrender.com/auth/google`
    ).then((response) => {
      console.log(response);
    });
  };

  

  const handleClick = (e) => {
    e.preventDefault();
    userLogIn({
      username: username,
      password: password,
    })
      .then(() => {
        setLoggedIn(true);
        console.log("logged in");
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

  console.log(user);

  React.useEffect(() => {
    getHome().then((response) => {
      console.log(response, "use effect");
      if (response.loggedIn === true) {
        setUser(response);
      } else {
      }
    });
  }, [loggedIn]);

  if (user.loggedIn === true) {
    navigation.navigate('Profile')
    return (
      <View>
        <Text>{user.display_name}</Text>
        <Text>{user.username}</Text>
      </View>
    );
  }

  return (
    <View>
      <Button style={styles.Buttons} mode="contained" onPress={googleSignIn}>
        Log In With Google
      </Button>
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
      <Button style={styles.Buttons} mode="contained" onPress={(e) => handleClick(e)}>
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
