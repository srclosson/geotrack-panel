import { PanelPlugin } from '@grafana/data';
import { Options, defaults } from './types';
import { GeotrackPanel } from './GeoTrackPanel';
import { Editor } from './Editor';

export const plugin = new PanelPlugin<Options>(GeotrackPanel).setPanelOptions((builder) => {
  builder.addCustomEditor({
    id: 'config-editor',
    path: 'editor',
    name: 'Configuration in JSON format',
    editor: Editor,
    defaultValue: defaults,
  });
});
