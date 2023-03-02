import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TextInput, Button } from 'react-native-paper'


const signIn = () => {

    const [value, onChangeText] = React.useState('')
    return (
        <View>
            <TextInput
                label="Email"
                style={styles.textInput}
                value={value}
                onChangeText={text => onChangeText(text)}
            />
            <TextInput
                label="Password"
                style={styles.textInput}
                secureTextEntry={true} />

            <Button
                style={styles.Buttons}
                mode="contained"
            >Log In</Button>
            <Button
                style={styles.Buttons}
                mode="Text"
            >Sign Up</Button>
        </View>
    );
}

// ...

const styles = StyleSheet.create({
    textInput: {
        mode: 'outlined',
        height: 50,
        width: 340,
        margin: 20,
        borderWidth: 2,
        padding: -20,
        top: '40%'
    },
    Buttons: {
        width: 200,
        top: '40%',
        margin: 5,
        alignItems: 'center',
        left: '25%'
    }
})

export default signIn;