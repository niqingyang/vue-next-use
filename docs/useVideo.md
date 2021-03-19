# `useVideo`

Creates `<video>` element, tracks its state and exposes playback controls.


## Usage

```jsx
import {useVideo} from 'vue-next-use';

const Demo = {
    setup(props) {

        // () => <video src="http://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4" autoPlay={true}/>
        // support a Element~ but warning for typescript
        // const [Video, state, controls, ref] = useVideo(
        //     <video src="http://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4" autoPlay={true}/>
        // );

        const [Video, state, controls, ref] = useVideo({
            src: 'http://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4',
            autoplay: true,
        });

        return () => (
            <div>
                <Video ref={ref}/>
                <pre>{JSON.stringify(state.value, null, 2)}</pre>
                <button onClick={() => controls.toggle()}>controls toggle</button>
                <button onClick={controls.pause}>Pause</button>
                <button onClick={controls.play}>Play</button>
                <br />
                <button onClick={controls.mute}>Mute</button>
                <button onClick={controls.unmute}>Un-mute</button>
                <br />
                <button onClick={() => controls.volume(0.1)}>Volume: 10%</button>
                <button onClick={() => controls.volume(0.5)}>Volume: 50%</button>
                <button onClick={() => controls.volume(1)}>Volume: 100%</button>
                <br />
                <button onClick={() => controls.seek(state.value.time - 5)}>-5 sec</button>
                <button onClick={() => controls.seek(state.value.time + 5)}>+5 sec</button>
            </div>
        );
    }
};
```


## Reference

```jsx
const [video, state, controls, ref] = useVideo(props);
const [video, state, controls, ref] = useVideo(<video {...props}/>);
```

`video` is Vue's `<video>` element that you have to insert somewhere in your
render tree, for example:

```jsx
<div>{video}</div>
```

`state` tracks the state of the video and has the following shape:

```json
{
  "buffered": [
    {
      "start": 0,
      "end": 425.952625
    }
  ],
  "time": 5.244996,
  "duration": 425.952625,
  "paused": false,
  "muted": false,
  "volume": 1
}
```

`controls` is a list collection of methods that allow you to control the
playback of the video, it has the following interface:

```ts
interface AudioControls {
  play: () => Promise<void> | void;
  pause: () => void;
  mute: () => void;
  unmute: () => void;
  volume: (volume: number) => void;
  seek: (time: number) => void;
  toggle: (controls: boolean) => void;
  change: (src: string) => void;
}
```

`ref` is a Vue reference to HTML `<video>` element, you can access the element by
`ref.value`, note that it may be `null`.

And finally, `props` &mdash; all props that `<video>` accepts.