import {
    Ref,
    ref as useRef,
    computed,
    createVNode,
    VNode,
    isVNode,
    AudioHTMLAttributes,
    VideoHTMLAttributes,
    isRef,
    unref
} from 'vue';
import {useEffect, useSetState} from "../index";
import parseTimeRanges from '../misc/parseTimeRanges';

export interface HTMLMediaProps extends AudioHTMLAttributes, VideoHTMLAttributes {
    src: string
}

export interface HTMLMediaState {
    buffered: any[];
    duration: number;
    paused: boolean;
    muted: boolean;
    time: number;
    volume: number;
    controls: boolean;
    autoplay: boolean;
}

export interface HTMLMediaControls {
    play: () => Promise<void> | void;
    pause: () => void;
    mute: () => void;
    unmute: () => void;
    volume: (volume: number) => void;
    seek: (time: number) => void;
}

type createHTMLMediaHookReturn = [
    VNode<HTMLMediaProps>,
    Ref<HTMLMediaState>,
    HTMLMediaControls,
    (Ref<HTMLAudioElement | null>)
];

export default function createHTMLMediaHook(tag: 'audio' | 'video') {
    return (
        elOrProps: HTMLMediaProps | Ref<HTMLMediaProps> | VNode<HTMLMediaProps>
    ): createHTMLMediaHookReturn => {

        let element: VNode<any> | undefined;
        let props: HTMLMediaProps;

        if (isVNode(elOrProps)) {
            element = elOrProps;
            props = element.props as HTMLMediaProps
        } else {
            props = unref(elOrProps) as HTMLMediaProps;
        }

        const [state, setState] = useSetState<HTMLMediaState>({
            buffered: [],
            time: 0,
            duration: 0,
            paused: true,
            muted: false,
            volume: 1,
            controls: false,
            autoplay: true
        });

        const ref = useRef<HTMLAudioElement | null>(null);

        const wrapEvent = (userEvent, proxyEvent?) => {
            return (event) => {
                try {
                    proxyEvent && proxyEvent(event);
                } finally {
                    userEvent && userEvent(event);
                }
            };
        };

        const onPlay = () => setState({paused: false});
        const onPause = () => setState({paused: true});
        const onVolumeChange = () => {
            const el = ref.value;
            if (!el) {
                return;
            }
            setState({
                muted: el.muted,
                volume: el.volume,
            });
        };
        const onDurationChange = () => {
            const el = ref.value;
            if (!el) {
                return;
            }
            const {duration, buffered} = el;
            setState({
                duration,
                buffered: parseTimeRanges(buffered),
            });
        };
        const onTimeUpdate = () => {
            const el = ref.value;
            if (!el) {
                return;
            }
            setState({time: el.currentTime});
        };
        const onProgress = () => {
            const el = ref.value;
            if (!el) {
                return;
            }
            setState({buffered: parseTimeRanges(el.buffered)});
        };

        if (element) {
            element = createVNode(element, {
                controls: false,
                ...props,
                ref,
                onPlay: wrapEvent(props.onPlay, onPlay),
                onPause: wrapEvent(props.onPause, onPause),
                onVolumeChange: wrapEvent(props.onVolumechange, onVolumeChange),
                onDurationChange: wrapEvent(props.onDurationchange, onDurationChange),
                onTimeUpdate: wrapEvent(props.onTimeupdate, onTimeUpdate),
                onProgress: wrapEvent(props.onProgress, onProgress),
            });
        } else {
            element = createVNode(tag, {
                controls: false,
                ...props,
                ref,
                onPlay: wrapEvent(props.onPlay, onPlay),
                onPause: wrapEvent(props.onPause, onPause),
                onVolumeChange: wrapEvent(props.onVolumechange, onVolumeChange),
                onDurationChange: wrapEvent(props.onDurationchange, onDurationChange),
                onTimeUpdate: wrapEvent(props.onTimeupdate, onTimeUpdate),
                onProgress: wrapEvent(props.onProgress, onProgress),
            } as any); // TODO: fix this typing.
        }

        // Some browsers return `Promise` on `.play()` and may throw errors
        // if one tries to execute another `.play()` or `.pause()` while that
        // promise is resolving. So we prevent that with this lock.
        // See: https://bugs.chromium.org/p/chromium/issues/detail?id=593273
        let lockPlay: boolean = false;

        const controls = {
            play: () => {
                const el = ref.value;
                if (!el) {
                    return undefined;
                }

                if (!lockPlay) {
                    const promise = el.play();
                    const isPromise = typeof promise === 'object';

                    if (isPromise) {
                        lockPlay = true;
                        const resetLock = () => {
                            lockPlay = false;
                        };
                        promise.then(resetLock, resetLock);
                    }

                    return promise;
                }
                return undefined;
            },
            pause: () => {
                const el = ref.value;
                if (el && !lockPlay) {
                    return el.pause();
                }
            },
            seek: (time: number) => {
                const el = ref.value;
                if (!el || state.value.duration === undefined) {
                    return;
                }
                time = Math.min(state.value.duration, Math.max(0, time));
                el.currentTime = time;
            },
            volume: (volume: number) => {
                const el = ref.value;
                if (!el) {
                    return;
                }
                volume = Math.min(1, Math.max(0, volume));
                el.volume = volume;
                setState({volume});
            },
            mute: () => {
                const el = ref.value;
                if (!el) {
                    return;
                }
                el.muted = true;
                setState({muted: el.muted});
            },
            unmute: () => {
                const el = ref.value;
                if (!el) {
                    return;
                }
                el.muted = false;
                setState({muted: el.muted});
            },
            show: () => {
                const el = ref.value;
                if (!el) {
                    return;
                }
                el.controls = true;
            },
            hide: () => {
                const el = ref.value;
                if (!el) {
                    return;
                }
                el.controls = false;
            },
            autoplay: (autoplay: boolean) => {
                const el = ref.value;
                if (!el) {
                    return;
                }
                el.autoplay = !!autoplay;
            }
        };

        useEffect(() => {
            const el = ref.value!;

            if (!el) {
                if (process.env.NODE_ENV !== 'production') {
                    if (tag === 'audio') {
                        console.error(
                            'useAudio() ref to <audio> element is empty at mount. ' +
                            'It seem you have not rendered the audio element, which it ' +
                            'returns as the first argument const [audio] = useAudio(...).'
                        );
                    } else if (tag === 'video') {
                        console.error(
                            'useVideo() ref to <video> element is empty at mount. ' +
                            'It seem you have not rendered the video element, which it ' +
                            'returns as the first argument const [video] = useVideo(...).'
                        );
                    }
                }
                return;
            }

            if (isRef(elOrProps) && el.src != elOrProps.value.src) {
                el.src = elOrProps.value.src;
            }

            setState({
                volume: el.volume,
                muted: el.muted,
                paused: el.paused,
                controls: el.controls,
                autoplay: el.autoplay,
            });

            // Start media, if autoPlay requested.
            if (el.autoplay && el.paused) {
                controls.play();
            }
        }, isRef(elOrProps) ? () => elOrProps.value.src : null);

        return [element, computed(() => {
            return state.value;
        }), controls, ref];
    };
}