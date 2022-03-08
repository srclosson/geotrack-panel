import React, { useState } from 'react';
import { PanelProps } from '@grafana/data';
import { Button, Card, Collapse, Select } from '@grafana/ui';
import { SimpleOptions } from 'types';
import { css /*, cx */ } from 'emotion';
// import { stylesFactory /*, useTheme*/ } from '@grafana/ui';
import DeckGL from '@deck.gl/react';
// import { LineLayer } from '@deck.gl/layers';
//import { BASEMAP } from '@deck.gl/carto';
import StaticMap from 'react-map-gl';
import { TerrainLayer } from '@deck.gl/geo-layers';
import { MapControls } from 'components/MapControls';
// import { Position } from 'deck.gl';
//import { DataFrame } from '@grafana/data';
import { PathLayer } from '@deck.gl/layers';

export const GeotrackPanel: React.FC<Props> = ({ options, data, width, height }) => {
  const [showTooltipControls, setShowTooltipControls] = useState(true);
  const [isOpen, setIsOpen] = useState(true);
  //const theme = useTheme();
  //const styles = getStyles();

  const startLngLat = [-119.0381577164, 37.65240240512328];
  const endLngLat = [-119.0294168628, 37.6427614637];
  /**
   * Data format:
   * [
   *   {
   *     waypoints: [
   *      {coordinates: [-122.3907988, 37.7664413], timestamp: 1554772579000}
   *      {coordinates: [-122.3908298,37.7667706], timestamp: 1554772579010}
   *       ...,
   *      {coordinates: [-122.4485672, 37.8040182], timestamp: 1554772580200}
   *     ]
   *   }
   * ]
   */

  const pathData = [
    {
      path: [startLngLat, endLngLat],
    },
  ];

  const pathLayer = new PathLayer({
    id: 'trips-layer',
    data: pathData,
    // getPath: (d) => d.waypoints.map((p) => p.coordinates),
    // deduct start timestamp from each data point to avoid overflow
    getColor: [253, 128, 93],
    opacity: 0.8,
    widthMinPixels: 20,
    // rounded: true,
    // fadeTrail: true,
    // trailLength: 200,
    // currentTime: 100,
  });

  // Viewport settings
  const INITIAL_VIEW_STATE = {
    latitude: 37.6511,
    longitude: -119.0268,
    zoom: 17,
    bearing: 30,
    pitch: 30,
    maxZoom: MAX_ZOOM,
    minZoom: MIN_ZOOM,
  };

  const ELEVATION_DECODER = {
    rScaler: 6553.6,
    gScaler: 25.6,
    bScaler: 0.1,
    offset: -10000,
  };

  const terrainLayer = new TerrainLayer({
    id: 'terrain',
    minZoom: 11,
    //maxZoom: 23,
    elevationDecoder: ELEVATION_DECODER,
    elevationData: TERRAIN_IMAGE,
    texture: SURFACE_IMAGE,
    wireframe: false,
    color: [255, 255, 255],
  });

  // const hexLayer = new HexagonLayer({
  //   id: 'hexagon-layer',
  //   data,
  //   pickable: true,
  //   extruded: true,
  //   radius: 200,
  //   elevationScale: 4,
  //   getPosition: d => {

  //   }
  // });

  console.log('we got data', data);
  return (
    <div>
      <DeckGL initialViewState={INITIAL_VIEW_STATE} controller={true} layers={[terrainLayer, pathLayer]}>
        <StaticMap
          mapboxApiAccessToken={MAPBOX_TOKEN}
          //mapStyle={BASEMAP.POSITRON}
          mapStyle={MAPBOX_BASE_LAYER}
        />
        <MapControls />
      </DeckGL>
    </div>
  );
};

// const getStyles = stylesFactory(() => {
//   return {
//     wrapper: css`
//       position: relative;
//     `,
//   };
// });

const BASEMAP_TILE_SOURCE_NAME = 'simple-tiles';
const BASEMAP_TILE_SERVERS = [
  // 'http://a.tile.osm.org/{z}/{x}/{y}.png',
  // 'http://b.tile.osm.org/{z}/{x}/{y}.png',
  // 'http://c.tile.osm.org/{z}/{x}/{y}.png',
  '//stamen-tiles-a.a.ssl.fastly.net/terrain/{z}/{x}/{y}.jpg',
  '//stamen-tiles-b.a.ssl.fastly.net/terrain/{z}/{x}/{y}.jpg',
  '//stamen-tiles-c.a.ssl.fastly.net/terrain/{z}/{x}/{y}.jpg',
];
const BASEMAP_ATTRIBUTION = `Map tiles by <a href="http://stamen.com">Stamen Design</a>, under
<a href="http://creativecommons.org/licenses/by/3.0"> CC BY 3.0</a>. Data by
<a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">
ODbL</a>.`.replace(/\n/gm, '');
const COMMON_LAYER_CONFIG = {
  minZoom: 2,
  maxZoom: 17, // New data will be requested until this level
  pixelScaleFactor: 8,
  tileSize: 256,
  isTms: true,
  topoLayerClusteringSwithLevel: 13,
  maxVisibleRasterLayers: 3,
  maxConfigurableLayers: 26,
};
const MAP_CONFIG = {
  MIN_ZOOM: 1,
  MAX_ZOOM: 18,
  INITIAL_ZOOM: 9,
  SHOW_TILE_BOUNDARIES: false,
  DRAG_ROTATE: false,
  ZOOM_NO_DATA: 2,
  SEARCH_DEFAULT_ZOOM: 14,
};

const MAPBOX_BASE_LAYER = {
  version: 8,
  sources: {
    [BASEMAP_TILE_SOURCE_NAME]: {
      type: 'raster',
      tiles: BASEMAP_TILE_SERVERS,
      tileSize: COMMON_LAYER_CONFIG.tileSize,
      attribution: BASEMAP_ATTRIBUTION,
    },
  },
  layers: [
    {
      id: BASEMAP_TILE_SOURCE_NAME,
      type: 'raster',
      source: BASEMAP_TILE_SOURCE_NAME,
      minzoom: MAP_CONFIG.MIN_ZOOM,
      maxzoom: MAP_CONFIG.MAX_ZOOM,
    },
  ],
};

interface Props extends PanelProps<SimpleOptions> {}

const MAPBOX_TOKEN = 'pk.eyJ1Ijoic3JjbG9zc29uIiwiYSI6ImNsMGdxamNidDAxOTcza21qOTFwNmRkNGkifQ.u-AcyC1afRBc-Eb-dOZ0iw';

const TERRAIN_IMAGE = `https://api.mapbox.com/v4/mapbox.terrain-rgb/{z}/{x}/{y}.png?access_token=${MAPBOX_TOKEN}`;
const SURFACE_IMAGE = `https://api.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}@2x.png?access_token=${MAPBOX_TOKEN}`;

const MAX_ZOOM = 19;
const MIN_ZOOM = 2;
