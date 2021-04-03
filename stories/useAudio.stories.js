import {useAudio} from "../src/index";
import {ShowDemo, ShowDocs} from './util/index';
import {h, createVNode} from "vue";

export default {
    title: 'UI/useAudio',
    argTypes: {},
};

export const Docs = ShowDocs(require('../docs/useAudio.md'));

export const Demo = ShowDemo({
    setup(props) {

        // () => <audio src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" autoplay={true}/>
        // support a Element~ but warning for typescript
        // const [Audio, state, controls, ref] = useAudio(
        //     <audio src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" autoplay={true}/>
        // );

        const [Audio, state, controls] = useAudio({
            src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
            autoplay: true,
        });

        return () => (
            <div>
                <Audio/>
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