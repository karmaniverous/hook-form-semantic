import { createRequire } from 'node:module';

import aliasPlugin from '@rollup/plugin-alias';
import commonjsPlugin from '@rollup/plugin-commonjs';
import jsonPlugin from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescriptPlugin from '@rollup/plugin-typescript';
import type { RollupOptions } from 'rollup';
import dtsPlugin from 'rollup-plugin-dts';
import postcssPlugin from 'rollup-plugin-postcss';

const require = createRequire(import.meta.url);
const pkg = require('./package.json') as {
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
};

const outputPath = 'dist';

const commonPlugins = [
  postcssPlugin({
    extract: false,
    inject: false,
    minimize: true,
  }),
  commonjsPlugin(),
  jsonPlugin(),
  nodeResolve({
    preferBuiltins: false,
    // Only resolve modules that are NOT peer dependencies or external dependencies
    resolveOnly: (module) => {
      const allExternals = [
        ...Object.keys(pkg.dependencies ?? {}),
        ...Object.keys(pkg.peerDependencies ?? {}),
        'tslib',
        'react/jsx-runtime',
      ];
      return !allExternals.some(
        (external) => module === external || module.startsWith(external + '/'),
      );
    },
  }),
  typescriptPlugin({
    outputToFilesystem: false,
  }),
];

const commonAliases: Array<{ find: string; replacement: string }> = [
  { find: '@/', replacement: 'src/' },
];

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
    plugins: [...commonInputOptions.plugins, dtsPlugin()],
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
