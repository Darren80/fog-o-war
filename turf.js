import * as turf from "@turf/turf";

let points = [
  [-1.3088, 53.6918],
  [-1.3088, 53.6918],
];

const line = turf.lineString(points);

const radius = 50; // meters

const options = {
  steps: 64, // number of points on the circle
  units: "meters", // radius units
};

const buffer = turf.buffer(line, radius, options);

// Extract the coordinates of the outer ring of the buffer and use them to create a new Polygon
const coordinates = buffer.geometry.coordinates[0];
const polygon = turf.polygon([coordinates]);

const options2 = { tolerance: 0.0001, highQuality: true };
const simplified = turf.simplify(polygon, options2);

const mask = turf.polygon([
  [
    [0, 89.9],
    [179.9, 89.9],
    [179.9, -89.9],
    [0, -89.9],
    [-179.9, -89.9],
    [-179.9, 0],
    [-179.9, 89.9],
    [0, 89.9],
  ],
]);
const masked = turf.mask(simplified, mask);
masked.properties = {
  stroke: "#555555",
  "stroke-width": 5,
  "stroke-opacity": 0.2,
  fill: "#000000",
  "fill-opacity": 1,
};

export const turfCoOrds = {
  type: "FeatureCollection",
  features: [masked],
};
