# `useRafLoop`

This hook call given function within the RAF loop without re-rendering parent component.
Loop stops automatically on component unmount.

Additionally hook provides methods to start/stop loop and check current state.

## Usage

```jsx
import { useRafLoop, useState } from 'vue-next-use';

const Demo = {
  setup(){
    const [ticks, setTicks] = useState(0);
    const [lastCall, setLastCall] = useState(0);

    const [loopStop, loopStart, isActive] = useRafLoop((time) => {
      setTicks(ticks => ticks + 1);
      setLastCall(time);
    });

    return () => (
        <div>
            <div>RAF triggered: {ticks.value} (times)</div>
            <div>Last high res timestamp: {lastCall.value}</div>
            <br />
            <button onClick={() => {
                isActive.value ? loopStop() : loopStart();
            }}>{isActive.value ? 'STOP' : 'START'}</button>
        </div>
    );
  }
};
```

## Reference

```ts
const [stopLoop, startLoop, isActive] = useRafLoop(callback: FrameRequestCallback, initiallyActive = true);
```
* **`callback`**_: `(time: number)=>void`_ &mdash; function to call each RAF tick.
    * **`time`**_: `number`_ &mdash; DOMHighResTimeStamp, which indicates the current time (based on the number of milliseconds since time origin).
* **`initiallyActive`**_: `boolean`_ &mdash; whether loop should be started at initial render.
* Return
    * **`stopLoop`**_: `()=>void`_ &mdash; stop loop if it is active.
    * **`startLoop`**_: `()=>void`_ &mdash; start loop if it was inactive.
    * **`isActive`**_: `ComputedRef<boolean>`_ &mdash; _true_ if loop is active.

