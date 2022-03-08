type SeriesSize = 'sm' | 'md' | 'lg';

export interface GeoTrackPanelOptions {
  customTextureURL: string;
  latitudeColumnName: string;
  longitudeColumnName: string;
  timeColumnName: string;
  altitudeColumnName: string;
  hrColumnName: string;
  showSeriesCount: boolean;
  lineWidth: number;
  seriesCountSize: SeriesSize;
}
