import * as React from "react";
import { StyleSheet, Text, View } from "react-native";
import { TextInput, Button } from "react-native-paper";
import { postNewUser } from "./APIs";

const UserRegistration = () => {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [displayName, setDisplayName] = React.useState("");
  const [posting, setPosting] = React.useState(false);
  const [posted, setPosted] = React.useState(false);

  const handleClick = (e) => {
    e.preventDefault();
    setPosting(true);
    setPosted(false)
    postNewUser({
      display_name: displayName,
      username: username,
      password: password,
    }).catch((err) => {
      console.log(err)
      return err;
    });
    setPosted(true)
    setPosting(false)
  };

  if (posting) {
    console.log("Creating new profile...")
  }

  if (posted) {
    console.log("new user created!")
  }

  
  return (
    <>
      <TextInput
        // style={styles.input}
        value={username}
        placeholder={"Email/Username"}
        onChangeText={(text) => setUsername(text)}
        autoCapitalize={"none"}
      />
      <TextInput
        // style={}
        value={displayName}
        placeholder={"Display Name"}
        onChangeText={(text) => setDisplayName(text)}
      />
      <TextInput
        // style={}
        value={password}
        placeholder={"Password"}
        secureTextEntry
        onChangeText={(text) => setPassword(text)}
      />
      <Button mode="Text" onPress={(e) => handleClick(e)}>Sign Up</Button>
    </>
  );
};

export default UserRegistration;
