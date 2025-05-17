// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');
const fs = require('fs');

// Find the project root (monorepo root)
const projectRoot = path.resolve(__dirname, '../../..');
const workspaceRoot = projectRoot;

// Get default config
const defaultConfig = getDefaultConfig(__dirname);
const { resolver: { sourceExts, assetExts } } = defaultConfig;

/** @type {import('@expo/metro-config').MetroConfig} */
const config = {
    ...defaultConfig,
    resolver: {
        ...defaultConfig.resolver,
        // Support TypeScript extensions
        sourceExts: [...sourceExts, 'ts', 'tsx', 'mjs', 'd.ts'],
        assetExts: [...assetExts, 'svg', 'png', 'jpg', 'gif'],
        // Additional module directories for lookups
        nodeModulesPaths: [
            path.resolve(__dirname, 'node_modules'),
            path.resolve(workspaceRoot, 'node_modules'),
        ],
        // Enable symlinks support
        disableHierarchicalLookup: true,
        enablePackageExports: true,
        resolveRequest: (context, moduleName, platform) => {
            // Handle workspace packages
            if (moduleName.startsWith('@knicks-knacks/') && !moduleName.endsWith('/package.json')) {
                const packageName = moduleName.substring('@knicks-knacks/'.length);
                const packageDir = path.resolve(projectRoot, 'packages', packageName);

                // Make sure package exists
                if (fs.existsSync(packageDir)) {
                    try {
                        // Try to resolve to the package's entry point
                        const packageJson = require(path.join(packageDir, 'package.json'));
                        const entryPoint = packageJson.main || 'index.js';
                        return {
                            filePath: path.join(packageDir, entryPoint),
                            type: 'sourceFile',
                        };
                    } catch (e) {
                        // Fall back to Metro's default resolution
                        return context.resolveRequest(context, moduleName, platform);
                    }
                }
            }
            // Use Metro's default resolution for other modules
            return context.resolveRequest(context, moduleName, platform);
        },
        // Custom resolver for monorepo packages
        extraNodeModules: new Proxy({}, {
            get: (target, name) => {
                const nameStr = String(name);
                // Check if the module is within our workspace packages
                if (nameStr.startsWith('@knicks-knacks/')) {
                    const packageName = nameStr.substring('@knicks-knacks/'.length);
                    const packagePath = path.resolve(projectRoot, 'packages', packageName);

                    // Check if directory exists
                    if (fs.existsSync(packagePath)) {
                        return packagePath;
                    }
                }
                // Fallback to node_modules
                return path.resolve(__dirname, 'node_modules', nameStr);
            },
        }),
    },
    // Watch for file changes in the monorepo
    watchFolders: [workspaceRoot],
    transformer: {
        ...defaultConfig.transformer,
        getTransformOptions: async () => ({
            transform: {
                experimentalImportSupport: false,
                inlineRequires: true,
            },
        }),
    },
};

// Export the config
module.exports = config;
