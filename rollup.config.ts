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
  // The subpath barrel is an explicit entry: with a single entry rollup
  // collapses the re-export-only module, and the ./core/phone export target
  // (dist/mjs/core/phone/index.js) is never emitted.
  input: [
    'src/index.ts',
    'src/core/phone/index.ts',
    'src/core/rrstack/index.ts',
  ],
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

  // Type definitions output. Unlike the ESM build, each dts build rolls up
  // to a single file, so each gets exactly one entry.
  {
    ...commonInputOptions,
    input: 'src/index.ts',
    plugins: [...commonInputOptions.plugins, dtsPlugin()],
    output: [
      {
        extend: true,
        file: `${outputPath}/index.d.ts`,
        format: 'esm',
      },
    ],
  },

  // Type definitions for the ./core/phone subpath export. The ESM output
  // needs no extra entry: preserveModules already emits
  // dist/mjs/core/phone/index.js from the main graph.
  {
    ...commonInputOptions,
    input: 'src/core/phone/index.ts',
    plugins: [...commonInputOptions.plugins, dtsPlugin()],
    output: [
      {
        extend: true,
        file: `${outputPath}/core/phone/index.d.ts`,
        format: 'esm',
      },
    ],
  },

  // Type definitions for the ./core/rrstack subpath export.
  {
    ...commonInputOptions,
    input: 'src/core/rrstack/index.ts',
    plugins: [...commonInputOptions.plugins, dtsPlugin()],
    output: [
      {
        extend: true,
        file: `${outputPath}/core/rrstack/index.d.ts`,
        format: 'esm',
      },
    ],
  },
];

export default config;
