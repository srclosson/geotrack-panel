import React from 'react';
import { PanelProps } from '@grafana/data';
import { Options } from 'types';
import { css, cx } from 'emotion';
import DeckGL from '@deck.gl/react';
import { LineLayer } from '@deck.gl/layers';

//import { BASEMAP } from '@deck.gl/carto';
import StaticMap from 'react-map-gl';
import { TerrainLayer } from '@deck.gl/geo-layers';
import { stylesFactory } from '@grafana/ui';
import { RGBAColor } from '@deck.gl/core';
// import { Position } from 'deck.gl';
//import { DataFrame } from '@grafana/data';

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

interface Props extends PanelProps<Options> {}

export const GeotrackPanel: React.FC<Props> = ({ options, data, width, height }) => {
  //const theme = useTheme();
  const styles = getStyles();
  console.log('options', options);
  let config: any = '';
  try {
    config = JSON.parse(options.editor.configJson);
  } catch (ex) {
    return <div>Failed to parse config JSON</div>;
  }

  console.log("data", data);

  const layers = config.layers.map((l: any) => {
    console.log('creating l', l);
    switch (l.type) {
      case 'TerrainLayer':
        return new TerrainLayer(l);
      case 'LineLayer':
        const lineLayerData: any[] = [];
        const lat = data.series.find((s) => l.dataMapping.latitude === s.refId!)?.fields[1].values.toArray() || [];
        const latTime = data.series.find((s) => l.dataMapping.latitude === s.refId!)?.fields[0].values.toArray() || [];
        const lon = data.series.find((s) => l.dataMapping.longitude === s.refId!)?.fields[1].values.toArray() || [];
        const ele = data.series.find((s) => l.dataMapping.elevation === s.refId!)?.fields[1].values.toArray() || [];
        for (let i = 1; i <= lat.length - 1; i++) {
          lineLayerData.push({
            inbound: i - 1,
            outbound: i,
            from: {
              name: `lat: ${lat[i - 1]}, lon: ${lon[i - 1]}, ele: ${ele[i - 1]}, time: ${latTime[i - 1]}`,
              coordinates: [lat[i - 1], lon[i - 1], ele[i - 1]],
            },
            to: {
              name: `lat: ${lat[i]}, lon: ${lon[i]}, ele: ${ele[i]} time: ${latTime[i]}`,
              coordinates: [lat[i], lon[i], ele[i]],
            },
          });
        }
        
        const ll = new LineLayer({
          id: l.id,
          data: lineLayerData,
          getWidth: l.getWidth,
          getSourcePosition: (d: any) => {
            console.log("d", d, lat, lon, ele);
            return d.from.coordinates
          },
          getTargetPosition: (d: any) => d.to.coordinates,
          getColor: (d): RGBAColor => {
            console.log("d", d);
            return [140, 140, 0];
          },
        });
        return ll;
    }
    return undefined;
  });

  console.log("layers", layers);
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
      <DeckGL initialViewState={config.initialViewState} controller={true} layers={layers}>
        <StaticMap
          mapboxApiAccessToken={config.mapboxApiToken}
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
    inner: css`
      position: absolute;
      top: 0;
      left: 0;
    `,
  };
});
