import { Button, Field, Form, TextArea, Card } from '@grafana/ui';
import React from 'react';
import { css } from 'emotion';

export const AddNote = ({ note }: { note: { x?: number; y?: number; lat?: number; lon?: number; z?: number } }) => {
  const onSubmit = (e: any) => {
    let notes = localStorage.getItem('annotations');
    let parsedNotes: Record<string, any>[] = JSON.parse(notes ?? '[]');

    parsedNotes.push({ id: `note-${note.x}-${note.y}`, label: e?.note, ...note });
    localStorage.setItem(`annotations`, JSON.stringify(parsedNotes));
  };

  return (
    <Card
      className={css`
        position: absolute;
        left: ${note.x}px;
        top: ${note.y}px;
        padding: 8px;
        width: 180px;
      `}
    >
      <Form
        className={css`
          margin-top: 0;
        `}
        onSubmit={onSubmit}
      >
        {({ register, errors }) => (
          <>
            <Field
              className={css`
                margin-bottom: 0px;
              `}
            >
              <TextArea
                // @ts-ignore
                {...register('note', {
                  required: { value: true, message: 'Required.' },
                })}
                id="note"
                rows={5}
              />
            </Field>
            <Button size="sm" type="submit">
              Save Note
            </Button>
          </>
        )}
      </Form>
    </Card>
  );
};
