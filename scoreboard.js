import React, {useEffect, useState} from 'react';
import { StyleSheet, View, Image } from 'react-native';
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
                <DataTable>
                    <DataTable.Header>
                        <DataTable.Title> User</DataTable.Title>
                        <DataTable.Title> Score</DataTable.Title>
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
            </View>)
}



export default scoreboard