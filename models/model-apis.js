import axios from "axios"

class API {
    password = ''
    username = ''
    constructor(username, password) {
        this.username = username;
        this.password = password;
    }

    instance = axios.create({
        baseURL: 'https://fog-of-war.onrender.com/api',
        timeout: 1000
    });
    //Our API's
    getFogData = (username) => {
        return axios.get(`/trips/${username}`)
            .then((response) => {
                if (!response.status === 200) {
                    throw new Error("Error: " + response.status);
                }
                return response.data; //Returns data in the formatted way.
            })
    }

    postFogData = (partialFogData) => {
        return axios.post(`/fog/${username}`, {
            data: partialFogData
        })
            .then((response) => {
                if (!response.status === 201) {
                    //Fog data successfully saved.
                }
            })
    }

    getUser = () => {
        return axios.get(`/users/${username}`)
            .then((response) => {
                if (!response.status === 200) {
                    throw new Error("Error: " + response.status + response.statusText);
                }
                return response.data; //Returns username and user_id?
            })
    }

    postNewUser = () => {
        return axios.post(`/users`, {
            data: {
                username: this.username,
                password: this.password
            }
        })
            .then((response) => {
                if (!response.status === 201) {
                    throw new Error("Error: " + response.status + response.statusText);
                } else {
                    console.log('User successfully created!');
                    return this.username;
                }
            })
    }

    deleteFog = (username) => {
        //Action cannot be reversed
        axios.delete(`/user/${username}`, {})
    }

    postNewMarker = () => {
        
    }

    getNewMarker = () => {

    }

    //External API's
    getElevation = () => {

    }
}

export default API;