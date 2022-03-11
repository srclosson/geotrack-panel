import { Collapse, Slider } from '@grafana/ui';
import { css } from 'emotion';
import React, { useState } from 'react';

interface LabelsInterface {
  onClick: () => void;
  text: string;
  isActive: boolean;
}

export const MapControls = ({
  labels,
  elevation,
  onElevationChange,
}: {
  labels: LabelsInterface[];
  elevation?: number;
  onElevationChange: (v: number) => void;
}) => {
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
      {labels.map((label) => {
        return (
          <div
            className={css`
              font-weight: ${label.isActive ? 'bold' : 'normal'};
            `}
            onClick={label.onClick}
          >
            {label.text}
          </div>
        );
      })}
      <Slider
        included
        max={200}
        step={10}
        min={0}
        orientation="horizontal"
        value={elevation ?? 10}
        onAfterChange={(v) => {
          if (!v) {
            return;
          }
          onElevationChange(v);
        }}
      />
    </Collapse>
  );
};
