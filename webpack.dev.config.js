import defaultConfig from "@wordpress/scripts/config/webpack.config.js";
import CopyPlugin from "copy-webpack-plugin";
import { glob } from "glob";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Build dynamic entry points from source folder (excluding some subfolders)
const entries = Object.fromEntries(
    glob
        .sync("./source/**/*.js", {
            cwd: __dirname,
            ignore: [
                "./source/utils/**/*.js",
                "./source/hooks/**/*.js",
                "./source/gutenberg/Blocks/**/*.js",
                "./source/assets/plugins/**/*.js",
                "./source/media-library/context/**/*.js",
            ],
        })
        .map((file) => [
            path.basename(file, ".js"),
            path.resolve(__dirname, file),
        ]),
);

// ======================================================================
// Detect Gutenberg Block entries separately
// ======================================================================
const blocksDir = path.resolve(process.cwd(), "source/gutenberg/Blocks");

const blockFolders = fs.readdirSync(blocksDir).filter((folder) => {
    const fullPath = path.join(blocksDir, folder);
    return fs.statSync(fullPath).isDirectory() && folder !== "utils";
});

const blockEntries = blockFolders.reduce((acc, block) => {
    acc[`blocks/${block}/index`] = path.resolve(blocksDir, block, "index.js");
    return acc;
}, {});

const copyBlockPatterns = blockFolders.map((block) => ({
    from: path.resolve(blocksDir, block, "block.json"),
    to: path.join(`blocks/${block}`, "block.json"),
}));

function AddDepsPlugin(extraDeps = [], matchPattern = false) {
    function getAssetFiles(dir) {
        return fs.readdirSync(dir).flatMap((file) => {
            const fullPath = path.join(dir, file);
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) return getAssetFiles(fullPath);

            if (matchPattern) {
                return fullPath.match(matchPattern) &&
                    fullPath.endsWith(".asset.php")
                    ? [fullPath]
                    : [];
            }
            return file.endsWith(".asset.php") ? [fullPath] : [];
        });
    }

    return {
        apply(compiler) {
            compiler.hooks.done.tap("CustomDepsPlugin", () => {
                const outputPath = compiler.options.output.path;

                const assetFiles = getAssetFiles(outputPath);
                console.log(
                    "🔧 Checking asset files for dependency updates...",
                    assetFiles,
                );
                assetFiles.forEach((fullPath) => {
                    let content = fs.readFileSync(fullPath, "utf8");

                    const match = content.match(
                        /'dependencies' => array\((.*?)\)/s,
                    );
                    if (match) {
                        let deps = match[1]
                            .split(",")
                            .map((d) => d.trim().replace(/'| /g, ""))
                            .filter(Boolean);

                        // Add extra dependencies if missing
                        extraDeps.forEach((dep) => {
                            if (!deps.includes(dep)) deps.push(dep);
                        });

                        const newDeps = deps.map((d) => `'${d}'`).join(", ");
                        content = content.replace(
                            /'dependencies' => array\((.*?)\)/s,
                            `'dependencies' => array(${newDeps})`,
                        );

                        fs.writeFileSync(fullPath, content, "utf8");
                        console.log(`🔧 Updated dependencies in: ${fullPath}`);
                    }
                });
            });
        },
    };
}

export default {
    ...defaultConfig,

    entry: {
        ...entries,
        ...blockEntries,
    },

    mode: "development",

    devtool: "eval-source-map",

    externals: {
        plupload: "window.plupload",
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".jsx"],

        alias: {
            "~": path.resolve(__dirname, "source"),
        },
    },

    output: {
        path: path.resolve(__dirname, "../assets/js"),
        filename: (pathData) => {
            const name = pathData.chunk.name;
            const match = name.match(/^([a-zA-Z0-9_-]+)--(.+)$/);

            if (match) {
                const [, prefix, filename] = match;
                return `${prefix}s/${filename}.js`;
            }

            return `${name}.js`;
        },
        chunkFilename: "chunks/[name].chunk.js", // ✅ store shared code separately
        clean: true,
    },
    optimization: {
        splitChunks: {
            chunks: "all",
            cacheGroups: {
                vendors: {
                    test: /[\\/]node_modules[\\/]/,
                    name: "vendors",
                    chunks: "all",
                    priority: -10,
                    enforce: true,
                },
                shared: {
                    name: "shared",
                    minChunks: 2, // extract when shared by 2+ entry points
                    priority: -20,
                    reuseExistingChunk: true,
                },
            },
        },
        runtimeChunk: "single", // ✅ better caching & smaller main bundles
    },
    plugins: [
        ...(defaultConfig.plugins || []),
        new AddDepsPlugin(
            ["pnpnd-shared"],
            /blocks\/(file-list|file-browser|gallery|embed-documents|media-player|search-box|slider|shortcode)\//,
        ),
        new CopyPlugin({
            patterns: [
                {
                    from: path.resolve(__dirname, "source/assets/images"),
                    to: path.resolve(__dirname, "../assets/images"),
                },
                {
                    from: path.resolve(__dirname, "source/assets/fonts"),
                    to: path.resolve(__dirname, "../assets/fonts"),
                },
                {
                    from: path.resolve(__dirname, "source/assets/plugins"),
                    to: path.resolve(__dirname, "../assets/plugins"),
                },
                ...copyBlockPatterns,
            ],
            options: {
                concurrency: 100,
            },
        }),
    ],
};
