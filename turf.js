import * as turf from "@turf/turf";

export class TurfWorker {
  constructor() {

  }

  //Returns a Feature
  worldFeature() {
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

  //Returns a Feature
  FogWithUncoveredRegionsFeature(userPosition) {
    const circleSize = 0.1; //in kilometers

    const pointPosition = turf.point([userPosition.coords.longitude, userPosition.coords.latitude]);
    const worldFeature = this.worldFeature();
    const circleFeature = turf.circle(pointPosition, circleSize, { steps: 12 });

    //Test circles
    const circle1 = turf.transformTranslate(circleFeature, 0.05, 0);
    const circle2 = turf.transformTranslate(circleFeature, 0.1, 90);
    const circle3 = turf.transformTranslate(circleFeature, 0.15, 90);

    //Add them together
    const fogFeature = this._pushCoordinates(worldFeature, [circleFeature, circle1, circle2, circle3])

    // console.log(fogFeature, '<-- final LinearRing');

    return fogFeature;
  }

  _pushCoordinates(originalFeature, arrayOfFeatures) {

    if (arrayOfFeatures.length === 0) {
      const newFeature = originalFeature.geometry.coordinates.push(arrayOfFeatures[0].geometry.coordinates[0]);
      return newFeature;
    }

    let union = arrayOfFeatures[0];
    for (let i = 1; i < arrayOfFeatures.length; i++) {
      union = turf.union(union, arrayOfFeatures[i])
    }

    const newFeature = originalFeature;
    newFeature.geometry.coordinates.push(union.geometry.coordinates[0]);
    return newFeature;
    
  }

  _transformScale(arrayOfFeatures, scale) {
    const features = [];
    for (let i = 0; i < arrayOfFeatures.length; i++) {
      features.push(turf.transformScale(arrayOfFeatures[i], scale));
    }
    return features;
  }
}




// const radius = 50; // meters

// const options = {
//   steps: 64, // number of points on the circle
//   units: "meters", // radius units
// };

// const buffer = turf.buffer(line, radius, options);

// // Extract the coordinates of the outer ring of the buffer and use them to create a new Polygon

// const coordinates = buffer.geometry.coordinates[0];
// const polygon = turf.polygon([coordinates]);

// const options2 = { tolerance: 0.0001, highQuality: true };
// const simplified = turf.simplify(polygon, options2);

// const mask = turf.polygon([
//   [
//     [0, 89.9],
//     [179.9, 89.9],
//     [179.9, -89.9],
//     [0, -89.9],
//     [-179.9, -89.9],
//     [-179.9, 0],
//     [-179.9, 89.9],
//     [0, 89.9],
//   ],
// ]);

// const masked = turf.mask(simplified, mask);
// masked.properties = {
//   stroke: "#555555",
//   "stroke-width": 5,
//   "stroke-opacity": 0.2,
//   fill: "#000000",
//   "fill-opacity": 1,
// };

// console.log(masked)
// export const turfCoOrds = {
//   type: "FeatureCollection",
//   features: [masked],
// };
