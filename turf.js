import * as turf from "@turf/turf";
import * as FileSystem from 'expo-file-system';
import { Database } from "./DATABASE";

export class TurfWorker {

  turfHelper = new TurfHelper();
  username = '';
  constructor(username) {
    this.username = username;
  }

  getFog(userLocation) {
    const fogPolygon = this._getFogPolygonFromDB();

    if (!fogPolygon) {
      return this._generateNewFogPolygon(userLocation);
    } else {
      return fogPolygon;
    }
  }

  //Uncovers the fog based on the user's current position
  //Input:
  //Output:
  uncoverFog(userPosition, fogPolygon) {

    //TODO: block the uncovering of fog if the user's speed exceeds walking or cycling speed.
    if (userPosition.coords.speed > 7.15264) { //If the user's speed is above or equal to 16Mp/h or 7.15264m/s
      //Create a text message to the user telling them their speed is too high to track their progress.
      console.log('Speed exceeds maximum!');
    }

    //TODO: calculate the user's elevation above the ground, expand the circle more when the user is higher up.
    this.turfHelper._determineCircleSizeBasedOnElevation(userPosition);

    //Add the coordinates to memory
    this._addUserPositionToDB(userPosition, 1, this.circleSize);

    //Create new circle polygon based on the user's position.
    const circlePolygon = this.turfHelper._createCirclePolygonFromUserPosition(userPosition, this.circleSize);

    //Extend the fog using our new circle polygon.
    fogPolygon = this._addPolygonToFog(fogPolygon, circlePolygon);

    //Simplify area, reduces points -> reduce data size, reduce processing power needed to display.
    const options = { tolerance: 0.0001, highQuality: true };
    fogPolygon = turf.simplify(fogPolygon, options);

    return fogPolygon;
  }

  // EXAMPLE POST FOR FOG DATA FROM THE API.
  postFogData = {
    username: this.username,
    trip_id: 0,
    points: []
  }


  _addUserPositionToDB(userPosition, tripId, circleSize) {
    // console.log(userPosition, ' trip id-->', tripId);

    let userLongitude = userPosition.coords.longitude;
    let userLatitude = userPosition.coords.latitude;

    //Save user's position to DB store.
    this.postFogData.points.push({
      coordinates: [userLongitude, userLatitude],
      circleSize: circleSize
    });
  }


  circleSize = 0.05
  //Runs if the user has previous data in the database.
  _generateNewFogPolygon(userPosition) {
    //Add the coordinates to memory
    this._addUserPositionToDB(userPosition, 0, this.circleSize);

    //Create new world bounded polygon
    const fogPolygon = this.turfHelper._worldPolygon();

    //Create new circle polygon based on the user's position.
    const circlePolygon = this.turfHelper._createCirclePolygonFromUserPosition(userPosition, this.circleSize);

    //Combine the fog-polygon and make the circle polygon be a hole.
    const fogPolygonWithHole = this._addPolygonToFog(fogPolygon, circlePolygon);
    return fogPolygonWithHole;
  }

  //Input: TBD
  //Output: fog-polygon
  _getFogPolygonFromDB() {
    const db = new Database()
    let { trips } = db.GETTrips() //Get data from database. 
    if (!trips) { return } //If no data is available then skip this function.

    //Create new world bounded polygon
    let fogPolygon = this.turfHelper._worldPolygon();

    //For each trip.
    for (let i = 0; i < trips.length; i++) {
      //This polygon represents a new hole in the fog.
      let holePolygon = null;
      //An assumption is that each coordinate is ajecent to the next, otherwise turf.union() wont work.
      //Result: cooordinates must be written to the database in order, cooordinates must be sent from the database in order.
      //Potential workaround: sort the coordinates by closest distance from each other. https://www.geodatasource.com/developers/javascript

      //For each coordinate.
      for (let j = 0; j < trips[i].points.length; j++) {

        let longitude = trips[i].points[j].coordinates[0];
        let latitude = trips[i].points[j].coordinates[1];

        const circlePolygon = this.turfHelper._createCirclePolygonFromLonLat(longitude, latitude, trips[i].points[j].circleSize)

        if (!holePolygon) { holePolygon = circlePolygon; continue; }

        holePolygon = turf.union(holePolygon, circlePolygon)
      }

      //Recreate the holes in the fog.
      fogPolygon = this._addPolygonToFog(fogPolygon, holePolygon);
    }

    return fogPolygon;
  }

  //Add new polygon to fog
  //This function extends the hole in the fog using tuf.union()
  //Input: 
  //Output:
  _addPolygonToFog(fogPolygon, newPolygon) {

    /*
    The Geojson spec says that:
    Each array of coordinates inside fog-polygon represents a polygon,
    the first array of coordinates is shown on the map, in our case it represents fog
    each subseqent array of coordinates is represted as a hole in the first array of coordinates
    so we start our for-loop from 1 instead of 0.
    */

    //For each hole in the fog-polygon.
    for (let i = 1; i < fogPolygon.geometry.coordinates.length; i++) {

      //An array of coordinates representing a hole in the fog polygon.
      const holeCoordinates = fogPolygon.geometry.coordinates[i]
      //Convert the array of coordinates to a polygon object.
      const holePolygon = turf.polygon([holeCoordinates]);

      //If the "hole" intersects with the new polygon then join them together. (e.g. user moved to edge of fog)
      if (turf.intersect(holePolygon, newPolygon)) {
        const newHolePolygon = turf.union(holePolygon, newPolygon);
        const newHoleCoordinates = newHolePolygon.geometry.coordinates[0];

        //Overwrite the old hole.
        fogPolygon.geometry.coordinates[i] = newHoleCoordinates;
        return fogPolygon;
      }
    }

    //If none of the "hole" polygons intersect with the new polygon then add a new hole to the fog-polygon.
    const newHoleCoordinates = newPolygon.geometry.coordinates[0];
    fogPolygon.geometry.coordinates.push(newHoleCoordinates);
    return fogPolygon;

  }





  // _transformScale(arrayOfFeatures, scale) {
  //   const features = [];
  //   for (let i = 0; i < arrayOfFeatures.length; i++) {
  //     features.push(turf.transformScale(arrayOfFeatures[i], scale));
  //   }
  //   return features;
  // }
}

class TurfHelper {
  constructor() {
  }

  _determineCircleSizeBasedOnElevation(userPosition) {
    console.log('Altitude: ', userPosition.coords.altitude, 'Altitude Acc: ', userPosition.coords.altitudeAccuracy);
  }

  //Input: None
  //Output: Polygon
  _worldPolygon() {
    return turf.polygon(
      [
        [
          [0, 89.9],
          [179.9, 89.9],
          [179.9, -89.9],
          [0, -89.9],
          [-179.9, -89.9],
          [-179.9, 0],
          [-179.9, 89.9],
          [0, 89.9],
        ]
      ]
    );
  }

  //Input: user's position.
  //Output: Polygon
  _createCirclePolygonFromUserPosition(userPosition, size = 0.05, steps = 12) {
    //Firstly a point polygon is required to create a circle using turf.circle()

    //The point polygon is generated using the user's longitude and latitude.
    const pointPolygon = turf.point([userPosition.coords.longitude, userPosition.coords.latitude]);

    //A circle polygon is created using the point polygon as its center.
    const circlePolygon = turf.circle(pointPolygon, size, { steps: steps });

    return circlePolygon;
  }

  //Input: longitude and latitude.
  //Output: Polygon
  _createCirclePolygonFromLonLat(longitude, latitude, size = 0.05, steps = 12) {
    //Firstly a point polygon is required to create a circle using turf.circle()

    //The point polygon is generated using longitude and latitude.
    const pointPolygon = turf.point([longitude, latitude]);

    //A circle polygon is created using the point polygon as its center.
    const circlePolygon = turf.circle(pointPolygon, size, { steps: steps });

    return circlePolygon;
  }
}