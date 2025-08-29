import { createRequire } from 'node:module';

import aliasPlugin, { type Alias } from '@rollup/plugin-alias';
import commonjsPlugin from '@rollup/plugin-commonjs';
import jsonPlugin from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescriptPlugin from '@rollup/plugin-typescript';
import type { InputOptions, RollupOptions } from 'rollup';
import dtsPlugin from 'rollup-plugin-dts';

const require = createRequire(import.meta.url);
type Package = Record<string, Record<string, string> | undefined>;
const pkg = require('./package.json') as Package;

const outputPath = `dist`;

const commonPlugins = [commonjsPlugin(), jsonPlugin(), nodeResolve(), typescriptPlugin()];

const commonAliases: Alias[] = [];

const commonInputOptions: InputOptions = {
  input: 'src/index.ts',
  external: [
    ...Object.keys((pkg as unknown as Package).dependencies ?? {}),
    ...Object.keys((pkg as unknown as Package).peerDependencies ?? {}),
    'tslib',
    'react/jsx-runtime',
  ],
  plugins: [aliasPlugin({ entries: commonAliases }), ...commonPlugins],
};

const config: RollupOptions[] = [
  // ESM output only.
  {
    ...commonInputOptions,
    output: [
      {
        dir: `${outputPath}/mjs`,
        extend: true,
        format: 'esm',
        preserveModules: true,
      },
    ],
  },

  // Type definitions output.
  {
    ...commonInputOptions,
    plugins: [commonInputOptions.plugins, dtsPlugin()],
    output: [
      {
        extend: true,
        file: `${outputPath}/index.d.ts`,
        format: 'esm',
      },
    ],
  },
];

export default config;