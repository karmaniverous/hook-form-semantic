import { forwardRef, useEffect, useRef } from 'react';
import { JSONEditor, type JSONEditorPropsOptional } from 'vanilla-jsoneditor';

type JSONEditorReactProps = JSONEditorPropsOptional;

const JSONEditorReact = forwardRef<HTMLDivElement, JSONEditorReactProps>(
  (props, ref) => {
    const refContainer = useRef<HTMLDivElement>(null);
    const refEditor = useRef<JSONEditor | null>(null);

    useEffect(() => {
      if (refContainer.current) {
        refEditor.current = new JSONEditor({
          target: refContainer.current,
          props: {
            content: { text: '{}' }, // Default content to prevent validation errors
            ...props,
          },
        });
      }

      return () => {
        if (refEditor.current) {
          refEditor.current.destroy();
          refEditor.current = null;
        }
      };
    }, []);

    useEffect(() => {
      if (refEditor.current && props) {
        try {
          refEditor.current.updateProps(props);
        } catch (error) {
          console.warn('Failed to update JSON editor props:', error);
        }
      }
    }, [props]);

    return <div ref={ref || refContainer} style={{ height: '300px' }} />;
  },
);

JSONEditorReact.displayName = 'JSONEditorReact';

export default JSONEditorReact;
