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
