# `useClickAway`

Vue UI hook that triggers a callback when user
clicks outside the target element.


## Usage

```jsx
import {useClickAway} from 'vue-next-use';

const Demo = {
    setup(props) {

        const [state, setState] = useReactive({color: 'red'})

        const ref = useRef(null);

        useClickAway(ref, () => {
            console.log('OUTSIDE CLICKED');
            setState({color: 'green'});
            setTimeout(() => {
                setState({color: 'red'});
            }, 300);
        });

        return () => (
            <div ref={ref} style={{
                width: '200px',
                height: '200px',
                background: state.color,
            }}/>
        );
    }
};
```

## Reference

```js
useClickAway(ref, onMouseEvent)
useClickAway(ref, onMouseEvent, ['click'])
useClickAway(ref, onMouseEvent, ['mousedown', 'touchstart'])
```
