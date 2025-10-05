import { forwardRef, useEffect, useRef, useState } from 'react';
import {
  type Content,
  createJSONEditor,
  type JSONEditorPropsOptional,
  Mode,
} from 'vanilla-jsoneditor';

type JSONEditorReactProps = JSONEditorPropsOptional;

const JSONEditorReact = forwardRef<HTMLDivElement, JSONEditorReactProps>(
  (props, ref) => {
    const refContainer = useRef<HTMLDivElement>(null);
    const refEditor = useRef<ReturnType<typeof createJSONEditor> | null>(null);
    const [fallback, setFallback] = useState(true); // Force fallback for now
    const [content, setContent] = useState(
      '{\n  "example": "data",\n  "editable": true\n}',
    );

    useEffect(() => {
      if (refContainer.current && !fallback) {
        try {
          refEditor.current = createJSONEditor({
            target: refContainer.current,
            props: {
              content: { text: content },
              mode: Mode.text,
              mainMenuBar: false,
              statusBar: false,
              askToFormat: false,
              readOnly: false,
              onChange: (updatedContent: Content) => {
                if ('text' in updatedContent) {
                  setContent(updatedContent.text);
                  void props.onChange?.(
                    updatedContent,
                    { text: content },
                    { contentErrors: undefined, patchResult: undefined },
                  );
                }
              },
              ...props,
            },
          });
        } catch (error) {
          console.error(
            'Failed to initialize JSON editor, using fallback:',
            error,
          );
          setFallback(true);
        }
      }

      return () => {
        if (refEditor.current) {
          try {
            refEditor.current.destroy();
            refEditor.current = null;
          } catch (error) {
            console.warn('Failed to destroy JSON editor:', error);
          }
        }
      };
    }, [fallback, content, props]);

    const handleTextareaChange = (
      e: React.ChangeEvent<HTMLTextAreaElement>,
    ) => {
      setContent(e.target.value);
      // Simulate the onChange prop for form integration
      if (props.onChange) {
        void props.onChange(
          { text: e.target.value },
          { text: content },
          { contentErrors: undefined, patchResult: undefined },
        );
      }
    };

    // Render fallback textarea if JSON editor failed
    if (fallback) {
      return (
        <div
          ref={ref || refContainer}
          style={{
            height: '300px',
            border: '1px solid #ccc',
            backgroundColor: '#fff',
          }}
        >
          <textarea
            value={content}
            onChange={handleTextareaChange}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              padding: '10px',
              fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
              fontSize: '14px',
              resize: 'none',
              outline: 'none',
              backgroundColor: 'transparent',
            }}
            placeholder="Enter JSON here..."
          />
        </div>
      );
    }

    return (
      <div
        ref={ref || refContainer}
        style={{
          height: '300px',
          border: '1px solid #ccc',
          backgroundColor: '#fff',
        }}
      />
    );
  },
);

JSONEditorReact.displayName = 'JSONEditorReact';

export default JSONEditorReact;
