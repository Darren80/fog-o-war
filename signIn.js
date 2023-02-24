import React from 'react';
import { StyleSheet, Text, View, TextInput } from 'react-native';


const signIn = () => {

const [value, onChangeText] = React.useState('')
    return (
      <View style={styles.textInput}>
        <TextInput
            editable
            multiline
            numberOfLines={1}
            maxLength={40}
            value={value}
            //style={{padding:10}}
            onChangeText={text => onChangeText(text)}
        />
        <TextInput style={styles.textInput} secureTextEntry={true}/>
      </View>
    );
}

// ...

const styles = StyleSheet.create({
    textInput: {height: 40,
                margin: 12,
                borderWidth: 1,
                padding: -20,
    }
 })

export default signIn;