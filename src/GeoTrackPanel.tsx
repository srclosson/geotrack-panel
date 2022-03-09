import React, { useState } from 'react';
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
import { parseConfigJson } from 'common';
import { MapControls } from './components/MapControls';

interface Props extends PanelProps<Options> {}

export const GeotrackPanel: React.FC<Props> = ({ options, data, width, height }) => {
  //const theme = useTheme();
  const styles = getStyles();
  const config: any = parseConfigJson(options.editor.configJson);
  const [showTerrainLayer, setShowTerrainLayer] = useState(true);
  console.log(`🚀 ~ config`, config);

  let initialLat: number | undefined = undefined;
  let initialLng: number | undefined = undefined;

  const layers = config?.layers.map((l: any) => {
    switch (l.type) {
      case 'TerrainLayer':
        if (!showTerrainLayer) return undefined;
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
              name: `lon: ${lon[i - 1]}, lat: ${lat[i - 1]}, ele: ${ele[i - 1]}, time: ${latTime[i - 1]}`,
              coordinates: [lon[i - 1], lat[i - 1], ele[i - 1] + 5],
            },
            to: {
              name: `lon: ${lon[i]}, lat: ${lat[i]}, ele: ${ele[i]} time: ${latTime[i]}`,
              coordinates: [lon[i], lat[i], ele[i] + 5],
            },
          });
          if (!initialLat) initialLat = lon[i - 1];
          if (!initialLng) initialLng = lat[i - 1];
        }

        const ll = new LineLayer({
          id: l.id,
          data: lineLayerData,
          getWidth: l.getWidth,
          getSourcePosition: (d: any) => d.from.coordinates,
          getTargetPosition: (d: any) => d.to.coordinates,
          getColor: (d: any): RGBAColor => [d.from.coordinates[2], 100, 0],
        });
        return ll;
    }
    return undefined;
  });

  const initialViewState = config.initialViewState ?? {
    latitude: initialLat ?? 0,
    longitude: initialLng ?? 0,
    zoom: 14,
    bearing: 20,
    pitch: 20,
    maxZoom: 19,
    minZoom: 1,
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
      <DeckGL initialViewState={initialViewState} controller={true} layers={layers}>
        {config.baseLayer ? (
          <>
            <StaticMap mapboxApiAccessToken={config.mapboxApiToken} mapStyle={config.baseLayer} />
            <MapControls
              toggleTerrain={() => {
                setShowTerrainLayer(!showTerrainLayer);
              }}
            />
          </>
        ) : (
          <>
            <StaticMap mapboxApiAccessToken={config.mapboxApiToken} />
            <MapControls
              toggleTerrain={() => {
                setShowTerrainLayer(!showTerrainLayer);
              }}
            />
          </>
        )}
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
