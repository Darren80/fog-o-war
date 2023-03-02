import * as turf from "@turf/turf";

export class TurfWorker {
  trip_id = null
  user_id = ''

  turfHelper = new TurfHelper()
  circleSize = 0.05

  constructor(user_id) {
    this.user_id = user_id;
  }

  //Uncovers the fog based on the user's current position
  //Input:
  //Output:
  uncoverFog(userPosition, fogPolygon, partialFogData, circleMultiplyer = 1) {

    //Create new circle polygon based on the user's position.
    const circlePolygon = this.turfHelper._createCirclePolygonFromUserPosition(userPosition, this.circleSize);

    //Extend the fog using our new circle polygon.
    const newFogPolygon = this._addPolygonToFog(fogPolygon, circlePolygon);

    //Simplify area, reduces points -> reduce data size, reduce processing power needed to display.
    // const options = { tolerance: 0.0001, highQuality: true };
    // fogPolygon = turf.simplify(fogPolygon, options);


    //Add user lat and lon to temporary db obect
    const newPartialFogData = this.addUserPositionToFogData(userPosition, partialFogData);

    return { newFogPolygon, newPartialFogData };
  }

  checkUserPointsWithinPolygon(userPosition, fogFeature) {

    //Create square polygon based on user's position.
    const pointPosition = turf.point([userPosition.longitude, userPosition.latitude]);

    const coordinatesArray = fogFeature.geometry.coordinates;

    let result = false;

    coordinatesArray.forEach((position, i) => {

      //Return true if the user's position is inside the uncovered area
      const searchWithin = turf.booleanPointInPolygon(pointPosition, turf.polygon([position]));
      console.log(searchWithin, coordinatesArray[i], i, '<-- index');
      if (searchWithin)
        result = true;
      else
        result = false;
    });

    return result;

  }

  distanceBetweenPoints(markerPoint, previousMarkerLocation) {
    
    const pointPosition = turf.point([markerPoint.longitude, markerPoint.latitude]);

    const from = pointPosition.geometry.coordinates;

    const lastPosition = turf.point([previousMarkerLocation.longitude, previousMarkerLocation.latitude]);

    const  to = lastPosition.geometry.coordinates;

    const options = {units: 'kilometers'};

    const distance = turf.distance(from, to, options);

    return distance;
  }

  addUserPositionToFogData(userPosition, partialFogData) {
    //fogData may be empty when application starts, if no data in local storage.
    if (!partialFogData) {

      partialFogData = {
        username: "tomthescout",
        user_id: this.user_id,
        trips: [{
          trip_id: this.trip_id,
          points: [

          ]
        }]
      }

    }

    let currentTrip = partialFogData.trips.find((trip) => trip.trip_id === this.trip_id);
    //If trip_id does not exist in the array of trips then make new one.
    if (!currentTrip) {

      partialFogData.trips.push({
        trip_id: this.trip_id,
        points: [

        ]
      })
      //Set it again.
      currentTrip = partialFogData.trips.find((trip) => trip.trip_id === this.trip_id);
    }

    //Add user's position to fog data store.
    const userLongitude = userPosition.coords.longitude;
    const userLatitude = userPosition.coords.latitude;

    currentTrip.points.push({
      coordinates: [userLongitude, userLatitude],
      circleSize: this.circleSize
    });

    return partialFogData;
  }



  //Runs if the user has previous data in the database.
  generateNewFogPolygon() {
    //Create new world bounded polygon
    const fogPolygon = this.turfHelper._worldPolygon();

    // //Create new circle polygon based on the user's position.
    // const circlePolygon = this.turfHelper._createCirclePolygonFromUserPosition(userPosition, this.circleSize);

    // //Combine the fog-polygon and make the circle polygon be a hole.
    // const fogPolygonWithHole = this._addPolygonToFog(fogPolygon, circlePolygon);

    return fogPolygon;
  }

  //Input: TBD
  //Output: fog-polygon
  rebuildFogPolygonFromFogData(fogData) {
    //Create new world bounded polygon
    let fogPolygon = this.turfHelper._worldPolygon();

    //For each trip.
    for (let i = 0; i < fogData.trips.length; i++) {
      //This polygon represents a new hole in the fog.
      let holePolygon = null;
      //An assumption is that each coordinate is ajecent to the next, otherwise turf.union() wont work.
      //Result: cooordinates must be written to the database in order, cooordinates must be sent from the database in order.
      //Potential workaround: sort the coordinates by closest distance from each other. https://www.geodatasource.com/developers/javascript

      //For each coordinate.
      for (let j = 0; j < fogData.trips[i].points.length; j++) {

        let longitude = fogData.trips[i].points[j].coordinates[0];
        let latitude = fogData.trips[i].points[j].coordinates[1];

        const circlePolygon = this.turfHelper._createCirclePolygonFromLonLat(longitude, latitude, fogData.trips[i].points[j].circleSize)

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
        //Set the trip ID
        this.trip_id = i;

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

    //Set the trip ID
    this.trip_id = fogPolygon.geometry.coordinates.length - 1;

    return fogPolygon;

  }

  fixFog(fogPolygon) {
    //For each hole in the fog-polygon from 2nd hole.
    for (let i = 1; i < fogPolygon.geometry.coordinates.length; i++) {

      const holePolygon = turf.polygon([fogPolygon.geometry.coordinates[i]]);

      for (let j = 1; j < fogPolygon.geometry.coordinates.length; j++) {

        if (i === j) { continue }
        const holePolygonNext = turf.polygon([fogPolygon.geometry.coordinates[j]]);

        if (turf.intersect(holePolygon, holePolygonNext)) {
          const unitedHolePolygon = turf.union(holePolygon, holePolygonNext);
          const unitedHolePolygonCoordinates = unitedHolePolygon.geometry.coordinates[0];

          fogPolygon.geometry.coordinates[i] = unitedHolePolygonCoordinates;
          fogPolygon.geometry.coordinates.splice(j, 1);
          // console.log(fogPolygon, '<-- fixed FP');
          return fogPolygon;
        }
      }

      // console.log(fogPolygon.geometry.coordinates.length, '<-- length of FP');
    }

    
    return fogPolygon;
  }

}



// _transformScale(arrayOfFeatures, scale) {
//   const features = [];
//   for (let i = 0; i < arrayOfFeatures.length; i++) {
//     features.push(turf.transformScale(arrayOfFeatures[i], scale));
//   }
//   return features;
// }

class TurfHelper {
  constructor() {
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
  _createCirclePolygonFromUserPosition(userPosition, size = 0.05, steps = 4) {
    //Firstly a point polygon is required to create a circle using turf.circle()

    //The point polygon is generated using the user's longitude and latitude.
    const pointPolygon = turf.point([userPosition.coords.longitude, userPosition.coords.latitude]);

    //A circle polygon is created using the point polygon as its center.
    const circlePolygon = turf.circle(pointPolygon, size, { steps: steps });

    return circlePolygon;
  }

  //Input: longitude and latitude.
  //Output: Polygon
  _createCirclePolygonFromLonLat(longitude, latitude, size = 0.05, steps = 4) {
    //Firstly a point polygon is required to create a circle using turf.circle()

    //The point polygon is generated using longitude and latitude.
    const pointPolygon = turf.point([longitude, latitude]);

    //A circle polygon is created using the point polygon as its center.
    const circlePolygon = turf.circle(pointPolygon, size, { steps: steps });

    return circlePolygon;
  }
}