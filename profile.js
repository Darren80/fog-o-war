import React, {useEffect, useState} from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native'
import { TextInput, Button, Surface, List, useTheme, Modal, Portal, Provider, Text} from 'react-native-paper'
import {deleteAllFog, getUserbyId} from './APIs'

const profile = ({route}) => {
    const [profileURL, setProfileURL] = useState('https://avatars2.githubusercontent.com/u/24394918?s=400&v=4')
    const [currentUserId, setCurrentUserID] = useState(3)
    const [profileDisplayName, setDisplayName] = useState('')
    const [profileUsername, setProfileUsername] = useState('')
    const [loading, setLoading] = useState(false)

    //const navigation = useNavigation()

    //console.log(navigation.getState(), "My navigation")
    //console.log(route.params, "My params")

    const {mapSetter} = route.params

    getUserbyId(currentUserId)

    useEffect(() => {
        getUserbyId(currentUserId)
        .then((data) => {
            setProfileURL(data[0].avatar_url)
            setDisplayName(data[0].display_name)
            setProfileUsername(data[0].username)
        })
    }, [currentUserId])


    const onDeletePress = (user_id) => {
        //preventDefault()
        setLoading(true)
        return deleteAllFog(user_id)
        .then(() => {
            const timeout = setTimeout(() => {
                setLoading(false)
                console.log(loading, "This was after the time out")
            }, 5000)
        })
        .catch((err) => {
            console.log(err, "Our error")
        })
    }

    const [visible, setVisible] = React.useState(false);

    const showModal = () => setVisible(true);
    const hideModal = () => setVisible(false);
    const containerStyle = {backgroundColor: 'white', padding: 20}

    return(
        <View>
            <Surface elevation={5} style={{left:50, padding:10}}>
                <Image 
                    source={{uri: profileURL}}
                    style={styles.profilePic}
                />
            </Surface>
            <List.Item
                title="User:"
                //theme={theme}
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
            <List.Accordion title="Customize fog">
                <List.Item title="  Grey Cloud (Default)" onPress={() => mapSetter("rgba(218, 223, 225, 1)")}/>
                <List.Item title="  Sunshine and LollyPops" onPress={() => mapSetter("rgba(225, 223, 142, 0.97)")}/>
                <List.Item title="  Sea Foam" onPress={() => mapSetter("rgba(70, 204, 146, 0.88)")}/>
                <List.Item title="  Apocalypse " onPress={() => mapSetter("rgba(255, 110, 0, 0.88)")}/>
                <List.Item title="  People eater" onPress={() => mapSetter("rgba(107, 62, 202, 0.94)")}/>
                <List.Item title="  Unicorn MilkShake" onPress={() => mapSetter("rgba(239, 26, 203, 0.93)")}/>
            </List.Accordion>
            <Button style={{marginTop: 30, right: '35%'}} onPress={() => setVisible(true)}>
                Delete History
            </Button>
            
            <List.Section
            title='Share'
            left={props=> <List.Icon icon="share-variant"/>}
            />
            <List.Section
            title='Invite Friends'
            left={props=> <List.Icon icon="offer"/>}
            />
            <List.Section
            title='Privacy'
            left={props=> <List.Icon icon="alpha-p"/>}
            />
            <List.Section
            title='Preferences'
            left={props=> <List.Icon icon="application-settings"/>}
            />
            <List.Section
            title='About App'
            left={props=> <List.Icon icon="information-variant"/>}
            />
            <Portal>
                <Modal visible={visible} onDismiss={() => setVisible(false)} contentContainerStyle={containerStyle}>
                    <Text>
                        Are you certain you want to delete fog data? This operation cannot be undone
                    </Text>
                <Button disabled={loading === true} onPress={() => onDeletePress(currentUserId)}> Delete Fog Data</Button>
                    <Text>
                        Click outside this area to dismiss.
                    </Text>
                </Modal>
            </Portal>
        </View>
        
    )
}


const styles = StyleSheet.create({
    profilePic:{
        //margin: auto,
         width: '50%',
        border: '3px solid green',
        padding: '10px',
        //padding: 120,
        // height: 150,
        // width: 300,
        alignItems: 'centre',
        alignSelf: 'flex',
        justifyContent: 'center',
      }
})


export default profile