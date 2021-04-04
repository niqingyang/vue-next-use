# `useKeyboardJs`

Vue UI sensor hook that detects complex key combos like detecting when multiple keys are held down at the same time or
requiring them to be held down in a specified order.

Via [KeyboardJS key combos](https://github.com/RobertWHurst/KeyboardJS). Check its documentation for further details on
how to make combo strings.

## Usage

```tsx
import useKeyboardJs from 'vue-next-use/lib/useKeyboardJs';

const Demo = {
    props: {
        combo: {
            type: String,
            required: true
        }
    },
    components: {
        CenterStory
    },
    setup(props) {
        const {combo} = props;
        const [pressed] = useKeyboardJs(combo);

        return () => (
            <div style={{textAlign: 'center'}}>
                Press{' '}
                <code
                    style={{color: 'red', background: '#f6f6f6', padding: '3px 6px', borderRadius: '3px'}}>
                    {combo}
                </code>{' '}
                combo
                <br/>
                <br/>
                <div style={{fontSize: '4em'}}>{pressed.value ? '💋' : ''}</div>
            </div>
        );
    },
};
```

Note: Because of dependency on `keyboardjs` you have to import this hook directly like shown above.

## Requirements

Install [`keyboardjs`](https://github.com/RobertWHurst/KeyboardJS) peer dependency:

```bash
npm add keyboardjs
# or
yarn add keyboardjs
```

## Reference

```js
useKeyboardJs(combination: string | string[]): [isPressed: boolean, event?: KeyboardEvent]
```
