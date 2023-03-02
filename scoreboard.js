import React, {useEffect, useState} from 'react';
import { StyleSheet, View, Image, PixelRatio} from 'react-native';
import { useNavigationParam } from '@react-navigation/native'
import { TextInput, Button, Surface, List, useTheme, Modal, Portal, Provider, Text, DataTable} from 'react-native-paper'
import {deleteAllFog, getUserbyId} from './APIs'

import { getScoreBoard } from './APIs';

const scoreboard = () => {
    const [scoreBoardData, setScoreBoardData] = useState([])

    useEffect(() => {
        getScoreBoard()
        .then((data) => {
            //console.log('check')
            setScoreBoardData(data)
            //return null
        })
        .catch((err) => {
            console.log(err)
        })
    }, [scoreBoardData])

    return (<View>
                <Surface elevation={1} style={{margin:20}}>
                    <DataTable>
                        <DataTable.Header>
                            <DataTable.Title> User Name</DataTable.Title>
                            <DataTable.Title> Distance Uncovered</DataTable.Title>
                        </DataTable.Header>
                        {scoreBoardData.map((row) => {
                                //console.log(row, "my rows")
                                return <DataTable.Row key={row.display_name}>
                                            <DataTable.Cell>{row.display_name}</DataTable.Cell>
                                            <DataTable.Cell>{row.trip_count}</DataTable.Cell>
                                        </DataTable.Row>
                            })
                        }
                    </DataTable>
                </Surface>
            </View>)
}




export default scoreboard