import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

import { ContentState, convertToRaw, EditorState } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import { useCallback, useEffect, useState } from 'react';
import { Editor, type EditorProps } from 'react-draft-wysiwyg';

export interface WysiwygEditorProps
  extends Omit<
    EditorProps,
    'editorState' | 'onChange' | 'onEditorStateChange'
  > {
  onChange: (value: string) => void;
  value?: string | null;
}

export const WysiwygEditor: React.FC<WysiwygEditorProps> = ({
  onChange,
  value,
  ...props
}) => {
  const [editorState, setEditorState] = useState(EditorState.createEmpty());

  const [updated, setUpdated] = useState(false);

  useEffect(() => {
    if (updated) return;

    // TECHDEBT: unsafe assignment
    // eslint-disable-next-line
    const { contentBlocks, entityMap } = htmlToDraft(value ?? '');

    const contentState = ContentState.createFromBlockArray(
      contentBlocks,
      entityMap,
    );

    setEditorState(EditorState.createWithContent(contentState));
  }, [updated, value]);

  const handleEditorStateChange = useCallback(
    (editorState: EditorState) => {
      setUpdated(true);
      setEditorState(editorState);

      onChange(draftToHtml(convertToRaw(editorState.getCurrentContent())));
    },
    [onChange],
  );

  return (
    <Editor
      {...props}
      editorState={editorState}
      editorStyle={{ border: '1px solid #f1f1f1', padding: '0 1rem' }}
      onEditorStateChange={handleEditorStateChange}
    />
  );
};
