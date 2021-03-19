import {useVideo} from "../src/index";
import {ShowDemo, ShowDocs} from './util/index';
import {h, createVNode} from "vue";

export default {
    title: 'UI/useVideo',
    argTypes: {},
};

export const Docs = ShowDocs(require('../docs/useVideo.md'));

export const Demo = ShowDemo({
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
});