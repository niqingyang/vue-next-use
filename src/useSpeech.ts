import {Ref, ref, onMounted} from "vue";
import {useEffect, useState, useSetState} from "./index";
import {isBrowser} from './misc/util';
import {watch} from "rollup";

export interface SpeechState {
    isPlaying: boolean;
    lang: string;
    voice: SpeechSynthesisVoice;
    rate: number;
    pitch: number;
    volume: number;
}

export interface SpeechOptions {
    lang?: string; // 语言
    voice?: SpeechSynthesisVoice; // 声音
    rate?: number; // 语速(值越大语速越快,越小语速越慢)
    pitch?: number; // 音调(值越大越尖锐,越低越低沉)
    volume?: number; // 音量
}

const voices = isBrowser && typeof window.speechSynthesis === 'object' ? window.speechSynthesis.getVoices() : [];

const useSpeech = (text: string, opts: SpeechOptions = {}): Ref<SpeechState> => {
    const [state, setState] = useSetState<SpeechState>({
        isPlaying: false,
        lang: opts.lang || 'default',
        voice: opts.voice || voices[0],
        rate: opts.rate || 1,
        pitch: opts.pitch || 1,
        volume: opts.volume || 1,
    });

    const utteranceRef = ref<SpeechSynthesisUtterance | null>(null);

    const utterance = new SpeechSynthesisUtterance(text);
    opts.lang && (utterance.lang = opts.lang);
    opts.voice && (utterance.voice = opts.voice);
    utterance.rate = opts.rate || 1;
    utterance.pitch = opts.pitch || 1;
    utterance.volume = opts.volume || 1;
    utterance.onstart = () => setState({isPlaying: true});
    utterance.onresume = () => setState({isPlaying: true});
    utterance.onend = () => setState({isPlaying: false});
    utterance.onpause = () => setState({isPlaying: false});
    utteranceRef.value = utterance;
    window.speechSynthesis.speak(utteranceRef.value);

    return state;
};

export default useSpeech;