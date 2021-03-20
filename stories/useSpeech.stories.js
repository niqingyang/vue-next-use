import {useSpeech} from "../src/index";
import {ShowDemo, ShowDocs} from './util/index';

export default {
    title: 'UI/useSpeech',
    argTypes: {},
};

export const Docs = ShowDocs(require('../docs/useSpeech.md'));

export const Demo = ShowDemo({
    setup(props) {

        const voices = window.speechSynthesis.getVoices();

        const state = useSpeech('Hello world!', {rate: 0.8, pitch: 0.5, voice: voices[0]});

        return () => (
            <pre>{JSON.stringify(state, null, 2)}</pre>
        );
    }
});

