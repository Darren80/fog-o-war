import axios from "axios";
import { Database } from "./MOCK DATABASE";
const googleMapAPIKey = "AIzaSyACUp2e0eMW5lbJIGx3CxmncPEv7ub99EM";

export const api = axios.create({
  baseURL: "https://fog-of-war-auth.onrender.com",
});

export async function postNewUser (newUser) {
  return await api.post(`/auth/signup`, newUser).then(({ userData }) => {
    console.log(userData)
    return userData;
  });
};

class API {
  password = "";
  username = "";
  constructor(username, password) {
    this.username = username;
    this.password = password;
  }

  instance = axios.create({
    baseURL: "https://fog-of-war.onrender.com/api",
    timeout: 1000,
  });
  //Our API's
  getFogData = (user_id) => {
    // return axios.get(`/trips/${user_id}`)
    //     .then((response) => {
    //         if (!response.status === 200) {
    //             throw new Error("Error: " + response.status);
    //         }
    //         return response.data; //Returns data in the formatted way.
    //     })

    //----------------------------------------Change to get from API---------------------------------------------------
    const db = new Database();
    let fogData = db.GETFogData(); //Get data from database.
    if (!fogData) {
      return;
    } //If no data is available then skip this function.
    return Promise.resolve(fogData);
    //-----------------------------------------------------------------------------------------------------------------
  };

  postFogData = (partialFogData) => {
    return axios
      .post(`/trips/${user_id}`, {
        data: partialFogData,
      })
      .then((response) => {
        //Fog data successfully saved.
        if (!response.status === 201) {
          throw new Error("Error: " + response.status + response.statusText);
        }
        return response.data; //Returns success message?
      });
  };

  getUser = () => {
    return axios.get(`/users/${this.username}`).then((response) => {
      if (!response.status === 200) {
        throw new Error("Error: " + response.status + response.statusText);
      }
      return response.data; //Returns username and user_id?
    });
  };

  deleteFog = (username) => {
    //Action cannot be reversed. Deletes all trips.
    axios.delete(`/user/${username}`, {});
  };

  postNewMarker = () => {};

  getNewMarker = () => {};

  deleteMarker = () => {};

  deleteAllMarkers = () => {};

  //External API's
  getElevation = (latitude = 39.7391536, longitude = -104.9847034) => {
    return axios
      .get(
        `https://maps.googleapis.com/maps/api/elevation/json?locations=${latitude}%2C${longitude}&key=${googleMapAPIKey}`
      )
      .then(function (response) {
        return response.data;
      })
      .catch(function (error) {
        console.log(error);
      });
  };
}

export default API;
