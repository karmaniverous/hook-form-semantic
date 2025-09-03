import { useEffect, useRef } from 'react';
import { JSONEditor, type JSONEditorPropsOptional } from 'vanilla-jsoneditor';

const JSONEditorReact: React.FC<JSONEditorPropsOptional> = (props) => {
  const refContainer = useRef<HTMLDivElement>(null);
  const refEditor = useRef<JSONEditor | null>(null);

  useEffect(() => {
    refEditor.current = new JSONEditor({
      target: refContainer.current!,
      props: {},
    });

    return () => {
      if (refEditor.current) {
        // TECHDEBT: floating promise
        // eslint-disable-next-line
        refEditor.current.destroy();
        refEditor.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (refEditor.current) {
      // TECHDEBT: floating promise
      // eslint-disable-next-line
      refEditor.current.updateProps(props);
    }
  }, [props]);

  return <div ref={refContainer} />;
};

export default JSONEditorReact;
