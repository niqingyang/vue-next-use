# Usage

You need to have Vue 3 or later installed to use the Hooks API. You can import each hook individually

```js
import useToggle from 'vue-next-use/lib/useToggle'
```

or use ES6 named imports (tree shaking recommended)

```js
import {useToggle} from 'vue-next-use'
```

Depending on your bundler you might run into a missing dependency error with ES6 named import statements. Some hooks require you to install peer dependencies so we recommend using individual imports. If you want the best of both worlds you can transform the named import statements to individual import statements with [`babel-plugin-import`](https://github.com/ant-design/babel-plugin-import) by adding the following config to your `.babelrc` file:

```json
[
  "import", {
    "libraryName": "vue-next-use",
    "libraryDirectory": "lib",
    "camel2DashComponentName": false
  }
]
```
