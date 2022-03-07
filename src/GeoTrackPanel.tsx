import React, { useEffect, useCallback } from 'react';
import { PanelProps } from '@grafana/data';
import { SimpleOptions } from 'types';
import { css, cx } from 'emotion';
import { stylesFactory /*, useTheme*/ } from '@grafana/ui';
import postscribe from 'postscribe';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import OLCesium from 'olcs/OLCesium';

interface Props extends PanelProps<SimpleOptions> {}

globalThis.CESIUM_BASE_URL = 'public/plugins/grafana-labs-geotrack-panel/cesium/Build/CesiumUnminified';
const loadCesium = async (): Promise<any> => {
  return new Promise((resolve, reject) => {
    try {
      const url = `${globalThis.CESIUM_BASE_URL}/Cesium.js`;
      postscribe(document.head, '', {
        done: () => {
          fetch(url, { mode: 'no-cors' })
            .then((response: Response) => response.text())
            .then((code) => {
              let res = new Function(code)();
              resolve(res);
            })
            .catch((err) => {
              console.error("here's an error", err);
              reject(err);
            });
        },
        error: (err: any) => {
          console.error('rejecting', err);
          reject(err);
        },
      });
    } catch (ex) {
      reject(ex);
    }
  });
};

export const GeotrackPanel: React.FC<Props> = ({ options, data, width, height }) => {
  //const theme = useTheme();
  const styles = getStyles();

  const loadDependencies = useCallback(async () => {
    await loadCesium();
  }, []);

  useEffect(() => {
    loadDependencies();
    const map = new Map({
      target: 'map',
      layers: [
        new TileLayer({
          source: new XYZ({
            url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          }),
        }),
      ],
      view: new View({
        center: [0, 0],
        zoom: 2,
      }),
    });

    const ol3d = new OLCesium({ map });
    ol3d.setEnabled(true);
  }, [loadDependencies]);

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
      <div id="map"></div>
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
