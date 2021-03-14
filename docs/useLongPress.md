# `useLongPress`

Vue sensor hook that fires a callback after long pressing.

## Usage

```jsx
import { ref } from "vue";
import { useLongPress } from 'vue-next';

const Demo = {
    props: {
        delay: {
            default: 300
        },
        isPreventDefault: {
            default: true
        }
    },
    setup(props) {

        const {isPreventDefault, delay} = props;

        const count = ref(0)

        const onLongPress = () => {
            count.value += 1;
            console.log(`calls callback after long pressing ${delay}ms`);
        };

        const defaultOptions = {
            isPreventDefault,
            delay,
        };

        const longPressEvent = useLongPress(onLongPress, defaultOptions);

        return () => (
            <div>
                <button {...longPressEvent}>useLongPress</button>
                <span style={{marginLeft: '10px'}}>count: {count.value}</span>
            </div>
        );
    },
};
```

## Reference

```ts
const {
  onMousedown,
  onTouchstart,
  onMouseup,
  onMouseleave,
  onTouchend
} = useLongPress(
  callback: (e: TouchEvent | MouseEvent) => void,
  options?: {
    isPreventDefault?: true,
    delay?: 300
  }
)
```

- `callback` &mdash; callback function.
- `options?` &mdash; optional parameter.
    - `isPreventDefault?` &mdash; whether to call `event.preventDefault()` of `touchend` event, for preventing ghost click on mobile devices in some cases, defaults to `true`.
    - `delay?` &mdash; delay in milliseconds after which to calls provided callback, defaults to `300`.
