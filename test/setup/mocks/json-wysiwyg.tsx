/* eslint-disable react/display-name */
import React from 'react';
import { vi } from 'vitest';

// vanilla-jsoneditor stub
vi.mock('vanilla-jsoneditor', () => {
  class JSONEditor {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    constructor(_opts: { target: unknown; props: unknown }) {}
    updateProps(props: unknown) {
      const onChange = (
        props as { onChange?: (a: unknown, b: unknown, c: unknown) => void }
      ).onChange;
      onChange?.({ json: { from: 'editor' } }, undefined, {});
    }
    destroy() {}
  }
  return { JSONEditor };
});

// WYSIWYG toolchain stubs
vi.mock('html-to-draftjs', () => ({
  __esModule: true,
  default: () => ({ contentBlocks: [], entityMap: {} }),
}));
vi.mock('draftjs-to-html', () => ({
  __esModule: true,
  default: () => '<p>converted</p>',
}));
vi.mock('draft-js', () => {
  const ContentState = {
    createFromBlockArray: (blocks: unknown) => ({ blocks }),
  };
  const EditorState = {
    createEmpty: () => ({ getCurrentContent: () => ({}) }),
    createWithContent: (content: unknown) => ({
      getCurrentContent: () => content,
    }),
  };
  const convertToRaw = (content: unknown) => content;
  return { ContentState, EditorState, convertToRaw };
});

vi.mock('react-draft-wysiwyg', () => {
  const Editor = React.forwardRef<
    HTMLDivElement,
    {
      onEditorStateChange?: (s: unknown) => void;
      editorState?: unknown;
      editorStyle?: React.CSSProperties;
    } & React.HTMLAttributes<HTMLDivElement>
  >(
    (
      {
        onEditorStateChange,
        editorState: _editorState,
        editorStyle: _editorStyle,
        ...p
      },
      ref,
    ) =>
      React.createElement('div', {
        ...p,
        ref,
        'data-testid': 'rdw-editor',
        onClick: () => onEditorStateChange?.({ getCurrentContent: () => ({}) }),
      }),
  );
  (Editor as unknown as { displayName?: string }).displayName = 'Editor';
  return { Editor };
});
