export class Database {
    constructor() {

    }

    // EXAMPLE GET FOR FOG DATA FROM THE API!
    GETTrips() {
        //Get trips for user_id: xyz
        let responseFromDB = {
            username: "tomthescout",
            trips: [{
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
            {
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
            }]
        }
        return responseFromDB;
    }

    POSTFogData(fogData) {
        homeApi = axios.create({
            baseURL: "https://fog_of_war.onrender.com"
        })
        
        const getTrip = (trip_id) => {
            return homeApi.post('/api/user/:trip_id', {params: trip_id})
            .then(() => {
                let body = JSON.stringify(fogData)
            } )
        }
    }
}