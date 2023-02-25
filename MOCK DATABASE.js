export class Database {
    constructor() {

    }

    // EXAMPLE GET FOR FOG DATA FROM THE API!
    GETTrips() {
        //Get trips for user_id: xyz
        let exampleFogResponseFromDB = {
            username: "tomthescout",
            user_id: this.user_id,
            trips: {
                trip_id_0: {
                    points: [
                        {
                            coordinates: [
                                0.04157221654656951,
                                51.55108656901882
                            ],
                            circleSize: 0.05
                        },
                        {
                            coordinates: [
                                0.041582000344476455,
                                51.55105310850297
                            ],
                            circleSize: 0.05
                        },
                        {
                            coordinates: [
                                0.04159178414232656,
                                51.55101204329017
                            ],
                            circleSize: 0.05
                        }
                    ]
                },
                trip_id_1: {
                    points: [
                        {
                            coordinates: [
                                0.04157221654656951,
                                51.55108656901882
                            ],
                            circleSize: 0.05
                        },
                        {
                            coordinates: [
                                0.041582000344476455,
                                51.55105310850297
                            ],
                            circleSize: 0.05
                        },
                        {
                            coordinates: [
                                0.04159178414232656,
                                51.55101204329017
                            ],
                            circleSize: 0.05
                        }
                    ]
                }
            }
        }
        return exampleFogResponseFromDB;
    }

    exampleFogResponseFromDB = {
        username: "tomthescout",
        user_id: this.user_id,
        trips: {
            trip_id_0: {
                points: [
                    {
                        coordinates: [
                            0.04157221654656951,
                            51.55108656901882
                        ],
                        circleSize: 0.05
                    },
                    {
                        coordinates: [
                            0.041582000344476455,
                            51.55105310850297
                        ],
                        circleSize: 0.05
                    },
                    {
                        coordinates: [
                            0.04159178414232656,
                            51.55101204329017
                        ],
                        circleSize: 0.05
                    }
                ]
            },
            trip_id_1: {
                points: [
                    {
                        coordinates: [
                            0.04157221654656951,
                            51.55108656901882
                        ],
                        circleSize: 0.05
                    },
                    {
                        coordinates: [
                            0.041582000344476455,
                            51.55105310850297
                        ],
                        circleSize: 0.05
                    },
                    {
                        coordinates: [
                            0.04159178414232656,
                            51.55101204329017
                        ],
                        circleSize: 0.05
                    }
                ]
            }
        }
    }

    exampleFogDataPostRequest = {
        username: "tomthescout",
        user_id: this.user_id,
        trips: [{
            trip_id: 0,
            points: [
                {
                    coordinates: [
                        1.04157221654656951,
                        42.55108656901882
                    ],
                    circleSize: 0.05
                },
                {
                    coordinates: [
                        1.041582000344476455,
                        42.55105310850297
                    ],
                    circleSize: 0.05
                }
            ]
        }]
    }

    POSTFogData(fogData) {

        homeApi = axios.create({
            baseURL: "https://fog_of_war.onrender.com"
        })

        const getTrip = (trip_id) => {
            return homeApi.post('/api/user/:trip_id', { params: trip_id })
                .then(() => {
                    let body = JSON.stringify(fogData)
                })
        }
    }
}