// Learn more https://docs.expo.io/guides/customizing-metro
const { createRequire } = require('module');
const { getDefaultConfig } = require('@expo/metro-config');
const myRequire = createRequire(import.meta.url || __filename);
const path = require("path");
const fs = require("fs");

// Find the project root (monorepo root)
const projectRoot = path.resolve(__dirname, "../../..");
const workspaceRoot = projectRoot;

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname, {
  // Enable CSS support
  isCSSEnabled: true,
});

// 1. Watch all files in the monorepo
config.watchFolders = [workspaceRoot];

// 2. Handle workspace packages resolution
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

// 3. Make Metro follow symlinks (which Yarn workspaces uses)
config.resolver.disableHierarchicalLookup = true;
config.resolver.unstable_enableSymlinks = true;
config.resolver.unstable_enablePackageExports = true;

// 4. Register workspace packages for resolution
config.resolver.extraNodeModules = new Proxy(
  {},
  {
    get: (target, name) => {
      // Check if the module is within our workspace packages
      if (name.startsWith("@knicks-knacks/")) {
        const packageName = name.substring("@knicks-knacks/".length);
        const packagePath = path.resolve(projectRoot, "packages", packageName);

        // Check if directory exists
        if (fs.existsSync(packagePath)) {
          return packagePath;
        }
      }
      // Fallback to node_modules
      return path.resolve(__dirname, "node_modules", String(name));
    },
  }
);

// 5. Ensure symlinks are resolved properly for Yarn workspaces
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Handle workspace packages
  if (
    moduleName.startsWith("@knicks-knacks/") &&
    !moduleName.endsWith("/package.json")
  ) {
    const packageName = moduleName.substring("@knicks-knacks/".length);
    const packageDir = path.resolve(projectRoot, "packages", packageName);

    // Make sure package exists
    if (fs.existsSync(packageDir)) {
      try {
        // Try to resolve to the package's entry point
        const packageJson = require(path.join(packageDir, "package.json"));
        const entryPoint = packageJson.main || "index.js";
        return {
          filePath: path.join(packageDir, entryPoint),
          type: "sourceFile",
        };
      } catch (e) {
        // Fall back to Metro's default resolution
        return context.resolveRequest(context, moduleName, platform);
      }
    }
  }
  // Use Metro's default resolution for other modules
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
