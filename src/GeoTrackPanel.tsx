import React, { useState } from 'react';
import { PanelProps } from '@grafana/data';
import { Options } from 'types';
import { css, cx } from 'emotion';
import DeckGL from '@deck.gl/react';
import { IconLayer, LineLayer } from '@deck.gl/layers';

//import { BASEMAP } from '@deck.gl/carto';
import StaticMap from 'react-map-gl';
import { TerrainLayer } from '@deck.gl/geo-layers';
import { stylesFactory } from '@grafana/ui';
import { RGBAColor } from '@deck.gl/core';
import { parseConfigJson } from 'common';
import { MapControls } from './components/MapControls';
import { AddNote } from './components/AddNote';

interface Props extends PanelProps<Options> {}
interface INote {
  x?: number;
  y?: number;
  lat?: number;
  lon?: number;
  z?: number;
  showAddNote: boolean;
}

const ICON_MAPPING = {
  marker: { x: 0, y: 0, width: 128, height: 128, mask: true },
};

export const GeotrackPanel: React.FC<Props> = ({ options, data, width, height }) => {
  //const theme = useTheme();
  const styles = getStyles();
  const config: any = parseConfigJson(options.editor.configJson);
  const [showTerrainLayer, setShowTerrainLayer] = useState(true);
  const [showLineLayer, setShowLineLayer] = useState(true);
  const [elevationOffset, setElevationOffset] = useState(10);
  const [displayAddNote, setDisplayAddNote] = useState<INote>({ showAddNote: false });

  const notes: INote[] = JSON.parse(localStorage.getItem('annotations') ?? '[]');

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
          if (!initialLat) initialLat = lon[i - 1];
          if (!initialLng) initialLng = lat[i - 1];
          // hacky placement of this so that we can have the default positon set when we're toggling the show of line layer
          if (!showLineLayer) return undefined;

          lineLayerData.push({
            inbound: i - 1,
            outbound: i,
            from: {
              name: `lat: ${lat[i - 1]}, lon: ${lon[i - 1]}, ele: ${ele[i - 1]}, time: ${latTime[i - 1]}`,
              coordinates: [lat[i - 1], lon[i - 1], ele[i - 1] + elevationOffset],
            },
            to: {
              name: `lat: ${lat[i]}, lon: ${lon[i]}, ele: ${ele[i]} time: ${latTime[i]}`,
              coordinates: [lat[i], lon[i], ele[i] + elevationOffset],
            },
          });
        }

        const ll = new LineLayer({
          id: l.id,
          data: lineLayerData,
          getWidth: l.getWidth,
          getSourcePosition: (d: any) => d.from.coordinates,
          getTargetPosition: (d: any) => d.to.coordinates,
          getColor: (d: any): RGBAColor => [d.from.coordinates[2], 100, 0],
          pickable: true,
          onClick: (e) => {
            setDisplayAddNote({
              x: e.x,
              y: e.y,
              lat: e.coordinate?.[0],
              lon: e.coordinate?.[1],
              z: (e.object as any).from.coordinates[2] + 400,
              showAddNote: true,
            });
          },
        });
        return ll;
    }
    return undefined;
  });

  const thing = new IconLayer({
    id: `icon-layer`,
    data: notes,
    pickable: true,
    // iconAtlas and iconMapping are required
    // getIcon: return a string
    iconAtlas: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/icon-atlas.png',
    iconMapping: ICON_MAPPING,
    getIcon: () => 'marker',
    sizeScale: 5,
    // this is flipped right now
    getPosition: (d) => {
      return [(d as any).lat, (d as any).lon, (d as any).z];
    },
    getSize: () => 10,
    getColor: () => [140, 140, 0] as any,
  });

  layers.push(thing);

  const initialViewState = config.initialViewState ?? {
    latitude: initialLat ?? 0,
    longitude: initialLng ?? 0,
    zoom: 11,
    bearing: 20,
    pitch: 20,
    maxZoom: 19,
    minZoom: 1,
  };

  const labels = [
    {
      text: 'Toggle Terrain Layer',
      isActive: showTerrainLayer,
      onClick: () => {
        setShowTerrainLayer(!showTerrainLayer);
      },
    },
    {
      text: 'Toggle Line Layer',
      isActive: showLineLayer,
      onClick: () => {
        setShowLineLayer(!showLineLayer);
      },
    },
  ];

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
      <DeckGL
        initialViewState={initialViewState}
        controller={true}
        layers={layers}
        getTooltip={({ object }: { object: any }) => {
          return (
            object &&
            object.label &&
            `Coordinates: [${object?.lat.toFixed(2)},${object.lon.toFixed(2)}] \n ${object?.label}`
          );
        }}
      >
        <StaticMap mapboxApiAccessToken={config.mapboxApiToken} mapStyle={config?.baseLayer} />
        <MapControls labels={labels} elevation={elevationOffset} onElevationChange={setElevationOffset} />
        {displayAddNote.x && displayAddNote.y && displayAddNote.showAddNote ? (
          <AddNote note={displayAddNote} onSubmit={setDisplayAddNote} />
        ) : null}
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
