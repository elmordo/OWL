module.exports = {
    entry: [
        "./tests/unittests/events/event.ts",
        "./tests/unittests/events/event_dispatcher.ts",
        "./tests/unittests/service_management/service_manager.ts",
        "./tests/unittests/service_management/service_namespace.ts",
        "./tests/unittests/dom/dom_manipulator.ts",
        "./tests/unittests/dom/common_html_element.ts"
    ],
    output: {
        filename: "./tests/browser_runner/bundle.js"
    },
    resolve: {
        // Add '.ts' and '.tsx' as a resolvable extension.
        extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js"]
    },
    module: {
        loaders: [
            // all files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'
            { test: /\.tsx?$/, loader: "ts-loader" }
        ]
    }
}
