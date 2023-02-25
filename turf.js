import * as turf from "@turf/turf";
import * as FileSystem from 'expo-file-system';

export class TurfWorker {
  constructor() {
    // this.test();
  }

  //Returns a Feature
  worldPolygon() {
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

  getTestData() {

  }

  circleSize = 0.05; //in kilometers

  generateNewFog(userPosition) {

    //Create new world bounded polygon
    const worldFeature = this.worldPolygon();

    //Create square polygon based on user's position.
    const pointPosition = turf.point([userPosition.coords.longitude, userPosition.coords.latitude]);

    const circleFeature = turf.circle(pointPosition, this.circleSize, { steps: 12 });

    //Combine the world and have the square polygon be a "hole".
    const fogFeature = this._pushCoordinate(worldFeature, circleFeature);

    return fogFeature;
  }

  //Returns a Feature
  uncoverFog(userPosition, fogFeature) {
    
    //Create new square or circle based on user's position.
    const pointPosition = turf.point([userPosition.coords.longitude, userPosition.coords.latitude]);
    const circleFeature = turf.circle(pointPosition, this.circleSize, { steps: 12 });

    //Combine the world polygon holes and the square or circle polygon hole.
    fogFeature = this._pushCoordinate(fogFeature, circleFeature);

    //Test areas
    // fogFeature = this._pushCoordinate(fogFeature, this.testPoly1)
    // fogFeature = this._pushCoordinate(fogFeature, turf.transformTranslate(circleFeature, 0.05, 90))
    // fogFeature = this._pushCoordinate(fogFeature, turf.transformTranslate(circleFeature, 0.1, 90))
    // fogFeature = this._pushCoordinate(fogFeature, turf.transformTranslate(circleFeature, 0.15, 90))
    // fogFeature = this._pushCoordinate(fogFeature, turf.transformTranslate(circleFeature, 0.2, 90))
    // fogFeature = this._pushCoordinate(fogFeature, turf.transformTranslate(circleFeature, 0.25, 90))
    // fogFeature = this._pushCoordinate(fogFeature, turf.transformTranslate(circleFeature, 0.05, 0))

    // fogFeature = this._pushCoordinate(fogFeature, turf.transformTranslate(circleFeature, 0.20, 145))
    // fogFeature = this._pushCoordinate(fogFeature, turf.transformTranslate(circleFeature, 0.25, 145))
    // fogFeature = this._pushCoordinate(fogFeature, turf.transformTranslate(circleFeature, 0.30, 145))
    // fogFeature = this._pushCoordinate(fogFeature, turf.transformTranslate(circleFeature, 0.35, 145))
    // fogFeature = this._pushCoordinate(fogFeature, turf.transformTranslate(circleFeature, 0.40, 145))
    // fogFeature = this._pushCoordinate(fogFeature, turf.transformTranslate(circleFeature, 0.45, 145))

    // fogFeature = this._pushCoordinate(fogFeature, turf.transformTranslate(circleFeature, 0.05, 270))
    // fogFeature = this._pushCoordinate(fogFeature, turf.transformTranslate(circleFeature, 0.10, 270))
    // fogFeature = this._pushCoordinate(fogFeature, turf.transformTranslate(circleFeature, 0.15, 270))
    // fogFeature = this._pushCoordinate(fogFeature, turf.transformTranslate(circleFeature, 0.20, 270))
    // fogFeature = this._pushCoordinate(fogFeature, turf.transformTranslate(circleFeature, 0.25, 270))
    // fogFeature = this._pushCoordinate(fogFeature, turf.transformTranslate(circleFeature, 0.28, 200))
    // fogFeature = this._pushCoordinate(fogFeature, turf.transformTranslate(circleFeature, 0.34, 200))

    //Simplify area, reduces points/saves data
    const options = {tolerance: 0.0001, highQuality: true};
    fogFeature = turf.simplify(fogFeature, options);

    // console.log(fogFeature.geometry.coordinates);
    return fogFeature;
  }

  _pushCoordinate(fogFeature, newPolygon) {

    //For each hole in the polygon
    if(fogFeature !== null ||fogFeature !== undefined)
    {
      for (let i = 1; i < fogFeature.geometry.coordinates.length; i++) {
      
        const holePolygon = turf.polygon([fogFeature.geometry.coordinates[i]]);
        //If one of the holes intersect with the new shape then join them together.
        if (turf.intersect(holePolygon, newPolygon)) {
          const union = turf.union(holePolygon, newPolygon);
  
          fogFeature.geometry.coordinates[i] = union.geometry.coordinates[0];
          return fogFeature;
        }
    }

    }

    //If none of the polygons intersect with the new shape then add a new hole to the polygon.
    fogFeature.geometry.coordinates.push(newPolygon.geometry.coordinates[0]);
    return fogFeature;

  }

  checkUserPointsWithinPolygon(userPosition, fogFeature) {
    
    //Create square polygon based on user's position.
    const pointPosition = turf.point([userPosition.longitude, userPosition.latitude]);

    const coordinatesArray = fogFeature.geometry.coordinates;

    let result = false;

    coordinatesArray.forEach((position) => {
    
    //Return true if the user's position is inside the uncovered area
    const searchWithin = turf.booleanPointInPolygon(pointPosition, turf.polygon([position]));

     if(searchWithin)
        result = true;
      else
        result = false;
    });

    return result;
  
  }

  // testPoly1 = turf.polygon([
  //   [
  //     [
  //       0.1345152501665723,
  //       51.57275440005134
  //     ],
  //     [
  //       0.1345152501665723,
  //       51.57116863536726
  //     ],
  //     [
  //       0.13835933510617338,
  //       51.57116863536726
  //     ],
  //     [
  //       0.13835933510617338,
  //       51.57275440005134
  //     ],
  //     [
  //       0.1345152501665723,
  //       51.57275440005134
  //     ]
  //   ]
  // ])

  // test() {
  //   let poly1 = turf.polygon([
  //     [
  //       [
  //         0.1345152501665723,
  //         51.57275440005134
  //       ],
  //       [
  //         0.1345152501665723,
  //         51.57116863536726
  //       ],
  //       [
  //         0.13835933510617338,
  //         51.57116863536726
  //       ],
  //       [
  //         0.13835933510617338,
  //         51.57275440005134
  //       ],
  //       [
  //         0.1345152501665723,
  //         51.57275440005134
  //       ]
  //     ]
  //   ])
  //   let poly2 = turf.polygon([
  //     [
  //       [
  //         0.1421694015942876,
  //         51.57262754091229
  //       ],
  //       [
  //         0.1421694015942876,
  //         51.57108405969663
  //       ],
  //       [
  //         0.14873496259707508,
  //         51.57108405969663
  //       ],
  //       [
  //         0.14873496259707508,
  //         51.57262754091229
  //       ],
  //       [
  //         0.1421694015942876,
  //         51.57262754091229
  //       ]
  //     ]
  //   ])

    // console.log(turf.intersect(poly1, poly2));

    // console.log(a.geometry.coordinates);
  }

  // _transformScale(arrayOfFeatures, scale) {
  //   const features = [];
  //   for (let i = 0; i < arrayOfFeatures.length; i++) {
  //     features.push(turf.transformScale(arrayOfFeatures[i], scale));
  //   }
  //   return features;
  // }
//}