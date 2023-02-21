import mask from '@turf/mask';
import square from '@turf/square';
import union from '@turf/union';
import { Geojson } from 'react-native-maps';
import * as turf from '@turf/turf';

export class HandleFog {
    worldCoordinates = [
        [85, 90],
        [85, 0.1],
        [85, -90],
        [85, -179.9],
        [0, -179.9],
        [-85, -179.9],
        [-85, 90],
        [-85, 0.1],
        [-85, 90],
        [-85, 179.9],
        [0, 179.9],
        [85, 179.9]
    ];

    uncoveredAreaCoordinates = [
        [
            0.3146310377629504,
            51.85860811292574
        ],
        [
            0.2005933694534292,
            51.79075558159764
        ],
        [
            0.25878743790002545,
            51.74947347827188
        ],
        [
            0.3814609177664181,
            51.748547233552046
        ],
        [
            0.3897527000614218,
            51.821162381860745
        ],
        [
            0.3146310377629504,
            51.85860811292574
        ]
    ]

    constructor() {

    }

    createFog() {
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

        return {
            type: "FeatureCollection",
            features: [masked],
        };
        // return <Text>
        //     {this.worldCoordinates}
        // </Text>
        // return (
        //     <Geojson
        //         geojson={{
        //             features: [
        //                 {
        //                     type: 'Feature',
        //                     properties: {},
        //                     "geometry": {
        //                         "coordinates": [
        //                             this.worldCoordinates,
        //                             this.uncoveredAreaCoordinates
        //                         ],
        //                         "type": "Polygon"
        //                     }
        //                 }
        //             ]
        //         }}
        //         fillColor="rgba(255,0,0,0.8)"
        //         strokeColor="#000" // fallback for when `strokeColors` is not supported by the map-provider
        //         strokeWidth={6}
        //     />
        // )
    }

    expandHole() {
        // var bbox = [-3, -2.5, -1, 0];
        // var squared = square(bbox);

        // console.log(squared);
    }
}