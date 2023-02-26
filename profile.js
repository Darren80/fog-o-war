import React, {useEffect, useState} from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import { TextInput, Button, Surface, List, useTheme} from 'react-native-paper'


const profile = () => {
    const [profileURL, setProfileURL] = useState('https://www.google.com/search?q=dog&rlz=1C1CHBF_en-GBGB991GB991&sxsrf=AJOqlzUbfns4rj4KgJIHlZgFvX__FUTesA:1677347401935&tbm=isch&source=iu&ictx=1&vet=1&fir=NN1-QGCky_XgzM%252CvL0suvKfyYaqHM%252C%252Fm%252F0bt9lr%253BOyQGKst6Lara3M%252CDj243kHCP9nJ-M%252C_%253BeQsdEWaZ6MHrQM%252C2prjuOFdTo6X8M%252C_%253BGbsqgMoKCwHzMM%252C65_J7MmDboKEcM%252C_%253BLdkDcR8aYOxQXM%252CsmcHwKUZvdWsaM%252C_&usg=AI4_-kQerRqCtAwxi4UQGOMadH6_xZ-OOQ&sa=X&ved=2ahUKEwjjqLqAnrH9AhWVFcAKHRx_BwYQ_B16BAh8EAE#imgrc=NN1-QGCky_XgzM')
    const [profileDisplayName, setDisplayName] = useState('Matt Burnand')
    const [profileUsername, setProfileUsername] = useState('Mburny_12star')
    // reset fog history
    // change colour of fog (?)
    const theme = useTheme()
    //console.log(theme, "Matts theme")
    // share button
    // invite friends
    // Privacy
    // About app
    // Preferences

    //useEffect()

    // Alot of this will depend on the user info in data base
    return(
        <View>
            <Surface elevation={5}>
            <Image 
                source={{uri: "https://e7.pngegg.com/pngimages/552/1/png-clipart-dogs-dogs-thumbnail.png"}}
                style={styles.profilePic}
            />
            </Surface>
            <List.Item
                title="User:"
                theme={theme}
                //theme={styles.theme}
                //theme={Primary40}
                description={profileDisplayName}
                left={props=> <List.Icon icon="human-non-binary"/>}
            />
            <List.Item
                title="Profile's User Name:"
                description={profileUsername}
                left={props=> <List.Icon icon="emoticon-poop"/>}
            />
            <List.Item
                title="History:"
                description="45,000 (example?)"
                left={props=> <List.Icon icon="airballoon"/>}
            />
            <List.Section
            title='Share'
            />
            <List.Section
            title='Invite Friends'
            />
            <List.Section
            title='Privacy'
            />
            <List.Section
            title='Preferences'
            />
            <List.Section
            title='About App'
            />
        </View>
        
    )
}


const styles = StyleSheet.create({
    profilePic:{
        padding: 80,
        height: 150,
        width: 300,
        alignItems: 'center',
        //alignSelf: 'flex',
        justifyContent: 'center',
      }
})


export default profile