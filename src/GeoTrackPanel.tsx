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
import { parseConfigJson } from 'common';

interface Props extends PanelProps<Options> {}

export const GeotrackPanel: React.FC<Props> = ({ options, data, width, height }) => {
  //const theme = useTheme();
  const styles = getStyles();
  const config: any = parseConfigJson(options.editor.configJson);

  const layers = config?.layers.map((l: any) => {
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
          getSourcePosition: (d: any) => d.from.coordinates,
          getTargetPosition: (d: any) => d.to.coordinates,
          getColor: (d): RGBAColor => l.color,
        });
        return ll;
    }
    return undefined;
  });

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
        { config.baseLayer ?
          <StaticMap
            mapboxApiAccessToken={config.mapboxApiToken}
            mapStyle={config.baseLayer}
          />
          :
          <StaticMap
            mapboxApiAccessToken={config.mapboxApiToken}
          />
        }
        
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
