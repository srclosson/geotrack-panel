const defaultConfigJson = `{

}`;

export interface EditorOptions {
  configJson: string;
}

export interface Options {
  editor: EditorOptions;
}

export const defaultsEditor: EditorOptions = {
  configJson: defaultConfigJson,
};

export const defaults: Options = {
  editor: defaultsEditor,
};

let initialViewState = {
  latitude: 0,
  longitude: 0,
  zoom: 14,
  bearing: 20,
  pitch: 20,
  maxZoom: 19,
  minZoom: 1,
};

export function setInitialViewStateLatLon(lat: number, lon: number) {
  initialViewState.latitude = lat;
  initialViewState.longitude = lon;
}

export function getInitialViewState() {
  return initialViewState;
}
