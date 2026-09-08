// Metro config for a pnpm monorepo: watch the workspace root and resolve
// dependencies from both the app and the root node_modules so the workspace
// TypeScript packages (@odyssey/*) are bundled and transpiled.
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];
// Hierarchical lookup stays enabled so Metro can walk up to the hoisted
// root node_modules for transitive deps.

module.exports = config;
