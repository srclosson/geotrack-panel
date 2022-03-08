import { PanelPlugin } from '@grafana/data';
import { GeoTrackPanelOptions } from './types';
import { GeoTrackPanel } from './GeoTrackPanel';

export const plugin = new PanelPlugin<GeoTrackPanelOptions>(GeoTrackPanel).setPanelOptions((builder) => {
  return builder
    .addTextInput({
      path: 'latitudeColumnName',
      name: 'Latitude column name',
      description: 'Name of the column which contains the latitude of the geo-coordinate',
      category: ['Data selection'],
      defaultValue: 'lat',
    })
    .addTextInput({
      path: 'longitudeColumnName',
      name: 'Longitude column name',
      description: 'Name of the column which contains the longitude of the geo-coordinate',
      category: ['Data selection'],
      defaultValue: 'lon',
    })
    .addTextInput({
      path: 'altitudeColumnName',
      name: 'Altitude column name',
      description: 'Name of the column which contains the altitude values of the series',
      category: ['Data selection'],
      defaultValue: 'alt',
    })
    .addTextInput({
      path: 'hrColumnName',
      name: 'Heart rate column name',
      description: 'Name of the column which contains the heart rate values of the series',
      category: ['Data selection'],
      defaultValue: 'hr',
    })
    .addTextInput({
      path: 'timeColumnName',
      name: 'Time column name',
      description: 'Name of the column which contains the time values of the series',
      category: ['Data selection'],
      defaultValue: 'time',
    })
    .addBooleanSwitch({
      path: 'showSeriesCount',
      name: 'Show series counter',
      defaultValue: false,
    })
    .addRadio({
      path: 'seriesCountSize',
      defaultValue: 'sm',
      name: 'Series counter size',
      settings: {
        options: [
          {
            value: 'sm',
            label: 'Small',
          },
          {
            value: 'md',
            label: 'Medium',
          },
          {
            value: 'lg',
            label: 'Large',
          },
        ],
      },
      showIf: (config) => config.showSeriesCount,
    });
});
