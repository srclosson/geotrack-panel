import React, { useState, useEffect } from 'react';
import { PanelProps, PanelData, LoadingState } from '@grafana/data';
import { Options, setInitialViewStateLatLon, getInitialViewState } from 'types';
import { css, cx } from 'emotion';
import DeckGL from '@deck.gl/react';
import { IconLayer, LineLayer } from '@deck.gl/layers';
import { CesiumIonLoader } from '@loaders.gl/3d-tiles';

//import { BASEMAP } from '@deck.gl/carto';
import StaticMap from 'react-map-gl';
import { TerrainLayer, Tile3DLayer } from '@deck.gl/geo-layers';
import { stylesFactory } from '@grafana/ui';
import { RGBAColor } from '@deck.gl/core';
import { parseConfigJson } from 'common';
import { MapControls } from './components/MapControls';

interface Props extends PanelProps<Options> {}

function readTimePosData(data: PanelData, l: any): any[] {
  const lineLayerData: any[] = [];
  var lat: number[] = [];
  // var latTime: number[] = [];
  var lon: number[] = [];
  var ele: number[] = [];
  const series = data.series;

  // ugly but functional
  for (var s of series) {
    if (lat.length === 0) {
      lat = s.fields.find((field) => field.name === l.dataMapping.latitude)?.values.toArray() || [];
    }
    if (lat.length === 0) {
      if (s.name === l.dataMapping.latitude) {
        lat = s.fields[1].values.toArray();
      }
    }

    if (lon.length === 0) {
      lon = s.fields.find((field) => field.name === l.dataMapping.longitude)?.values.toArray() || [];
    }
    if (lon.length === 0) {
      if (s.name === l.dataMapping.longitude) {
        lon = s.fields[1].values.toArray();
      }
    }

    if (ele.length === 0) {
      ele = s.fields.find((field) => field.name === l.dataMapping.elevation)?.values.toArray() || [];
    }
    if (ele.length === 0) {
      if (s.name === l.dataMapping.elevation) {
        ele = s.fields[1].values.toArray();
      }
    }
  }

  if (lat.length === 0 || lon.length === 0 || ele.length === 0) {
    console.log('missing required fields');
    return [];
  }

  if (data.state === LoadingState.Streaming) {
    return [[lon[lon.length - 1], lat[lat.length - 1], ele[ele.length - 1] + l.dataMapping.elevationOffset]];
  }

  for (let i = 1; i <= lat.length - 1; i++) {
    lineLayerData.push({
      inbound: i - 1,
      outbound: i,
      from: {
        name: `lon: ${lon[i - 1]}, lat: ${lat[i - 1]}, ele: ${ele[i - 1]}`,
        coordinates: [lon[i - 1], lat[i - 1], ele[i - 1] + 5],
      },
      to: {
        name: `lon: ${lon[i]}, lat: ${lat[i]}, ele: ${ele[i]}`,
        coordinates: [lon[i], lat[i], ele[i] + l.dataMapping.elevationOffset],
      },
    });
  }

  return lineLayerData;
}

export const GeotrackPanel: React.FC<Props> = ({ options, data, width, height }) => {
  //const theme = useTheme();
  const styles = getStyles();
  const config: any = parseConfigJson(options.editor.configJson);
  const [showTerrainLayer, setShowTerrainLayer] = useState(true);
  const deckglConfig: any = {
    controller: true,
    initialViewState: config.initialViewState ?? getInitialViewState(),
  };

  let initialLat: number | undefined = undefined;
  let initialLon: number | undefined = undefined;

  deckglConfig.layers = config?.layers.map((l: any) => {
    switch (l.type) {
      case 'TerrainLayer':
        if (!showTerrainLayer) {
          return undefined;
        }
        return new TerrainLayer(l);
      case 'Tile3DLayer':
        return new Tile3DLayer({
          id: l.id,
          data: l.data,
          loader: CesiumIonLoader,
          loadOptions: l.loadOptions,
          // override scenegraph subLayer prop
          _subLayerProps: {
            scenegraph: { _lighting: 'flat' },
          },
        });
      case 'IconLayer':
        const iconLayerData = readTimePosData(data, l);
        initialLon = iconLayerData[0][0];
        initialLat = iconLayerData[0][1];
        return new IconLayer({
          id: l.id,
          data: iconLayerData,
          pickable: l.pickable,
          // iconAtlas and iconMapping are required
          // getIcon: return a string
          iconAtlas: l.iconAtlas, //'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/icon-atlas.png',
          iconMapping: {
            marker: { x: 0, y: 0, width: 128, height: 128, mask: true },
          },
          getIcon: (d) => l.icon,
          sizeScale: l.sizeScale,
          getPosition: (d: any) => d,
          getSize: (d: any) => l.size,
          getColor: (d: any) => l.color,
        });
      case 'LineLayer':
        const lineLayerData = readTimePosData(data, l);

        if (!initialLon && lineLayerData.length > 0) {
          initialLon = lineLayerData[lineLayerData.length - 1].to.coordinates[0];
        }
        if (!initialLat && lineLayerData.length > 0) {
          initialLat = lineLayerData[lineLayerData.length - 1].to.coordinates[1];
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
    return [];
  });

  useEffect(() => {
    setInitialViewStateLatLon(initialLat ?? 0, initialLon ?? 0);
    // eslint-disable-next-line
  }, []);

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
      <DeckGL {...deckglConfig}>
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
