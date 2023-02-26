homeApi = axios.create({
    baseURL: "https://fog_of_war.onrender.com"
})


const dummyData = {
    user_id: 367,
    trip_id:1,
    coords: [10101, 10123, 100134]
}

const getTrip = (trip_id) => {
    return homeApi.get('/api/trip', {params: trip_id})
    .then(() => {
        return dummyData
    } )
}