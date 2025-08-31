/**
 * HelloWorldProps defines the props for the HelloWorld component.
 */
export type HelloWorldProps = {
  /**
   * Whom to greet. Defaults to "World".
   */
  who?: string;
};

/**
 * A simple Hello World React component.
 *
 * @remarks
 * - Targets React 18 with the modern react-jsx runtime.
 * - No styling is applied by default.
 */
export function HelloWorld({ who = 'World' }: HelloWorldProps): JSX.Element {
  return <div>Hello {who}</div>;
}

