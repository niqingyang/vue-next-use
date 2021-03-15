// https://github.com/rollup/plugins/tree/master/packages/multi-entry
// https://github.com/rollup/awesome
import alias from '@rollup/plugin-alias';
import {babel} from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import progress from 'rollup-plugin-progress';
import cleanup from 'rollup-plugin-cleanup';
import vuePlugin from 'rollup-plugin-vue';
import typescript from '@rollup/plugin-typescript';
// https://github.com/Swatinem/rollup-plugin-dts
import dts from "rollup-plugin-dts";

// rollup.config.js
export default [{
    input: 'src/index.ts',
    output: [
        {file: 'dist/vue-next-use.bundle.cjs.js', format: 'cjs'},
        {file: 'dist/vue-next-use.bundle.esm.js', format: 'esm'},
    ],
    global: {
        vue: "Vue" // 告诉rollup全局变量Vue即是vue
    },
    // 告诉rollup不要将此lodash打包，而作为外部依赖
    external: ['vue', 'copy-to-clipboard', 'js-cookie', 'rebound', 'screenfull', 'set-harmonic-interval'],
    plugins: [
        // https://github.com/rollup/plugins/tree/master/packages/alias
        alias({
            entries: [
                // {
                //     find: 'utils',
                //     replacement: '../../../utils'
                // },
                // {
                //     find: 'batman-1.0.0',
                //     replacement: './joker-1.5.0'
                // }
            ]
        }),
        resolve(),
        // https://github.com/rollup/plugins/tree/master/packages/typescript
        typescript({
            lib: ["es5", "es6", "dom"],
            target: "es6",
            cacheDir: '.rollup.tscache',
        }),
        // https://github.com/vuejs/rollup-plugin-vue
        vuePlugin({
            // use 'node' if compiling for SSR
            target: 'browser'
        }),
        // https://github.com/rollup/plugins/tree/master/packages/babel
        babel({
            exclude: /node_modules/,
            babelHelpers: 'bundled'
        }),
        // https://github.com/rollup/plugins/tree/master/packages/commonjs
        commonjs({
            include: /node_modules/
        }),
        // https://github.com/jkuri/rollup-plugin-progress
        progress({
            clearLine: false // default: true
        }),
        cleanup()
    ]
},
// 生成类型的头文件
    {
        input: "./src/index.ts",
        output: [{
            file: "dist/vue-next-use.d.ts",
            format: "es"
        }],
        plugins: [
            // https://github.com/Swatinem/rollup-plugin-dts
            dts()
        ],
    }];