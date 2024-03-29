// import CookieManager from "@react-native-cookies/cookies";
import axios from "axios";
import { Database } from "./MOCK DATABASE";
const googleMapAPIKey = "AIzaSyACUp2e0eMW5lbJIGx3CxmncPEv7ub99EM";

export const api = axios.create({
  baseURL: "https://fog-of-war-auth.onrender.com",
});

export async function postNewUser(newUser) {
  return await api.post(`/auth/signup`, newUser).then((userData) => {
    return userData.data;
  });
}

export async function getHome() {
  return await api.get(`/home`).then((response) => {
    console.log(response.data, "<= home");
    return response.data;
  });
}

export async function getProfile() {
  return await api.get("/api/profile").then((response) => {
    console.log(response.data);
  });
}

export async function getTrips() {
  return await api.get("/api/trips/me").then((response) => {
    console.log(JSON.stringify(response.data));
  });
}

export async function userLogIn(userInfo) {
  return await api.post("/auth/login", userInfo).then((user) => {
    console.log(user.data, "logged in");
    return user;
    getHome();
  });
}

export async function postNewMarker(markerData) {
  //Format:
  // let newMarker = {
  //     "comment": "Loving the weather",
  //     "img_url": "https://i.imgur.com/KT5sbOH.jpeg",
  //     "user_id": 1,
  //     "location": [
  //         -75.1001345742366,
  //         123.34633830198504
  //     ]
  // }

  return this.axiosInstance.post(`/api/geodata/`, markerData).then((response) => {
    if (!response.status === 200) {
      throw new Error(
        "Error: " + response.status + response.statusText + response.data
      );
    }
    console.log(response.data, "<-- new marker");
  });
};

class API {
  axiosInstance = axios.create({
    baseURL: "https://fog-of-war.onrender.com/api",
    timeout: 2000,
    headers: {
      "Content-Type": "application/json",
    },
  });
  //Our API's
  getFogData = (user_id = 1) => {
    return this.axiosInstance.get(`/trips/${user_id}`).then((response) => {
      if (!response.status === 200) {
        throw new Error(
          "Error: " + response.status + response.statusText + response.data
        );
      }
      console.log(response.data, "<-- response get fog");

      return response.data; //Returns data in the formatted way.
    });

    //----------------------------------------Change to get from API---------------------------------------------------
    const db = new Database();
    let fogData = db.GETFogData(); //Get data from database.
    if (!fogData) {
      return;
    } //If no data is available then skip this function.
    return Promise.resolve(fogData);
    //-----------------------------------------------------------------------------------------------------------------
  };

  postFogData = (partialFogData, user_id = 1) => {
    return this.axiosInstance
      .post(`/trips/${user_id}`, partialFogData)
      .then((response) => {
        //Fog data successfully saved.
        if (!response.status === 200) {
          throw new Error(
            "Error: " + response.status + response.statusText + response.data
          );
        }
      });
  };

  deleteFog = (user_id) => {
    //Action cannot be reversed. Deletes all trips.
    axios.delete(`/trips/${user_id}`).then((response) => {
      if (!response.status === 204) {
        throw new Error(
          "Error: " + response.status + response.statusText + response.data
        );
      }
    });
  };

  getUser = (email, password) => {
    return this.axiosInstance.post(`/auth/login`).then((response) => {
      if (!response.status === 200) {
        throw new Error(
          "Error: " + response.status + response.statusText + response.data
        );
      }

      // CookieManager.setFromResponse(
      //     response.config.url, // the URL of the response
      //     response.headers['set-cookie']
      // );

      console.log(response.data, "<-- get user");
      return response.data; //Returns username and user_id?
    });
  };

  postNewUser = (newUser) => {
    //Format:
    // {
    //     "user_id": 12,
    //     "display_name": "Abi Bi",
    //     "username": "104574998399726953911",
    //     "avatar_url": "https://lh3.googleusercontent.com/a/AGNmyxYXPljRlznEopjfxNWw8J56OJKvPq__NZm3q5LKXg=s96-c"
    // }

    return axios.post(`/users`, newUser).then((response) => {
      if (!response.status === 201) {
        throw new Error(
          "Error: " + response.status + response.statusText + response.data
        );
      } else {
        console.log("User successfully created!");
        return this.username;
      }
    });
  };

  //-------------------------- Markers --------------------------



  deleteAllFog = (user_id) => {
    //Action cannot be reversed. Deletes all trips.
    return axios.delete(`/trips/${user_id}/geodata`).then(({ data }) => {
      return data;
    });
  };

  getAllMarkers = () => {
    return this.axiosInstance.get(`/api/geodata/`).then((response) => {
      if (!response.status === 200) {
        throw new Error(
          "Error: " + response.status + response.statusText + response.data
        );
      }
      console.log(response.data, "<-- all markers");
      return response.data;
    });
  };

  getMarkerDetails = (markerID = 2) => {
    //Format:
    // [
    //     {
    //         "geodata_id": 2,
    //         "location": [
    //             -0.0009108155069839086,
    //             51.47733209786023
    //         ],
    //         "img_url": "https://i.imgur.com/podO8uW.jpeg",
    //         "comment": "blblblblblb",
    //         "user_id": 1
    //     }
    // ]

    this.axiosInstance.get(`/api/geodata/${markerID}`).then((response) => {
      if (!response.status === 200) {
        throw new Error(
          "Error: " + response.status + response.statusText + response.data
        );
      }
      console.log(response.data, "<-- marker details");
      return response.data;
    });
  };

  deleteMarker = (markerID) => {
    return this.axiosInstance
      .delete(`/api/geodata/${markerID}`)
      .then((response) => {
        if (!response.status === 204) {
          throw new Error(
            "Error: " + response.status + response.statusText + response.data
          );
        }
        console.log("Marker deleted successfully.");
      });
  };

  deleteAllMarkersByUser = () => {
    return this.axiosInstance
      .delete(`/api/users/me/geodata/`)
      .then((response) => {
        if (!response.status === 204) {
          throw new Error(
            "Error: " + response.status + response.statusText + response.data
          );
        }
      });
  };

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

const fogAPI = axios.create({
  baseURL: "https://fog-of-war.onrender.com/api",
  timeout: 1000,
});

export const deleteAllFog = (user_id) => {
  return fogAPI.delete(`/trips/${user_id}`).then((data) => {
    return data;
  });
};

export const getUserbyId = (user_id) => {
  return fogAPI.get(`/users/id/${user_id}`).then(({ data }) => {
    return data;
  });
};

export const getScoreBoard = () => {
  return fogAPI.get(`/scoreboard`).then(({ data }) => {
    return data;
  });
};

export async function userLogOut() {
  return await api.get("/auth/logout").then(() => {
    console.log("logged out");
  });
}

export default API;
