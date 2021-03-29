# `useMeasure`

Vue sensor hook that tracks dimensions of an HTML element using the [Resize Observer API](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver).

## Usage

```jsx
import { useMeasure } from "vue-next-use";

const Demo = {
  setup(){
      const [ref, rect] = useMeasure();

      return () => (
          <div ref={ref}>
              <div>x: {rect.x}</div>
              <div>y: {rect.y}</div>
              <div>width: {rect.width}</div>
              <div>height: {rect.height}</div>
              <div>top: {rect.top}</div>
              <div>right: {rect.right}</div>
              <div>bottom: {rect.bottom}</div>
              <div>left: {rect.left}</div>
          </div>
      );
  }
};
```

This hook uses [`ResizeObserver` API][resize-observer], if you want to support 
legacy browsers, consider installing [`resize-observer-polyfill`][resize-observer-polyfill] 
before running your app. 

```js
if (!window.ResizeObserver) {
  window.ResizeObserver = (await import('resize-observer-polyfill')).default;
}
```


## Related hooks

- [useSize](./useSize.md)


[resize-observer]: https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver
[resize-observer-polyfill]: https://www.npmjs.com/package/resize-observer-polyfill
