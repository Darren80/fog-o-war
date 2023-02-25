import 'react-native-gesture-handler';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();
import signIn from './signIn.js'
import home from './home.js'
import profile from './profile.js'

class App extends React.Component {
  render() {

    return (
          <NavigationContainer>
            <Stack.Navigator>
              <Stack.Screen
                name="Home"
                component={home}
              />
              <Stack.Screen
                name="SignIn"
                component={signIn}
              />
              <Stack.Screen
                name="Profile"
                component={profile}
              />
            </Stack.Navigator>
          </NavigationContainer>
        );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default App;



////import 'react-native-gesture-handler';
//import * as React from 'react';
//import { StyleSheet } from 'react-native';
//import {NavigationContainer} from '@react-navigation/native';
//import {createNativeStackNavigator} from '@react-navigation/native-stack'
//
////import mapHome from './mapHome.js';
//import signIn from './signIn.js'
//import home from './home.js'
//
//const Stack = createNativeStackNavigator();
//
//class App extends React.Component {
//  render() {
//
//    return (
//      <NavigationContainer>
//        <Stack.Navigator>
//          <Stack.Screen
//            name="Home"
//            component={home}
//          />
//          <Stack.Screen
//            name="SignIn"
//            component={signIn}
//          />
//        </Stack.Navigator>
//      </NavigationContainer>
//    );
//}