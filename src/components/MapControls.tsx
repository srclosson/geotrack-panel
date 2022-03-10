import { Collapse } from '@grafana/ui';
import { css } from 'emotion';
import React, { useState } from 'react';

export const MapControls = ({ toggleTerrain }: { toggleTerrain: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Collapse
      className={css`
        margin: 30px;
        width: fit-content;
        display: flex;
        height: fit-content;
        opacity: 0.95;
      `}
      label={'Map Controls'}
      onToggle={() => setIsOpen(!isOpen)}
      isOpen={isOpen}
    >
      {/* Add some on click interactions with the map */}
      <div onClick={toggleTerrain}> Toggle Terrain Layer </div>
      <div> ASD 1</div>
      <div> ASD 2</div>
    </Collapse>
  );
};
