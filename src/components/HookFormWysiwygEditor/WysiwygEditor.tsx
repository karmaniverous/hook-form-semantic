import {
  ContentState,
  convertToRaw,
  EditorState,
  type RawDraftEntity,
} from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import { forwardRef, useCallback, useEffect, useState } from 'react';
import { Editor, type EditorProps } from 'react-draft-wysiwyg';

export interface WysiwygEditorProps
  extends Omit<
    EditorProps,
    'editorState' | 'onChange' | 'onEditorStateChange'
  > {
  onChange: (value: string) => void;
  value?: string | null;
}

export const WysiwygEditor = forwardRef<Editor, WysiwygEditorProps>(
  ({ onChange, value, ...props }, ref) => {
    const [editorState, setEditorState] = useState(EditorState.createEmpty());

    const [updated, setUpdated] = useState(false);

    useEffect(() => {
      if (updated) return;

      // Only run on client side - html-to-draftjs requires browser environment
      if (typeof window === 'undefined') return;

      const loadContentAsync = async () => {
        try {
          // Dynamic import to avoid SSR issues
          const htmlToDraftModule = await import('html-to-draftjs');

          // Handle nested module wrappers - webpack can create nested defaults for CommonJS modules
          type HtmlToDraftFunction = (
            text: string,
            customChunkRenderer?: (
              nodeName: string,
              node: HTMLElement,
            ) => RawDraftEntity<Record<string, unknown>> | undefined,
          ) => {
            contentBlocks: Parameters<
              typeof ContentState.createFromBlockArray
            >[0];
            entityMap?: Parameters<typeof ContentState.createFromBlockArray>[1];
          };

          type ModuleWrapper =
            | {
                default?: HtmlToDraftFunction | ModuleWrapper;
                htmlToDraftjs?: HtmlToDraftFunction;
              }
            | HtmlToDraftFunction;

          let htmlToDraft: ModuleWrapper = htmlToDraftModule;

          // Unwrap nested defaults until we find the actual function
          while (
            htmlToDraft &&
            typeof htmlToDraft === 'object' &&
            'default' in htmlToDraft &&
            htmlToDraft.default
          ) {
            htmlToDraft = htmlToDraft.default;
          }

          // If still not a function, try other common export patterns
          if (typeof htmlToDraft !== 'function') {
            const wrapper = htmlToDraft as {
              htmlToDraftjs?: HtmlToDraftFunction;
            };
            htmlToDraft = wrapper?.htmlToDraftjs || htmlToDraft;
          }

          // Type assertion to ensure we have a function at this point
          const htmlToDraftFn = htmlToDraft as HtmlToDraftFunction;
          const { contentBlocks, entityMap } = htmlToDraftFn(value ?? '');

          const contentState = ContentState.createFromBlockArray(
            contentBlocks,
            entityMap,
          );

          setEditorState(EditorState.createWithContent(contentState));
        } catch (error) {
          console.error('Failed to load html-to-draftjs:', error);
          // Fallback: create empty editor state
          setEditorState(EditorState.createEmpty());
        }
      };

      loadContentAsync();
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
        ref={ref}
      />
    );
  },
);

WysiwygEditor.displayName = 'WysiwygEditor';
