import { createRequire } from 'node:module';

import aliasPlugin from '@rollup/plugin-alias';
import commonjsPlugin from '@rollup/plugin-commonjs';
import jsonPlugin from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescriptPlugin from '@rollup/plugin-typescript';
import dtsPlugin from 'rollup-plugin-dts';

const require = createRequire(import.meta.url);
const pkg = require('./package.json');

const outputPath = `dist`;

const commonPlugins = [
  commonjsPlugin(),
  jsonPlugin(),
  nodeResolve(),
  typescriptPlugin(),
];

const commonAliases = [];

const commonInputOptions = {
  input: 'src/index.ts',
  external: [
    ...Object.keys(pkg.dependencies ?? {}),
    ...Object.keys(pkg.peerDependencies ?? {}),
    'tslib',
    'react/jsx-runtime',
  ],
  plugins: [aliasPlugin({ entries: commonAliases }), ...commonPlugins],
};

const config = [
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

