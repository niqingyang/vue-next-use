# `useFullscreen`

Display an element full-screen, optional fallback for fullscreen video on iOS.

## Usage

```jsx
import {useFullscreen, useRef, useToggle} from 'vue-next-use';

const Demo = {
    setup(props) {

        const [show, toggle] = useToggle(false);
        const ref = useRef(null);
        const videoRef = useRef(null);
        const isFullScreen = useFullscreen(ref, show, {
            onClose: () => toggle(false),
            video: videoRef,
        });

        return () => {

            const controls = (
                <div style={{background: 'white', padding: '20px'}}>
                    <div>{isFullScreen.value ? 'is full screen' : 'not full screen'}</div>
                    <button onClick={() => toggle()}>Toggle</button>
                    <button onClick={() => toggle(true)}>set ON</button>
                    <button onClick={() => toggle(false)}>set OFF</button>
                </div>
            );

            return (
                <div>
                    <div
                        ref={ref}
                        style={{
                            backgroundColor: isFullScreen.value ? 'black' : 'grey',
                            width: 400,
                            height: 300,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}>
                        <video
                            ref={videoRef}
                            style={{width: '70%'}}
                            src="http://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4"
                            autoplay={true}
                        />
                        {isFullScreen.value && controls}
                    </div>

                    <br/>
                    <br/>

                    {!isFullScreen.value && controls}
                </div>
            )
        }
    }
};
```

## Reference

```ts
useFullscreen(ref, show, {onClose})
```
