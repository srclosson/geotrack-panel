import React from 'react';

import { PanelProps, DataFrame } from '@grafana/data';
import { GeoTrackPanelOptions } from 'types';

import { css, cx } from 'emotion';
import { stylesFactory } from '@grafana/ui';

import DeckGL from '@deck.gl/react';
import { LineLayer } from '@deck.gl/layers';
import { COORDINATE_SYSTEM, RGBAColor } from '@deck.gl/core';

//import { BASEMAP } from '@deck.gl/carto';
import StaticMap from 'react-map-gl';
import { TerrainLayer } from '@deck.gl/geo-layers';
// import { Position } from 'deck.gl';

const MAX_ZOOM = 19;
const MIN_ZOOM = 2;

const MAPBOX_TOKEN = 'pk.eyJ1Ijoic3JjbG9zc29uIiwiYSI6ImNsMGdxamNidDAxOTcza21qOTFwNmRkNGkifQ.u-AcyC1afRBc-Eb-dOZ0iw';

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

interface Props extends PanelProps<GeoTrackPanelOptions> {}

const TERRAIN_IMAGE = `https://api.mapbox.com/v4/mapbox.terrain-rgb/{z}/{x}/{y}.png?access_token=${MAPBOX_TOKEN}`;
const SURFACE_IMAGE = `https://api.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}@2x.png?access_token=${MAPBOX_TOKEN}`;

type TimeLLZ = { ts: number; lat: number; lon: number; ele: number , hr: number};

function readTimePosData(series: DataFrame, options: GeoTrackPanelOptions): TimeLLZ[] {

  const latitudeField = series.fields.find((field) => field.name === options.latitudeColumnName);
  const longitudeField = series.fields.find((field) => field.name === options.longitudeColumnName);
  const altitudeField = series.fields.find((field) => field.name === options.altitudeColumnName);
  const timeField = series.fields.find((field) => field.name === options.timeColumnName);
  const hrField = series.fields.find((field) => field.name === options.hrColumnName);

  if (!latitudeField || !longitudeField || !timeField || !altitudeField || !hrField) {
    console.log("Missing requires fields in dataset");
    return [];
  }

  console.log("Found latitude column: ", latitudeField.name);
  console.log("Found longitude column: ", longitudeField.name);
  console.log("Found altitude column: ", altitudeField.name);
  console.log("Found time column: ", timeField.name);
  console.log("Found heart rate column: ", hrField.name);

  const len = Math.min(timeField.values.length, latitudeField.values.length, longitudeField.values.length);

  var dataset: TimeLLZ[] = [];
  for (var i = 0; i < len; i++) {
    dataset.push({
      ts: timeField.values.get(i) as number,
      lat: latitudeField.values.get(i),
      lon: longitudeField.values.get(i),
      ele: altitudeField.values.get(i),
      hr: hrField.values.get(i),
    });
  }

  return dataset;
}

export const GeoTrackPanel: React.FC<Props> = ({ options, data, width, height }) => {
  //const theme = useTheme();
  const styles = getStyles();

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

  if (data.series.length < 1) {
    console.log('No data series provided');
    return null;
  }

  const llzArray = readTimePosData(data.series[0], options);
  if (llzArray.length === 0) {
    console.log('Data series length is 0');
    return null;
  }  

  let lineLayerData = [];
  for (var i = 1; i < llzArray.length; i++) {
    var last_llz = llzArray[i-1];
    var llz = llzArray[i];
    lineLayerData.push({
      inbound: i - 1,
      outbound: i,
      // TODO: create iterator for fields other than lat, lon, ele
      // pack them into an array
      from: {
        name: last_llz.toString(),
        coordinates: [last_llz.lat, last_llz.lon, last_llz.ele],
        hr: last_llz.hr, // sens_vals: last_llz.sens_vals
      },
      to: {
        name: llz.toString(),
        coordinates: [llz.lat, llz.lon, llz.ele],
        hr: llz.hr, // sens_vals: llz.sens_vals
      },
    });
  }

  console.log('linelayerdata', lineLayerData);
  const lineLayer = new LineLayer({
    id: 'line-layer',
    data: lineLayerData,
    coordinateSystem: COORDINATE_SYSTEM.LNGLAT,
    getWidth: 5,
    getSourcePosition: (d: any) => d.from.coordinates,
    getTargetPosition: (d: any) => d.to.coordinates,
    getColor: (d: any) => {
      // const result: RGBAColor = [((d.from.hr - 140) / (190 - 140)) * 255, 140, 0];
      const result: RGBAColor = [255, 0, 0];
      // console.log('colour', d, result);
      return result;
    },
  });

  // Viewport settings
  const firstPoint = lineLayerData[0].from.coordinates;
  const INITIAL_VIEW_STATE = {
    latitude: firstPoint[0],
    longitude: firstPoint[1],
    zoom: 5,
    bearing: 0,
    pitch: 0,
    maxZoom: MAX_ZOOM,
    minZoom: MIN_ZOOM,
  };

  return (
    <div
      className={cx(
        styles.wrapper,
        css`
          width: ${width}px;
          height: ${height}px;
        `
      )}
    >
    <DeckGL initialViewState={INITIAL_VIEW_STATE} controller={true} layers={[lineLayer, terrainLayer]}>
        <StaticMap
          mapboxApiAccessToken={MAPBOX_TOKEN}
          //mapStyle={BASEMAP.POSITRON}
          mapStyle={MAPBOX_BASE_LAYER}
        />
      </DeckGL>
    </div>
  );
};

const getStyles = stylesFactory(() => {
  return {
    wrapper: css`
      position: relative;
    `,
  };
});
