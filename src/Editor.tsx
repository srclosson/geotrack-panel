import React, { useEffect } from 'react';
import { StandardEditorProps } from '@grafana/data';
import { CodeEditor } from '@grafana/ui';
import { EditorOptions, defaults } from 'types';

export const Editor: React.FC<StandardEditorProps<EditorOptions>> = ({ value, onChange }) => {
  const options = value || defaults;

  const commitContent = (configJson: string) => {
    console.log('changing', {
      ...value,
      configJson,
    });
    onChange({
      ...value,
      configJson,
    });
  };

  const onSave = (content: string) => {
    commitContent(content);
  };

  useEffect(() => {
    // on start
    return () => {
      /* on end */
    };
  });
  console.log('options', options);

  return (
    <>
      <CodeEditor language="json" width="100%" height="50vh" value={options.configJson} onSave={onSave} />
    </>
  );
};
