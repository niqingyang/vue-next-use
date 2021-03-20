import {useFullscreen, useRef, useToggle} from "../src/index";
import {ShowDemo, ShowDocs} from './util/index';

export default {
    title: 'UI/useFullscreen',
    argTypes: {},
};

export const Docs = ShowDocs(require('../docs/useFullscreen.md'));

export const Demo = ShowDemo({
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
});