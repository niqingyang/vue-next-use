import { isRef, isReactive, ref, onMounted, onUnmounted, watch, unref, computed, onBeforeUnmount, isVNode, createVNode, cloneVNode, reactive, toRaw, readonly } from 'vue';
export { ref as useRef } from 'vue';
import writeText from 'copy-to-clipboard';
import screenfull from 'screenfull';
import Cookies from 'js-cookie';
import { setHarmonicInterval, clearHarmonicInterval } from 'set-harmonic-interval';
import { SpringSystem } from 'rebound';

const noop = () => {
};
function on(obj, ...args) {
    if (obj && obj.addEventListener) {
        obj.addEventListener(...args);
    }
}
function off(obj, ...args) {
    if (obj && obj.removeEventListener) {
        obj.removeEventListener(...args);
    }
}
const isBrowser = typeof window !== 'undefined';
const isNavigator = typeof navigator !== 'undefined';
const isWatchSource = (target) => {
    // A watch source can only be a getter/effect function, a ref, a reactive object, or an array of these types.
    if (isRef(target) || isReactive(target) || target instanceof Function) {
        return true;
    }
    return false;
};
/**
 * filter watch sources
 * @param target
 * @returns
 */
const sources = (target) => {
    const deps = [];
    if (Array.isArray(target)) {
        target.forEach((item) => {
            if (isWatchSource(item)) {
                deps.push(item);
            }
        });
        return deps.length > 0 ? deps : null;
    }
    if (isWatchSource(target)) {
        return target;
    }
    return null;
};

function useMountedState() {
    const mountedRef = ref(false);
    const get = () => mountedRef.value;
    onMounted(() => {
        mountedRef.value = true;
    });
    onUnmounted(() => {
        mountedRef.value = false;
    });
    return get;
}

function useAsyncFn(fn, initialState = { loading: false }) {
    const lastCallId = ref(0);
    const isMounted = useMountedState();
    const [state, set] = useReactive(initialState);
    const callback = (...args) => {
        const callId = ++lastCallId.value;
        state.loading = true;
        return fn(...args).then((value) => {
            isMounted() && callId === lastCallId.value && set({ value, loading: false });
            return value;
        }, (error) => {
            isMounted() && callId === lastCallId.value && set({ error, loading: false });
            return error;
        });
    };
    return [state, callback];
}

function useAsync(fn, deps) {
    const [state, callback] = useAsyncFn(fn, {
        loading: true,
    });
    if (deps) {
        watch(deps, () => {
            callback();
        }, {
            immediate: true
        });
    }
    else {
        callback();
    }
    return state;
}

function resolveHookState(nextState, currentState) {
    if (typeof nextState === 'function') {
        return nextState.length ? nextState(currentState) : nextState();
    }
    return nextState;
}

function useState(initialState) {
    const state = ref(resolveHookState(initialState));
    const set = (value) => {
        if (value instanceof Function) {
            state.value = value(state.value);
        }
        else {
            state.value = unref(value);
        }
    };
    return [state, set];
}

function useAsyncRetry(fn, deps = []) {
    const [attempt, setAttempt] = useState(0);
    const state = useAsync(fn, [...deps, attempt]);
    state.retry = () => {
        if (state.loading) {
            if (process.env.NODE_ENV === 'development') {
                console.log('You are calling useAsyncRetry hook retry() method while loading in progress, this is a no-op.');
            }
            return;
        }
        setAttempt((currentAttempt) => currentAttempt + 1);
    };
    return state;
}

// for internal
function useComputedState(initialState) {
    const [state, setState] = useState(initialState);
    return [
        computed(() => {
            return state.value;
        }),
        setState
    ];
}

const useBeforeUnload = (enabled = true, message) => {
    const handler = (event) => {
        const finalEnabled = typeof enabled === 'function' ? enabled() : true;
        if (!finalEnabled) {
            return;
        }
        event.preventDefault();
        if (message) {
            event.returnValue = message;
        }
        return message;
    };
    onMounted(() => {
        watch([enabled], ([value], oldValue) => {
            if (value) {
                on(window, 'beforeunload', handler);
            }
            else {
                off(window, 'beforeunload', handler);
            }
        }, {
            immediate: true
        });
    });
    onBeforeUnmount(() => {
        off(window, 'beforeunload', handler);
    });
};

// 队列
const useQueue = (initialValue = []) => {
    const [state, set] = useState(initialValue);
    return {
        add: (value) => {
            set((queue) => [...queue, value]);
        },
        remove: () => {
            let result = undefined;
            set(([first, ...rest]) => {
                result = first;
                return rest;
            });
            return result;
        },
        first: computed(() => {
            return state.value[0];
        }),
        last: computed(() => {
            return state.value[state.value.length - 1];
        }),
        size: computed(() => {
            return state.value.length;
        }),
    };
};

function useList(initialList = []) {
    const [list] = useState(resolveHookState(initialList));
    const actions = {
        set: (newList) => {
            list.value = resolveHookState(newList, list.value);
        },
        push: (...items) => {
            items.length && actions.set((curr) => curr.concat(items));
        },
        updateAt: (index, item) => {
            actions.set((curr) => {
                const arr = curr.slice();
                arr[index] = item;
                return arr;
            });
        },
        insertAt: (index, item) => {
            actions.set((curr) => {
                const arr = curr.slice();
                index > arr.length ? (arr[index] = item) : arr.splice(index, 0, item);
                return arr;
            });
        },
        update: (predicate, newItem) => {
            actions.set((curr) => curr.map((item) => (predicate(item, newItem) ? newItem : item)));
        },
        updateFirst: (predicate, newItem) => {
            const index = list.value.findIndex((item) => predicate(item, newItem));
            index >= 0 && actions.updateAt(index, newItem);
        },
        upsert: (predicate, newItem) => {
            const index = list.value.findIndex((item) => predicate(item, newItem));
            index >= 0 ? actions.updateAt(index, newItem) : actions.push(newItem);
        },
        sort: (compareFn) => {
            actions.set((curr) => curr.slice().sort(compareFn));
        },
        filter: (callbackFn, thisArg) => {
            actions.set((curr) => curr.slice().filter(callbackFn, thisArg));
        },
        removeAt: (index) => {
            actions.set((curr) => {
                const arr = curr.slice();
                arr.splice(index, 1);
                return arr;
            });
        },
        clear: () => {
            actions.set([]);
        },
        reset: () => {
            actions.set(resolveHookState(initialList).slice());
        }
    };
    return [computed(() => {
            return list.value;
        }), actions];
}

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.
Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.
THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
function __rest(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
}

const useMap = (initialMap = {}) => {
    const [map, set] = useState(initialMap);
    const stableActions = {
        set: (key, entry) => {
            set((prevMap) => (Object.assign(Object.assign({}, prevMap), { [key]: entry })));
        },
        setAll: (newMap) => {
            set(newMap);
        },
        remove: (key) => {
            set((prevMap) => {
                const _a = prevMap, _b = key; _a[_b]; const rest = __rest(_a, [typeof _b === "symbol" ? _b : _b + ""]);
                return rest;
            });
        },
        reset: () => set(initialMap),
    };
    const utils = Object.assign({ get: (key) => map.value[key] }, stableActions);
    return [computed(() => {
            return map.value;
        }), utils];
};

function useSetState(initialState) {
    const state = ref(resolveHookState(initialState));
    const setState = (patch) => {
        state.value = Object.assign({}, state.value, resolveHookState(patch, state.value));
    };
    return [state, setState];
}
const [state, setState] = useSetState({
    name: '123',
    id: '123'
});
setState({ name: '123' });
setState(() => ({ name: '123' }));

function useComputedSetState(initialState) {
    const [state, setState] = useSetState(initialState);
    return [computed(() => {
            return state.value;
        }), setState];
}

const useCopyToClipboard = () => {
    const isMounted = useMountedState();
    const [state, setState] = useReactive({
        value: undefined,
        error: undefined,
        noUserInteraction: true,
    });
    const copyToClipboard = (value) => {
        if (!isMounted()) {
            return;
        }
        let noUserInteraction;
        let normalizedValue;
        try {
            value = unref(value);
            // only strings and numbers casted to strings can be copied to clipboard
            if (typeof value !== 'string' && typeof value !== 'number') {
                const error = new Error(`Cannot copy typeof ${typeof value} to clipboard, must be a string`);
                if (process.env.NODE_ENV === 'development')
                    console.error(error);
                setState({
                    value,
                    error,
                    noUserInteraction: true,
                });
                return;
            }
            // empty strings are also considered invalid
            else if (value === '') {
                const error = new Error(`Cannot copy empty string to clipboard.`);
                if (process.env.NODE_ENV === 'development')
                    console.error(error);
                setState({
                    value,
                    error,
                    noUserInteraction: true,
                });
                return;
            }
            normalizedValue = value.toString();
            noUserInteraction = writeText(normalizedValue);
            setState({
                value: normalizedValue,
                error: undefined,
                noUserInteraction,
            });
        }
        catch (error) {
            setState({
                value: normalizedValue,
                error,
                noUserInteraction,
            });
        }
    };
    return [state, copyToClipboard];
};

const useToggle = (initialValue) => {
    const [state, set] = useState(initialValue);
    const toggle = (nextValue) => {
        set(typeof nextValue === 'boolean' ? nextValue : !state.value);
    };
    return [state, toggle];
};

// 这个 hook 对于 vue 来说应该意义不大，但还是拿过来吧
function useGetSet(initialState) {
    const [state, set] = useState(resolveHookState(initialState));
    return [
        () => state.value,
        (newState) => {
            state.value = resolveHookState(newState, state.value);
        },
    ];
}

const useSet = (initialSet = new Set()) => {
    const [set, setSet] = useState(initialSet);
    const stableActions = () => {
        const add = (item) => setSet((prevSet) => new Set([...Array.from(prevSet), item]));
        const remove = (item) => setSet((prevSet) => new Set(Array.from(prevSet).filter((i) => i !== item)));
        const toggle = (item) => setSet((prevSet) => prevSet.has(item)
            ? new Set(Array.from(prevSet).filter((i) => i !== item))
            : new Set([...Array.from(prevSet), item]));
        return { add, remove, toggle, reset: () => setSet(initialSet) };
    };
    const utils = Object.assign({ has: (item) => set.value.has(item) }, stableActions());
    return [set, utils];
};

function parseTimeRanges(ranges) {
    const result = [];
    for (let i = 0; i < ranges.length; i++) {
        result.push({
            start: ranges.start(i),
            end: ranges.end(i),
        });
    }
    return result;
}

function createHTMLMediaHook(tag) {
    return (elOrProps) => {
        let element;
        let props;
        if (isVNode(elOrProps)) {
            element = elOrProps;
            props = element.props;
        }
        else {
            props = elOrProps;
        }
        const [state, setState] = useSetState({
            buffered: [],
            time: 0,
            duration: 0,
            paused: true,
            muted: false,
            volume: 1,
            controls: false,
            autoplay: true
        });
        const ref$1 = ref(null);
        const wrapEvent = (userEvent, proxyEvent) => {
            return (event) => {
                try {
                    proxyEvent && proxyEvent(event);
                }
                finally {
                    userEvent && userEvent(event);
                }
            };
        };
        const onPlay = () => setState({ paused: false });
        const onPause = () => setState({ paused: true });
        const onVolumeChange = () => {
            const el = ref$1.value;
            if (!el) {
                return;
            }
            setState({
                muted: el.muted,
                volume: el.volume,
            });
        };
        const onDurationChange = () => {
            const el = ref$1.value;
            if (!el) {
                return;
            }
            const { duration, buffered } = el;
            setState({
                duration,
                buffered: parseTimeRanges(buffered),
            });
        };
        const onTimeUpdate = () => {
            const el = ref$1.value;
            if (!el) {
                return;
            }
            setState({ time: el.currentTime });
        };
        const onProgress = () => {
            const el = ref$1.value;
            if (!el) {
                return;
            }
            setState({ buffered: parseTimeRanges(el.buffered) });
        };
        if (element) {
            element = createVNode({
                render() {
                    return element && createVNode(element, Object.assign(Object.assign({ controls: false }, props), { ref: ref$1, onPlay: wrapEvent(props.onPlay, onPlay), onPause: wrapEvent(props.onPause, onPause), onVolumechange: wrapEvent(props.onVolumechange, onVolumeChange), onDurationchange: wrapEvent(props.onDurationchange, onDurationChange), onTimeupdate: wrapEvent(props.onTimeupdate, onTimeUpdate), onProgress: wrapEvent(props.onProgress, onProgress) }));
                }
            });
        }
        else {
            element = createVNode({
                setup() {
                    return () => createVNode(tag, Object.assign(Object.assign({ controls: false }, props), { ref: ref$1, onPlay: wrapEvent(props.onPlay, onPlay), onPause: wrapEvent(props.onPause, onPause), onVolumechange: wrapEvent(props.onVolumechange, onVolumeChange), onDurationchange: wrapEvent(props.onDurationchange, onDurationChange), onTimeupdate: wrapEvent(props.onTimeupdate, onTimeUpdate), onProgress: wrapEvent(props.onProgress, onProgress) }));
                }
            }); // TODO: fix this typing.
        }
        // Some browsers return `Promise` on `.play()` and may throw errors
        // if one tries to execute another `.play()` or `.pause()` while that
        // promise is resolving. So we prevent that with this lock.
        // See: https://bugs.chromium.org/p/chromium/issues/detail?id=593273
        let lockPlay = false;
        const controls = {
            play: () => {
                const el = ref$1.value;
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
                const el = ref$1.value;
                if (el && !lockPlay) {
                    return el.pause();
                }
            },
            seek: (time) => {
                const el = ref$1.value;
                if (!el || state.value.duration === undefined) {
                    return;
                }
                time = Math.min(state.value.duration, Math.max(0, time));
                if (isNaN(time)) {
                    console.error("HTMLMediaElement currentTime must be a number", time);
                }
                el.currentTime = time;
            },
            volume: (volume) => {
                const el = ref$1.value;
                if (!el) {
                    return;
                }
                volume = Math.min(1, Math.max(0, volume));
                el.volume = volume;
                setState({ volume });
            },
            mute: () => {
                const el = ref$1.value;
                if (!el) {
                    return;
                }
                el.muted = true;
                setState({ muted: el.muted });
            },
            unmute: () => {
                const el = ref$1.value;
                if (!el) {
                    return;
                }
                el.muted = false;
                setState({ muted: el.muted });
            },
            toggle: (controls) => {
                const el = ref$1.value;
                if (!el) {
                    return;
                }
                if (controls === undefined) {
                    el.controls = !el.controls;
                }
                else {
                    el.controls = !!controls;
                }
                setState({ controls: el.controls });
            },
            autoplay: (autoplay) => {
                const el = ref$1.value;
                if (!el) {
                    if (process.env.NODE_ENV !== 'production') {
                        if (tag === 'audio') {
                            console.error('useAudio() ref to <audio> element is empty at mount. ' +
                                'It seem you have not rendered the audio element, which it ' +
                                'returns as the first argument const [audio] = useAudio(...).');
                        }
                        else if (tag === 'video') {
                            console.error('useVideo() ref to <video> element is empty at mount. ' +
                                'It seem you have not rendered the video element, which it ' +
                                'returns as the first argument const [video] = useVideo(...).');
                        }
                    }
                    return;
                }
                el.autoplay = !!autoplay;
            },
            change: (src) => {
                const el = ref$1.value;
                if (!el) {
                    return;
                }
                if (el.src == src) {
                    return;
                }
                el.src = src;
                setState({
                    volume: el.volume,
                    muted: el.muted,
                    paused: el.paused,
                });
                // Start media, if autoPlay requested.
                if (el.autoplay && el.paused) {
                    controls.play();
                }
            }
        };
        useEffect(() => {
            const el = ref$1.value;
            if (!el) {
                if (process.env.NODE_ENV !== 'production') {
                    if (tag === 'audio') {
                        console.error('useAudio() ref to <audio> element is empty at mount. ' +
                            'It seem you have not rendered the audio element, which it ' +
                            'returns as the first argument const [audio] = useAudio(...).');
                    }
                    else if (tag === 'video') {
                        console.error('useVideo() ref to <video> element is empty at mount. ' +
                            'It seem you have not rendered the video element, which it ' +
                            'returns as the first argument const [video] = useVideo(...).');
                    }
                }
                return;
            }
            if (el.src == unref(props.src)) {
                return;
            }
            el.src = unref(props.src);
            setState({
                volume: el.volume,
                muted: el.muted,
                paused: el.paused,
            });
            // Start media, if autoPlay requested.
            if (props.autoplay && el.paused) {
                controls.play();
            }
        }, sources(props.src));
        return [() => element, computed(() => {
                return state.value;
            }), controls, ref$1];
    };
}

const useAudio = createHTMLMediaHook('audio');

const useVideo = createHTMLMediaHook('video');

const voices = isBrowser && typeof window.speechSynthesis === 'object' ? window.speechSynthesis.getVoices() : [];
const useSpeech = (text, opts = {}) => {
    const [state, setState] = useReadonly({
        isPlaying: false,
        lang: opts.lang || 'default',
        voice: opts.voice || voices[0],
        rate: opts.rate || 1,
        pitch: opts.pitch || 1,
        volume: opts.volume || 1,
    });
    const utteranceRef = ref(null);
    useMounted(() => {
        const utterance = new SpeechSynthesisUtterance(text);
        opts.lang && (utterance.lang = opts.lang);
        opts.voice && (utterance.voice = opts.voice);
        utterance.rate = opts.rate || 1;
        utterance.pitch = opts.pitch || 1;
        utterance.volume = opts.volume || 1;
        utterance.onstart = () => setState({ isPlaying: true });
        utterance.onresume = () => setState({ isPlaying: true });
        utterance.onend = () => setState({ isPlaying: false });
        utterance.onpause = () => setState({ isPlaying: false });
        utteranceRef.value = utterance;
        window.speechSynthesis.speak(utteranceRef.value);
    });
    return state;
};

const defaultEvents$1 = ['mousedown', 'touchstart'];
const useClickAway = (ref, onClickAway, events = defaultEvents$1) => {
    const handler = (event) => {
        const { value: el } = ref;
        el && !el.contains(event.target) && onClickAway(event);
    };
    useEffect(() => {
        for (const eventName of events) {
            on(document, eventName, handler);
        }
        return () => {
            for (const eventName of events) {
                off(document, eventName, handler);
            }
        };
    });
};

const createProcess$1 = (options, isMounted) => (dataTransfer, event) => {
    const uri = dataTransfer.getData('text/uri-list');
    if (uri) {
        (options.onUri || noop)(uri, event);
        return;
    }
    if (dataTransfer.files && dataTransfer.files.length) {
        (options.onFiles || noop)(Array.from(dataTransfer.files), event);
        return;
    }
    if (dataTransfer.items && dataTransfer.items.length) {
        dataTransfer.items[0].getAsString((text) => {
            if (isMounted()) {
                (options.onText || noop)(text, event);
            }
        });
    }
};
const useDrop = (options = {}, args = []) => {
    const { ref, onFiles, onText, onUri } = options;
    const [state, set] = useReadonly({ over: false });
    const setOver = (over) => {
        set({ over });
    };
    const isMounted = useMountedState();
    const process = createProcess$1(options, isMounted);
    useEffect(() => {
        const element = (ref === null || ref === void 0 ? void 0 : ref.value) ? ref.value : document;
        const onDragOver = (event) => {
            event.preventDefault();
            setOver(true);
        };
        const onDragEnter = (event) => {
            event.preventDefault();
            setOver(true);
        };
        const onDragLeave = () => {
            setOver(false);
        };
        const onDragExit = () => {
            setOver(false);
        };
        const onDrop = (event) => {
            event.preventDefault();
            setOver(false);
            process(event.dataTransfer, event);
        };
        const onPaste = (event) => {
            process(event.clipboardData, event);
        };
        on(element, 'dragover', onDragOver);
        on(element, 'dragenter', onDragEnter);
        on(element, 'dragleave', onDragLeave);
        on(element, 'dragexit', onDragExit);
        on(element, 'drop', onDrop);
        if (onText) {
            on(element, 'paste', onPaste);
        }
        return () => {
            off(element, 'dragover', onDragOver);
            off(element, 'dragenter', onDragEnter);
            off(element, 'dragleave', onDragLeave);
            off(element, 'dragexit', onDragExit);
            off(element, 'drop', onDrop);
            off(element, 'paste', onPaste);
        };
    }, sources([ref]));
    return state;
};

/*
const defaultState: DropAreaState = {
  over: false,
};
*/
const createProcess = (options, isMounted) => (dataTransfer, event) => {
    const uri = dataTransfer.getData('text/uri-list');
    if (uri) {
        (options.onUri || noop)(uri, event);
        return;
    }
    if (dataTransfer.files && dataTransfer.files.length) {
        (options.onFiles || noop)(Array.from(dataTransfer.files), event);
        return;
    }
    if (dataTransfer.items && dataTransfer.items.length) {
        dataTransfer.items[0].getAsString((text) => {
            if (isMounted()) {
                (options.onText || noop)(text, event);
            }
        });
    }
};
const createBond = (process, setOver) => ({
    onDragover: (event) => {
        event.preventDefault();
        setOver(true);
    },
    onDragenter: (event) => {
        event.preventDefault();
        setOver(true);
    },
    onDragleave: () => {
        setOver(false);
    },
    onDrop: (event) => {
        event.preventDefault();
        setOver(false);
        process(event.dataTransfer, event);
    },
    onPaste: (event) => {
        process(event.clipboardData, event);
    },
});
// 绑定事件
// @dragover="bond.onDragOver"
// @dragenter="bond.onDragEnter"
// @dragleave="bond.onDragLeave"
// @drop="bond.onDrop"
// @paste="bond.onPaste"
const useDropArea = (options = {}) => {
    const isMounted = useMountedState();
    const [state, set] = useReadonly({ over: false });
    const setOver = (over) => {
        set({ over });
    };
    const process = createProcess(options, isMounted);
    const bond = createBond(process, setOver);
    return [bond, state];
};

const useFullscreen = (ref, enabled, options = {}) => {
    const { video, onClose = noop } = options;
    const [isFullscreen, setIsFullscreen] = useState(unref(enabled));
    useEffect(() => {
        if (!unref(enabled)) {
            return;
        }
        if (!ref.value) {
            return;
        }
        const onWebkitEndFullscreen = () => {
            if (video === null || video === void 0 ? void 0 : video.value) {
                off(video.value, 'webkitendfullscreen', onWebkitEndFullscreen);
            }
            onClose();
        };
        const onChange = () => {
            if (screenfull.isEnabled) {
                const isScreenfullFullscreen = screenfull.isFullscreen;
                setIsFullscreen(isScreenfullFullscreen);
                if (!isScreenfullFullscreen) {
                    onClose();
                }
            }
        };
        if (screenfull.isEnabled) {
            try {
                screenfull.request(ref.value);
                setIsFullscreen(true);
            }
            catch (error) {
                onClose(error);
                setIsFullscreen(false);
            }
            screenfull.on('change', onChange);
        }
        else if (video && video.value && video.value.webkitEnterFullscreen) {
            video.value.webkitEnterFullscreen();
            on(video.value, 'webkitendfullscreen', onWebkitEndFullscreen);
            setIsFullscreen(true);
        }
        else {
            onClose();
            setIsFullscreen(false);
        }
        return () => {
            setIsFullscreen(false);
            if (screenfull.isEnabled) {
                try {
                    screenfull.off('change', onChange);
                    screenfull.exit();
                }
                catch (_a) {
                }
            }
            else if (video && video.value && video.value.webkitExitFullscreen) {
                off(video.value, 'webkitendfullscreen', onWebkitEndFullscreen);
                video.value.webkitExitFullscreen();
            }
        };
    }, enabled);
    return computed(() => {
        return isFullscreen.value;
    });
};

const useCookie = (cookieName) => {
    const [value, setValue] = useComputedState(() => (Cookies.get(cookieName) || null));
    const updateCookie = (newValue, options) => {
        Cookies.set(cookieName, newValue, options);
        setValue(newValue);
    };
    const deleteCookie = () => {
        Cookies.remove(cookieName);
        setValue(null);
    };
    return [value, updateCookie, deleteCookie];
};

// fn: Function - function that will be called;
// ms: number - delay in milliseconds;
// isReady: ComputedRef<boolean|null> - the current timeout state:
//      false - pending
//      true - called
//      null - cancelled
// cancel: ()=>void - cancel the timeout
// reset: ()=>void - reset the timeout
function useTimeoutFn(fn, ms = 0) {
    const timeout = ref();
    const isReady = ref(false);
    const set = () => {
        isReady.value = false;
        timeout.value && clearTimeout(timeout.value);
        timeout.value = setTimeout(() => {
            isReady.value = true;
            unref(fn)();
        }, unref(ms));
    };
    const clear = () => {
        isReady.value = null;
        timeout.value && clearTimeout(timeout.value);
    };
    // set on mount, clear on unmount
    useEffect(() => {
        set();
        return clear;
    }, isRef(ms) ? ms : null);
    return [computed(() => {
            return isReady.value;
        }), clear, set];
}

function useTimeout(ms = 0) {
    return useTimeoutFn(() => {
        return;
    }, ms);
}

const useInterval = (callback, delay) => {
    const savedCallback = ref(unref(callback));
    if (isRef(callback)) {
        watch(callback, () => {
            savedCallback.value = unref(callback);
        });
    }
    useEffect(() => {
        if (unref(delay) !== null) {
            const interval = setInterval(unref(savedCallback), unref(delay) || 0);
            return () => clearInterval(interval);
        }
        return undefined;
    }, sources(delay));
};

const useHarmonicIntervalFn = (fn, delay = 0) => {
    const latestCallback = ref(() => {
        // void
    });
    useEffect(() => {
        latestCallback.value = fn;
    });
    useEffect(() => {
        if (unref(delay) !== null) {
            const interval = setHarmonicInterval(() => latestCallback.value, unref(delay) || 0);
            return () => clearHarmonicInterval(interval);
        }
        return undefined;
    }, isRef(delay) ? delay : undefined);
};

function useEffect(fn, deps = undefined) {
    const [callback, setCallback] = useState(undefined);
    onMounted(() => {
        setCallback(() => fn());
        if (deps) {
            watch(deps, (newValue, oldValue) => {
                if (callback.value instanceof Function) {
                    callback.value();
                }
                setCallback(() => fn());
            });
        }
    });
    onUnmounted(() => {
        if (callback.value instanceof Function) {
            callback.value();
        }
    });
}

const useSpring = (targetValue = 0, tension = 50, friction = 3) => {
    const [spring, setSpring] = useState(null);
    const [value, setValue] = useState(unref(targetValue));
    // memoize listener to being able to unsubscribe later properly, otherwise
    // listener fn will be different on each re-render and wouldn't unsubscribe properly.
    const listener = {
        onSpringUpdate: (currentSpring) => {
            const newValue = currentSpring.getCurrentValue();
            setValue(newValue);
        },
    };
    useEffect(() => {
        if (!spring.value) {
            const newSpring = new SpringSystem().createSpring(unref(tension), unref(friction));
            newSpring.setCurrentValue(unref(targetValue));
            setSpring(newSpring);
            newSpring.addListener(listener);
        }
        return () => {
            if (spring.value) {
                spring.value.removeListener(listener);
                setSpring(null);
            }
        };
    }, [
        computed(() => {
            return unref(tension);
        }),
        computed(() => {
            return unref(friction);
        })
    ]);
    useEffect(() => {
        if (spring.value) {
            spring.value.setEndValue(unref(targetValue));
        }
    }, isRef(targetValue) ? targetValue : null);
    return value;
};

const defaultTarget = isBrowser ? window : null;
const isListenerType1 = (target) => {
    return !!target.addEventListener;
};
const isListenerType2 = (target) => {
    return !!target.on;
};
const useEvent = (name, handler, target = defaultTarget, options) => {
    useEffect(() => {
        if (!handler) {
            return;
        }
        if (!target) {
            return;
        }
        const element = unref(target);
        const fn = unref(handler);
        if (isListenerType1(element)) {
            on(element, name, fn, options);
        }
        else if (isListenerType2(element)) {
            element.on(name, fn, options);
        }
        return () => {
            if (isListenerType1(element)) {
                off(element, name, fn, options);
            }
            else if (isListenerType2(element)) {
                element.off(name, fn, options);
            }
        };
    }, sources([name, isRef(handler) ? handler : () => handler, target, JSON.stringify(options)]));
};

const createKeyPredicate = (keyFilter) => typeof keyFilter === 'function'
    ? keyFilter
    : typeof keyFilter === 'string'
        ? (event) => event.key === keyFilter
        : keyFilter
            ? () => true
            : () => false;
const useKey = (key, fn = noop, opts = {}) => {
    const { event = 'keydown', target, options } = opts;
    const [predicate, setPredicate] = useState(() => createKeyPredicate(unref(key)));
    if (isRef(key)) {
        watch(key, () => {
            setPredicate(() => createKeyPredicate(unref(key)));
        });
    }
    const handler = (handlerEvent) => {
        if (unref(predicate)(handlerEvent)) {
            return fn(handlerEvent);
        }
    };
    useEvent(event, handler, target, options);
};

var UseKey = {
  template: '<Fragment></Fragment>',
  props: {
    filter: {
      type: [String, Function],
      required: true
    },
    fn: {
      type: Function
    },
    event: {
      type: String
    },
    target: {
      Object
    },
    options: {
      Object
    }
  },
  setup(props) {
    const {
      filter,
      fn,
      ...rest
    } = props;
    useKey(filter, fn, rest);
    return {};
  }
};

const useGeolocation = (options) => {
    const [state, setState] = useReadonly({
        loading: true,
        accuracy: null,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        latitude: null,
        longitude: null,
        speed: null,
        timestamp: Date.now(),
    });
    let mounted = true;
    let watchId;
    const onEvent = (event) => {
        if (mounted) {
            setState({
                loading: false,
                accuracy: event.coords.accuracy,
                altitude: event.coords.altitude,
                altitudeAccuracy: event.coords.altitudeAccuracy,
                heading: event.coords.heading,
                latitude: event.coords.latitude,
                longitude: event.coords.longitude,
                speed: event.coords.speed,
                timestamp: event.timestamp,
            });
        }
    };
    const onEventError = (error) => mounted && setState((oldState) => (Object.assign(Object.assign({}, oldState), { loading: false, error })));
    useEffect(() => {
        navigator.geolocation.getCurrentPosition(onEvent, onEventError, options);
        watchId = navigator.geolocation.watchPosition(onEvent, onEventError, options);
        return () => {
            mounted = false;
            navigator.geolocation.clearWatch(watchId);
        };
    });
    return state;
};

function throttle (delay, noTrailing, callback, debounceMode) {
  var timeoutID;
  var cancelled = false;
  var lastExec = 0;
  function clearExistingTimeout() {
    if (timeoutID) {
      clearTimeout(timeoutID);
    }
  }
  function cancel() {
    clearExistingTimeout();
    cancelled = true;
  }
  if (typeof noTrailing !== 'boolean') {
    debounceMode = callback;
    callback = noTrailing;
    noTrailing = undefined;
  }
  function wrapper() {
    for (var _len = arguments.length, arguments_ = new Array(_len), _key = 0; _key < _len; _key++) {
      arguments_[_key] = arguments[_key];
    }
    var self = this;
    var elapsed = Date.now() - lastExec;
    if (cancelled) {
      return;
    }
    function exec() {
      lastExec = Date.now();
      callback.apply(self, arguments_);
    }
    function clear() {
      timeoutID = undefined;
    }
    if (debounceMode && !timeoutID) {
      exec();
    }
    clearExistingTimeout();
    if (debounceMode === undefined && elapsed > delay) {
      exec();
    } else if (noTrailing !== true) {
      timeoutID = setTimeout(debounceMode ? clear : exec, debounceMode === undefined ? delay - elapsed : delay);
    }
  }
  wrapper.cancel = cancel;
  return wrapper;
}

const defaultEvents = ['mousemove', 'mousedown', 'resize', 'keydown', 'touchstart', 'wheel'];
const oneMinute = 60e3;
const useIdle = (ms = oneMinute, initialState = false, events = defaultEvents) => {
    const [state, setState] = useState(initialState);
    useEffect(() => {
        let mounted = true;
        let timeout;
        let localState = state.value;
        const set = (newState) => {
            if (mounted) {
                localState = newState;
                setState(newState);
            }
        };
        const onEvent = throttle(50, () => {
            if (localState) {
                set(false);
            }
            clearTimeout(timeout);
            timeout = setTimeout(() => set(true), unref(ms));
        });
        const onVisibility = () => {
            if (!document.hidden) {
                onEvent();
            }
        };
        const e = unref(events);
        for (let i = 0; i < e.length; i++) {
            on(window, e[i], onEvent);
        }
        on(document, 'visibilitychange', onVisibility);
        timeout = setTimeout(() => set(true), ms);
        return () => {
            mounted = false;
            for (let i = 0; i < e.length; i++) {
                off(window, e[i], onEvent);
            }
            off(document, 'visibilitychange', onVisibility);
        };
    }, sources([ms, events]));
    return computed(() => {
        return state.value;
    });
};

const useHover = (element) => {
    var _a, _b;
    const [state, setState] = useState(false);
    const onMouseEnter = (originalOnMouseEnter) => (event) => {
        (originalOnMouseEnter || noop)(event);
        setState(true);
    };
    const onMouseLeave = (originalOnMouseLeave) => (event) => {
        (originalOnMouseLeave || noop)(event);
        setState(false);
    };
    if (typeof element === 'function') {
        element = element(state);
    }
    const el = cloneVNode(element, {
        onmouseenter: onMouseEnter((_a = element === null || element === void 0 ? void 0 : element.props) === null || _a === void 0 ? void 0 : _a.onMouseEnter),
        onmouseleave: onMouseLeave((_b = element === null || element === void 0 ? void 0 : element.props) === null || _b === void 0 ? void 0 : _b.onMouseLeave),
    });
    return [el, computed(() => {
            return state.value;
        })];
};

// kudos: https://usehooks.com/
const useHoverDirty = (ref, enabled = true) => {
    if (process.env.NODE_ENV === 'development') {
        if (typeof ref !== 'object' || typeof unref(ref) === 'undefined') {
            console.error('useHoverDirty expects a single ref argument.');
        }
    }
    const [value, setValue] = useComputedState(false);
    const onMouseOver = () => setValue(true);
    const onMouseOut = () => setValue(false);
    useEffect(() => {
        if (enabled && ref && ref.value) {
            on(ref.value, 'mouseover', onMouseOver);
            on(ref.value, 'mouseout', onMouseOut);
        }
        // fixes react-hooks/exhaustive-deps warning about stale ref elements
        const { value } = ref;
        return () => {
            if (enabled && value) {
                off(value, 'mouseover', onMouseOver);
                off(value, 'mouseout', onMouseOut);
            }
        };
    }, sources([enabled, ref]));
    return value;
};

/**
 * read and write url hash, response to url hash change
 */
function useHash() {
    const [hash, setHash] = useState(() => window.location.hash);
    const onHashChange = () => {
        setHash(window.location.hash);
    };
    useEffect(() => {
        on(window, 'hashchange', onHashChange);
        return () => {
            off(window, 'hashchange', onHashChange);
        };
    });
    watch(hash, (newHash) => {
        if (window.location.hash != newHash) {
            window.location.hash = newHash;
        }
    });
    const _setHash = (newHash) => {
        if (newHash !== unref(hash)) {
            window.location.hash = newHash;
        }
    };
    return [hash, _setHash];
}

const useIntersection = (ref, options) => {
    const [intersectionObserverEntry, setIntersectionObserverEntry,] = useComputedState(null);
    const deps = [ref];
    if (isRef(options)) {
        deps.push(() => unref(options).threshold);
        deps.push(() => unref(options).root);
        deps.push(() => unref(options).rootMargin);
    }
    else {
        deps.push(options === null || options === void 0 ? void 0 : options.threshold);
        deps.push(options === null || options === void 0 ? void 0 : options.root);
        deps.push(options === null || options === void 0 ? void 0 : options.rootMargin);
    }
    useEffect(() => {
        if (ref.value && typeof IntersectionObserver === 'function') {
            const handler = (entries) => {
                setIntersectionObserverEntry(entries[0]);
            };
            const observer = new IntersectionObserver(handler, unref(options));
            observer.observe(ref.value);
            return () => {
                setIntersectionObserverEntry(null);
                observer.disconnect();
            };
        }
        return () => {
        };
    }, sources(deps));
    return intersectionObserverEntry;
};

const useKeyPress = (keyFilter) => {
    const [state, set] = useState([false, null]);
    useKey(keyFilter, (event) => set([true, event]), { event: 'keydown' });
    useKey(keyFilter, (event) => set([false, event]), { event: 'keyup' });
    return [computed(() => state.value[0]), computed(() => state.value[1])];
};

const useKeyPressEvent = (key, keydown, keyup, useKeyPress$1 = useKeyPress) => {
    const [pressed, event] = useKeyPress$1(key);
    watch(pressed, (newPressed) => {
        if (!newPressed && keyup) {
            keyup(unref(event));
        }
        else if (newPressed && keydown) {
            keydown(unref(event));
        }
    });
};

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function createCommonjsModule(fn) {
  var module = { exports: {} };
	return fn(module, module.exports), module.exports;
}

var keyboard = createCommonjsModule(function (module, exports) {
(function (global, factory) {
  module.exports = factory() ;
}(commonjsGlobal, (function () {  function _typeof(obj) {
    "@babel/helpers - typeof";
    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }
    return _typeof(obj);
  }
  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }
  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }
  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
  }
  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) return _arrayLikeToArray(arr);
  }
  function _iterableToArray(iter) {
    if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter);
  }
  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }
  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
    return arr2;
  }
  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  var KeyCombo = function () {
    function KeyCombo(keyComboStr) {
      _classCallCheck(this, KeyCombo);
      this.sourceStr = keyComboStr;
      this.subCombos = KeyCombo.parseComboStr(keyComboStr);
      this.keyNames = this.subCombos.reduce(function (memo, nextSubCombo) {
        return memo.concat(nextSubCombo);
      }, []);
    }
    _createClass(KeyCombo, [{
      key: "check",
      value: function check(pressedKeyNames) {
        var startingKeyNameIndex = 0;
        for (var i = 0; i < this.subCombos.length; i += 1) {
          startingKeyNameIndex = this._checkSubCombo(this.subCombos[i], startingKeyNameIndex, pressedKeyNames);
          if (startingKeyNameIndex === -1) {
            return false;
          }
        }
        return true;
      }
    }, {
      key: "isEqual",
      value: function isEqual(otherKeyCombo) {
        if (!otherKeyCombo || typeof otherKeyCombo !== 'string' && _typeof(otherKeyCombo) !== 'object') {
          return false;
        }
        if (typeof otherKeyCombo === 'string') {
          otherKeyCombo = new KeyCombo(otherKeyCombo);
        }
        if (this.subCombos.length !== otherKeyCombo.subCombos.length) {
          return false;
        }
        for (var i = 0; i < this.subCombos.length; i += 1) {
          if (this.subCombos[i].length !== otherKeyCombo.subCombos[i].length) {
            return false;
          }
        }
        for (var _i = 0; _i < this.subCombos.length; _i += 1) {
          var subCombo = this.subCombos[_i];
          var otherSubCombo = otherKeyCombo.subCombos[_i].slice(0);
          for (var j = 0; j < subCombo.length; j += 1) {
            var keyName = subCombo[j];
            var index = otherSubCombo.indexOf(keyName);
            if (index > -1) {
              otherSubCombo.splice(index, 1);
            }
          }
          if (otherSubCombo.length !== 0) {
            return false;
          }
        }
        return true;
      }
    }, {
      key: "_checkSubCombo",
      value: function _checkSubCombo(subCombo, startingKeyNameIndex, pressedKeyNames) {
        subCombo = subCombo.slice(0);
        pressedKeyNames = pressedKeyNames.slice(startingKeyNameIndex);
        var endIndex = startingKeyNameIndex;
        for (var i = 0; i < subCombo.length; i += 1) {
          var keyName = subCombo[i];
          if (keyName[0] === '\\') {
            var escapedKeyName = keyName.slice(1);
            if (escapedKeyName === KeyCombo.comboDeliminator || escapedKeyName === KeyCombo.keyDeliminator) {
              keyName = escapedKeyName;
            }
          }
          var index = pressedKeyNames.indexOf(keyName);
          if (index > -1) {
            subCombo.splice(i, 1);
            i -= 1;
            if (index > endIndex) {
              endIndex = index;
            }
            if (subCombo.length === 0) {
              return endIndex;
            }
          }
        }
        return -1;
      }
    }]);
    return KeyCombo;
  }();
  KeyCombo.comboDeliminator = '>';
  KeyCombo.keyDeliminator = '+';
  KeyCombo.parseComboStr = function (keyComboStr) {
    var subComboStrs = KeyCombo._splitStr(keyComboStr, KeyCombo.comboDeliminator);
    var combo = [];
    for (var i = 0; i < subComboStrs.length; i += 1) {
      combo.push(KeyCombo._splitStr(subComboStrs[i], KeyCombo.keyDeliminator));
    }
    return combo;
  };
  KeyCombo._splitStr = function (str, deliminator) {
    var s = str;
    var d = deliminator;
    var c = '';
    var ca = [];
    for (var ci = 0; ci < s.length; ci += 1) {
      if (ci > 0 && s[ci] === d && s[ci - 1] !== '\\') {
        ca.push(c.trim());
        c = '';
        ci += 1;
      }
      c += s[ci];
    }
    if (c) {
      ca.push(c.trim());
    }
    return ca;
  };
  var Locale = function () {
    function Locale(name) {
      _classCallCheck(this, Locale);
      this.localeName = name;
      this.activeTargetKeys = [];
      this.pressedKeys = [];
      this._appliedMacros = [];
      this._keyMap = {};
      this._killKeyCodes = [];
      this._macros = [];
    }
    _createClass(Locale, [{
      key: "bindKeyCode",
      value: function bindKeyCode(keyCode, keyNames) {
        if (typeof keyNames === 'string') {
          keyNames = [keyNames];
        }
        this._keyMap[keyCode] = keyNames;
      }
    }, {
      key: "bindMacro",
      value: function bindMacro(keyComboStr, keyNames) {
        if (typeof keyNames === 'string') {
          keyNames = [keyNames];
        }
        var handler = null;
        if (typeof keyNames === 'function') {
          handler = keyNames;
          keyNames = null;
        }
        var macro = {
          keyCombo: new KeyCombo(keyComboStr),
          keyNames: keyNames,
          handler: handler
        };
        this._macros.push(macro);
      }
    }, {
      key: "getKeyCodes",
      value: function getKeyCodes(keyName) {
        var keyCodes = [];
        for (var keyCode in this._keyMap) {
          var index = this._keyMap[keyCode].indexOf(keyName);
          if (index > -1) {
            keyCodes.push(keyCode | 0);
          }
        }
        return keyCodes;
      }
    }, {
      key: "getKeyNames",
      value: function getKeyNames(keyCode) {
        return this._keyMap[keyCode] || [];
      }
    }, {
      key: "setKillKey",
      value: function setKillKey(keyCode) {
        if (typeof keyCode === 'string') {
          var keyCodes = this.getKeyCodes(keyCode);
          for (var i = 0; i < keyCodes.length; i += 1) {
            this.setKillKey(keyCodes[i]);
          }
          return;
        }
        this._killKeyCodes.push(keyCode);
      }
    }, {
      key: "pressKey",
      value: function pressKey(keyCode) {
        if (typeof keyCode === 'string') {
          var keyCodes = this.getKeyCodes(keyCode);
          for (var i = 0; i < keyCodes.length; i += 1) {
            this.pressKey(keyCodes[i]);
          }
          return;
        }
        this.activeTargetKeys.length = 0;
        var keyNames = this.getKeyNames(keyCode);
        for (var _i = 0; _i < keyNames.length; _i += 1) {
          this.activeTargetKeys.push(keyNames[_i]);
          if (this.pressedKeys.indexOf(keyNames[_i]) === -1) {
            this.pressedKeys.push(keyNames[_i]);
          }
        }
        this._applyMacros();
      }
    }, {
      key: "releaseKey",
      value: function releaseKey(keyCode) {
        if (typeof keyCode === 'string') {
          var keyCodes = this.getKeyCodes(keyCode);
          for (var i = 0; i < keyCodes.length; i += 1) {
            this.releaseKey(keyCodes[i]);
          }
        } else {
          var keyNames = this.getKeyNames(keyCode);
          var killKeyCodeIndex = this._killKeyCodes.indexOf(keyCode);
          if (killKeyCodeIndex !== -1) {
            this.pressedKeys.length = 0;
          } else {
            for (var _i2 = 0; _i2 < keyNames.length; _i2 += 1) {
              var index = this.pressedKeys.indexOf(keyNames[_i2]);
              if (index > -1) {
                this.pressedKeys.splice(index, 1);
              }
            }
          }
          this.activeTargetKeys.length = 0;
          this._clearMacros();
        }
      }
    }, {
      key: "_applyMacros",
      value: function _applyMacros() {
        var macros = this._macros.slice(0);
        for (var i = 0; i < macros.length; i += 1) {
          var macro = macros[i];
          if (macro.keyCombo.check(this.pressedKeys)) {
            if (macro.handler) {
              macro.keyNames = macro.handler(this.pressedKeys);
            }
            for (var j = 0; j < macro.keyNames.length; j += 1) {
              if (this.pressedKeys.indexOf(macro.keyNames[j]) === -1) {
                this.pressedKeys.push(macro.keyNames[j]);
              }
            }
            this._appliedMacros.push(macro);
          }
        }
      }
    }, {
      key: "_clearMacros",
      value: function _clearMacros() {
        for (var i = 0; i < this._appliedMacros.length; i += 1) {
          var macro = this._appliedMacros[i];
          if (!macro.keyCombo.check(this.pressedKeys)) {
            for (var j = 0; j < macro.keyNames.length; j += 1) {
              var index = this.pressedKeys.indexOf(macro.keyNames[j]);
              if (index > -1) {
                this.pressedKeys.splice(index, 1);
              }
            }
            if (macro.handler) {
              macro.keyNames = null;
            }
            this._appliedMacros.splice(i, 1);
            i -= 1;
          }
        }
      }
    }]);
    return Locale;
  }();
  var Keyboard = function () {
    function Keyboard(targetWindow, targetElement, targetPlatform, targetUserAgent) {
      _classCallCheck(this, Keyboard);
      this._locale = null;
      this._currentContext = '';
      this._contexts = {};
      this._listeners = [];
      this._appliedListeners = [];
      this._locales = {};
      this._targetElement = null;
      this._targetWindow = null;
      this._targetPlatform = '';
      this._targetUserAgent = '';
      this._isModernBrowser = false;
      this._targetKeyDownBinding = null;
      this._targetKeyUpBinding = null;
      this._targetResetBinding = null;
      this._paused = false;
      this._contexts.global = {
        listeners: this._listeners,
        targetWindow: targetWindow,
        targetElement: targetElement,
        targetPlatform: targetPlatform,
        targetUserAgent: targetUserAgent
      };
      this.setContext('global');
    }
    _createClass(Keyboard, [{
      key: "setLocale",
      value: function setLocale(localeName, localeBuilder) {
        var locale = null;
        if (typeof localeName === 'string') {
          if (localeBuilder) {
            locale = new Locale(localeName);
            localeBuilder(locale, this._targetPlatform, this._targetUserAgent);
          } else {
            locale = this._locales[localeName] || null;
          }
        } else {
          locale = localeName;
          localeName = locale._localeName;
        }
        this._locale = locale;
        this._locales[localeName] = locale;
        if (locale) {
          this._locale.pressedKeys = locale.pressedKeys;
        }
        return this;
      }
    }, {
      key: "getLocale",
      value: function getLocale(localName) {
        localName || (localName = this._locale.localeName);
        return this._locales[localName] || null;
      }
    }, {
      key: "bind",
      value: function bind(keyComboStr, pressHandler, releaseHandler, preventRepeatByDefault) {
        if (keyComboStr === null || typeof keyComboStr === 'function') {
          preventRepeatByDefault = releaseHandler;
          releaseHandler = pressHandler;
          pressHandler = keyComboStr;
          keyComboStr = null;
        }
        if (keyComboStr && _typeof(keyComboStr) === 'object' && typeof keyComboStr.length === 'number') {
          for (var i = 0; i < keyComboStr.length; i += 1) {
            this.bind(keyComboStr[i], pressHandler, releaseHandler);
          }
          return this;
        }
        this._listeners.push({
          keyCombo: keyComboStr ? new KeyCombo(keyComboStr) : null,
          pressHandler: pressHandler || null,
          releaseHandler: releaseHandler || null,
          preventRepeat: preventRepeatByDefault || false,
          preventRepeatByDefault: preventRepeatByDefault || false,
          executingHandler: false
        });
        return this;
      }
    }, {
      key: "addListener",
      value: function addListener(keyComboStr, pressHandler, releaseHandler, preventRepeatByDefault) {
        return this.bind(keyComboStr, pressHandler, releaseHandler, preventRepeatByDefault);
      }
    }, {
      key: "on",
      value: function on(keyComboStr, pressHandler, releaseHandler, preventRepeatByDefault) {
        return this.bind(keyComboStr, pressHandler, releaseHandler, preventRepeatByDefault);
      }
    }, {
      key: "bindPress",
      value: function bindPress(keyComboStr, pressHandler, preventRepeatByDefault) {
        return this.bind(keyComboStr, pressHandler, null, preventRepeatByDefault);
      }
    }, {
      key: "bindRelease",
      value: function bindRelease(keyComboStr, releaseHandler) {
        return this.bind(keyComboStr, null, releaseHandler, preventRepeatByDefault);
      }
    }, {
      key: "unbind",
      value: function unbind(keyComboStr, pressHandler, releaseHandler) {
        if (keyComboStr === null || typeof keyComboStr === 'function') {
          releaseHandler = pressHandler;
          pressHandler = keyComboStr;
          keyComboStr = null;
        }
        if (keyComboStr && _typeof(keyComboStr) === 'object' && typeof keyComboStr.length === 'number') {
          for (var i = 0; i < keyComboStr.length; i += 1) {
            this.unbind(keyComboStr[i], pressHandler, releaseHandler);
          }
          return this;
        }
        for (var _i = 0; _i < this._listeners.length; _i += 1) {
          var listener = this._listeners[_i];
          var comboMatches = !keyComboStr && !listener.keyCombo || listener.keyCombo && listener.keyCombo.isEqual(keyComboStr);
          var pressHandlerMatches = !pressHandler && !releaseHandler || !pressHandler && !listener.pressHandler || pressHandler === listener.pressHandler;
          var releaseHandlerMatches = !pressHandler && !releaseHandler || !releaseHandler && !listener.releaseHandler || releaseHandler === listener.releaseHandler;
          if (comboMatches && pressHandlerMatches && releaseHandlerMatches) {
            this._listeners.splice(_i, 1);
            _i -= 1;
          }
        }
        return this;
      }
    }, {
      key: "removeListener",
      value: function removeListener(keyComboStr, pressHandler, releaseHandler) {
        return this.unbind(keyComboStr, pressHandler, releaseHandler);
      }
    }, {
      key: "off",
      value: function off(keyComboStr, pressHandler, releaseHandler) {
        return this.unbind(keyComboStr, pressHandler, releaseHandler);
      }
    }, {
      key: "setContext",
      value: function setContext(contextName) {
        if (this._locale) {
          this.releaseAllKeys();
        }
        if (!this._contexts[contextName]) {
          var globalContext = this._contexts.global;
          this._contexts[contextName] = {
            listeners: [],
            targetWindow: globalContext.targetWindow,
            targetElement: globalContext.targetElement,
            targetPlatform: globalContext.targetPlatform,
            targetUserAgent: globalContext.targetUserAgent
          };
        }
        var context = this._contexts[contextName];
        this._currentContext = contextName;
        this._listeners = context.listeners;
        this.stop();
        this.watch(context.targetWindow, context.targetElement, context.targetPlatform, context.targetUserAgent);
        return this;
      }
    }, {
      key: "getContext",
      value: function getContext() {
        return this._currentContext;
      }
    }, {
      key: "withContext",
      value: function withContext(contextName, callback) {
        var previousContextName = this.getContext();
        this.setContext(contextName);
        callback();
        this.setContext(previousContextName);
        return this;
      }
    }, {
      key: "watch",
      value: function watch(targetWindow, targetElement, targetPlatform, targetUserAgent) {
        var _this = this;
        this.stop();
        var win = typeof globalThis !== 'undefined' ? globalThis : typeof commonjsGlobal !== 'undefined' ? commonjsGlobal : typeof window !== 'undefined' ? window : {};
        if (!targetWindow) {
          if (!win.addEventListener && !win.attachEvent) {
            throw new Error('Cannot find window functions addEventListener or attachEvent.');
          }
          targetWindow = win;
        }
        if (typeof targetWindow.nodeType === 'number') {
          targetUserAgent = targetPlatform;
          targetPlatform = targetElement;
          targetElement = targetWindow;
          targetWindow = win;
        }
        if (!targetWindow.addEventListener && !targetWindow.attachEvent) {
          throw new Error('Cannot find addEventListener or attachEvent methods on targetWindow.');
        }
        this._isModernBrowser = !!targetWindow.addEventListener;
        var userAgent = targetWindow.navigator && targetWindow.navigator.userAgent || '';
        var platform = targetWindow.navigator && targetWindow.navigator.platform || '';
        targetElement && targetElement !== null || (targetElement = targetWindow.document);
        targetPlatform && targetPlatform !== null || (targetPlatform = platform);
        targetUserAgent && targetUserAgent !== null || (targetUserAgent = userAgent);
        this._targetKeyDownBinding = function (event) {
          _this.pressKey(event.keyCode, event);
          _this._handleCommandBug(event, platform);
        };
        this._targetKeyUpBinding = function (event) {
          _this.releaseKey(event.keyCode, event);
        };
        this._targetResetBinding = function (event) {
          _this.releaseAllKeys(event);
        };
        this._bindEvent(targetElement, 'keydown', this._targetKeyDownBinding);
        this._bindEvent(targetElement, 'keyup', this._targetKeyUpBinding);
        this._bindEvent(targetWindow, 'focus', this._targetResetBinding);
        this._bindEvent(targetWindow, 'blur', this._targetResetBinding);
        this._targetElement = targetElement;
        this._targetWindow = targetWindow;
        this._targetPlatform = targetPlatform;
        this._targetUserAgent = targetUserAgent;
        var currentContext = this._contexts[this._currentContext];
        currentContext.targetWindow = this._targetWindow;
        currentContext.targetElement = this._targetElement;
        currentContext.targetPlatform = this._targetPlatform;
        currentContext.targetUserAgent = this._targetUserAgent;
        return this;
      }
    }, {
      key: "stop",
      value: function stop() {
        if (!this._targetElement || !this._targetWindow) {
          return;
        }
        this._unbindEvent(this._targetElement, 'keydown', this._targetKeyDownBinding);
        this._unbindEvent(this._targetElement, 'keyup', this._targetKeyUpBinding);
        this._unbindEvent(this._targetWindow, 'focus', this._targetResetBinding);
        this._unbindEvent(this._targetWindow, 'blur', this._targetResetBinding);
        this._targetWindow = null;
        this._targetElement = null;
        return this;
      }
    }, {
      key: "pressKey",
      value: function pressKey(keyCode, event) {
        if (this._paused) {
          return this;
        }
        if (!this._locale) {
          throw new Error('Locale not set');
        }
        this._locale.pressKey(keyCode);
        this._applyBindings(event);
        return this;
      }
    }, {
      key: "releaseKey",
      value: function releaseKey(keyCode, event) {
        if (this._paused) {
          return this;
        }
        if (!this._locale) {
          throw new Error('Locale not set');
        }
        this._locale.releaseKey(keyCode);
        this._clearBindings(event);
        return this;
      }
    }, {
      key: "releaseAllKeys",
      value: function releaseAllKeys(event) {
        if (this._paused) {
          return this;
        }
        if (!this._locale) {
          throw new Error('Locale not set');
        }
        this._locale.pressedKeys.length = 0;
        this._clearBindings(event);
        return this;
      }
    }, {
      key: "pause",
      value: function pause() {
        if (this._paused) {
          return this;
        }
        if (this._locale) {
          this.releaseAllKeys();
        }
        this._paused = true;
        return this;
      }
    }, {
      key: "resume",
      value: function resume() {
        this._paused = false;
        return this;
      }
    }, {
      key: "reset",
      value: function reset() {
        this.releaseAllKeys();
        this._listeners.length = 0;
        return this;
      }
    }, {
      key: "_bindEvent",
      value: function _bindEvent(targetElement, eventName, handler) {
        return this._isModernBrowser ? targetElement.addEventListener(eventName, handler, false) : targetElement.attachEvent('on' + eventName, handler);
      }
    }, {
      key: "_unbindEvent",
      value: function _unbindEvent(targetElement, eventName, handler) {
        return this._isModernBrowser ? targetElement.removeEventListener(eventName, handler, false) : targetElement.detachEvent('on' + eventName, handler);
      }
    }, {
      key: "_getGroupedListeners",
      value: function _getGroupedListeners() {
        var listenerGroups = [];
        var listenerGroupMap = [];
        var listeners = this._listeners;
        if (this._currentContext !== 'global') {
          listeners = [].concat(_toConsumableArray(listeners), _toConsumableArray(this._contexts.global.listeners));
        }
        listeners.sort(function (a, b) {
          return (b.keyCombo ? b.keyCombo.keyNames.length : 0) - (a.keyCombo ? a.keyCombo.keyNames.length : 0);
        }).forEach(function (l) {
          var mapIndex = -1;
          for (var i = 0; i < listenerGroupMap.length; i += 1) {
            if (listenerGroupMap[i] === null && l.keyCombo === null || listenerGroupMap[i] !== null && listenerGroupMap[i].isEqual(l.keyCombo)) {
              mapIndex = i;
            }
          }
          if (mapIndex === -1) {
            mapIndex = listenerGroupMap.length;
            listenerGroupMap.push(l.keyCombo);
          }
          if (!listenerGroups[mapIndex]) {
            listenerGroups[mapIndex] = [];
          }
          listenerGroups[mapIndex].push(l);
        });
        return listenerGroups;
      }
    }, {
      key: "_applyBindings",
      value: function _applyBindings(event) {
        var _this2 = this;
        var preventRepeat = false;
        event || (event = {});
        event.preventRepeat = function () {
          preventRepeat = true;
        };
        event.pressedKeys = this._locale.pressedKeys.slice(0);
        var activeTargetKeys = this._locale.activeTargetKeys;
        var pressedKeys = this._locale.pressedKeys.slice(0);
        var listenerGroups = this._getGroupedListeners();
        var _loop = function _loop(i) {
          var listeners = listenerGroups[i];
          var keyCombo = listeners[0].keyCombo;
          if (keyCombo === null || keyCombo.check(pressedKeys) && activeTargetKeys.some(function (k) {
            return keyCombo.keyNames.includes(k);
          })) {
            for (var j = 0; j < listeners.length; j += 1) {
              var listener = listeners[j];
              if (!listener.executingHandler && listener.pressHandler && !listener.preventRepeat) {
                listener.executingHandler = true;
                listener.pressHandler.call(_this2, event);
                listener.executingHandler = false;
                if (preventRepeat || listener.preventRepeatByDefault) {
                  listener.preventRepeat = true;
                  preventRepeat = false;
                }
              }
              if (_this2._appliedListeners.indexOf(listener) === -1) {
                _this2._appliedListeners.push(listener);
              }
            }
            if (keyCombo) {
              for (var _j = 0; _j < keyCombo.keyNames.length; _j += 1) {
                var index = pressedKeys.indexOf(keyCombo.keyNames[_j]);
                if (index !== -1) {
                  pressedKeys.splice(index, 1);
                  _j -= 1;
                }
              }
            }
          }
        };
        for (var i = 0; i < listenerGroups.length; i += 1) {
          _loop(i);
        }
      }
    }, {
      key: "_clearBindings",
      value: function _clearBindings(event) {
        event || (event = {});
        event.pressedKeys = this._locale.pressedKeys.slice(0);
        for (var i = 0; i < this._appliedListeners.length; i += 1) {
          var listener = this._appliedListeners[i];
          var keyCombo = listener.keyCombo;
          if (keyCombo === null || !keyCombo.check(this._locale.pressedKeys)) {
            listener.preventRepeat = false;
            if (keyCombo !== null || event.pressedKeys.length === 0) {
              this._appliedListeners.splice(i, 1);
              i -= 1;
            }
            if (!listener.executingHandler && listener.releaseHandler) {
              listener.executingHandler = true;
              listener.releaseHandler.call(this, event);
              listener.executingHandler = false;
            }
          }
        }
      }
    }, {
      key: "_handleCommandBug",
      value: function _handleCommandBug(event, platform) {
        var modifierKeys = ["shift", "ctrl", "alt", "capslock", "tab", "command"];
        if (platform.match("Mac") && this._locale.pressedKeys.includes("command") && !modifierKeys.includes(this._locale.getKeyNames(event.keyCode)[0])) {
          this._targetKeyUpBinding(event);
        }
      }
    }]);
    return Keyboard;
  }();
  function us(locale, platform, userAgent) {
    locale.bindKeyCode(3, ['cancel']);
    locale.bindKeyCode(8, ['backspace']);
    locale.bindKeyCode(9, ['tab']);
    locale.bindKeyCode(12, ['clear']);
    locale.bindKeyCode(13, ['enter']);
    locale.bindKeyCode(16, ['shift']);
    locale.bindKeyCode(17, ['ctrl']);
    locale.bindKeyCode(18, ['alt', 'menu']);
    locale.bindKeyCode(19, ['pause', 'break']);
    locale.bindKeyCode(20, ['capslock']);
    locale.bindKeyCode(27, ['escape', 'esc']);
    locale.bindKeyCode(32, ['space', 'spacebar']);
    locale.bindKeyCode(33, ['pageup']);
    locale.bindKeyCode(34, ['pagedown']);
    locale.bindKeyCode(35, ['end']);
    locale.bindKeyCode(36, ['home']);
    locale.bindKeyCode(37, ['left']);
    locale.bindKeyCode(38, ['up']);
    locale.bindKeyCode(39, ['right']);
    locale.bindKeyCode(40, ['down']);
    locale.bindKeyCode(41, ['select']);
    locale.bindKeyCode(42, ['printscreen']);
    locale.bindKeyCode(43, ['execute']);
    locale.bindKeyCode(44, ['snapshot']);
    locale.bindKeyCode(45, ['insert', 'ins']);
    locale.bindKeyCode(46, ['delete', 'del']);
    locale.bindKeyCode(47, ['help']);
    locale.bindKeyCode(145, ['scrolllock', 'scroll']);
    locale.bindKeyCode(188, ['comma', ',']);
    locale.bindKeyCode(190, ['period', '.']);
    locale.bindKeyCode(191, ['slash', 'forwardslash', '/']);
    locale.bindKeyCode(192, ['graveaccent', '`']);
    locale.bindKeyCode(219, ['openbracket', '[']);
    locale.bindKeyCode(220, ['backslash', '\\']);
    locale.bindKeyCode(221, ['closebracket', ']']);
    locale.bindKeyCode(222, ['apostrophe', '\'']);
    locale.bindKeyCode(48, ['zero', '0']);
    locale.bindKeyCode(49, ['one', '1']);
    locale.bindKeyCode(50, ['two', '2']);
    locale.bindKeyCode(51, ['three', '3']);
    locale.bindKeyCode(52, ['four', '4']);
    locale.bindKeyCode(53, ['five', '5']);
    locale.bindKeyCode(54, ['six', '6']);
    locale.bindKeyCode(55, ['seven', '7']);
    locale.bindKeyCode(56, ['eight', '8']);
    locale.bindKeyCode(57, ['nine', '9']);
    locale.bindKeyCode(96, ['numzero', 'num0']);
    locale.bindKeyCode(97, ['numone', 'num1']);
    locale.bindKeyCode(98, ['numtwo', 'num2']);
    locale.bindKeyCode(99, ['numthree', 'num3']);
    locale.bindKeyCode(100, ['numfour', 'num4']);
    locale.bindKeyCode(101, ['numfive', 'num5']);
    locale.bindKeyCode(102, ['numsix', 'num6']);
    locale.bindKeyCode(103, ['numseven', 'num7']);
    locale.bindKeyCode(104, ['numeight', 'num8']);
    locale.bindKeyCode(105, ['numnine', 'num9']);
    locale.bindKeyCode(106, ['nummultiply', 'num*']);
    locale.bindKeyCode(107, ['numadd', 'num+']);
    locale.bindKeyCode(108, ['numenter']);
    locale.bindKeyCode(109, ['numsubtract', 'num-']);
    locale.bindKeyCode(110, ['numdecimal', 'num.']);
    locale.bindKeyCode(111, ['numdivide', 'num/']);
    locale.bindKeyCode(144, ['numlock', 'num']);
    locale.bindKeyCode(112, ['f1']);
    locale.bindKeyCode(113, ['f2']);
    locale.bindKeyCode(114, ['f3']);
    locale.bindKeyCode(115, ['f4']);
    locale.bindKeyCode(116, ['f5']);
    locale.bindKeyCode(117, ['f6']);
    locale.bindKeyCode(118, ['f7']);
    locale.bindKeyCode(119, ['f8']);
    locale.bindKeyCode(120, ['f9']);
    locale.bindKeyCode(121, ['f10']);
    locale.bindKeyCode(122, ['f11']);
    locale.bindKeyCode(123, ['f12']);
    locale.bindKeyCode(124, ['f13']);
    locale.bindKeyCode(125, ['f14']);
    locale.bindKeyCode(126, ['f15']);
    locale.bindKeyCode(127, ['f16']);
    locale.bindKeyCode(128, ['f17']);
    locale.bindKeyCode(129, ['f18']);
    locale.bindKeyCode(130, ['f19']);
    locale.bindKeyCode(131, ['f20']);
    locale.bindKeyCode(132, ['f21']);
    locale.bindKeyCode(133, ['f22']);
    locale.bindKeyCode(134, ['f23']);
    locale.bindKeyCode(135, ['f24']);
    locale.bindMacro('shift + `', ['tilde', '~']);
    locale.bindMacro('shift + 1', ['exclamation', 'exclamationpoint', '!']);
    locale.bindMacro('shift + 2', ['at', '@']);
    locale.bindMacro('shift + 3', ['number', '#']);
    locale.bindMacro('shift + 4', ['dollar', 'dollars', 'dollarsign', '$']);
    locale.bindMacro('shift + 5', ['percent', '%']);
    locale.bindMacro('shift + 6', ['caret', '^']);
    locale.bindMacro('shift + 7', ['ampersand', 'and', '&']);
    locale.bindMacro('shift + 8', ['asterisk', '*']);
    locale.bindMacro('shift + 9', ['openparen', '(']);
    locale.bindMacro('shift + 0', ['closeparen', ')']);
    locale.bindMacro('shift + -', ['underscore', '_']);
    locale.bindMacro('shift + =', ['plus', '+']);
    locale.bindMacro('shift + [', ['opencurlybrace', 'opencurlybracket', '{']);
    locale.bindMacro('shift + ]', ['closecurlybrace', 'closecurlybracket', '}']);
    locale.bindMacro('shift + \\', ['verticalbar', '|']);
    locale.bindMacro('shift + ;', ['colon', ':']);
    locale.bindMacro('shift + \'', ['quotationmark', '\'']);
    locale.bindMacro('shift + !,', ['openanglebracket', '<']);
    locale.bindMacro('shift + .', ['closeanglebracket', '>']);
    locale.bindMacro('shift + /', ['questionmark', '?']);
    if (platform.match('Mac')) {
      locale.bindMacro('command', ['mod', 'modifier']);
    } else {
      locale.bindMacro('ctrl', ['mod', 'modifier']);
    }
    for (var keyCode = 65; keyCode <= 90; keyCode += 1) {
      var keyName = String.fromCharCode(keyCode + 32);
      var capitalKeyName = String.fromCharCode(keyCode);
      locale.bindKeyCode(keyCode, keyName);
      locale.bindMacro('shift + ' + keyName, capitalKeyName);
      locale.bindMacro('capslock + ' + keyName, capitalKeyName);
    }
    var semicolonKeyCode = userAgent.match('Firefox') ? 59 : 186;
    var dashKeyCode = userAgent.match('Firefox') ? 173 : 189;
    var equalKeyCode = userAgent.match('Firefox') ? 61 : 187;
    var leftCommandKeyCode;
    var rightCommandKeyCode;
    if (platform.match('Mac') && (userAgent.match('Safari') || userAgent.match('Chrome'))) {
      leftCommandKeyCode = 91;
      rightCommandKeyCode = 93;
    } else if (platform.match('Mac') && userAgent.match('Opera')) {
      leftCommandKeyCode = 17;
      rightCommandKeyCode = 17;
    } else if (platform.match('Mac') && userAgent.match('Firefox')) {
      leftCommandKeyCode = 224;
      rightCommandKeyCode = 224;
    }
    locale.bindKeyCode(semicolonKeyCode, ['semicolon', ';']);
    locale.bindKeyCode(dashKeyCode, ['dash', '-']);
    locale.bindKeyCode(equalKeyCode, ['equal', 'equalsign', '=']);
    locale.bindKeyCode(leftCommandKeyCode, ['command', 'windows', 'win', 'super', 'leftcommand', 'leftwindows', 'leftwin', 'leftsuper']);
    locale.bindKeyCode(rightCommandKeyCode, ['command', 'windows', 'win', 'super', 'rightcommand', 'rightwindows', 'rightwin', 'rightsuper']);
    locale.setKillKey('command');
  }
  var keyboard = new Keyboard();
  keyboard.setLocale('us', us);
  keyboard.Keyboard = Keyboard;
  keyboard.Locale = Locale;
  keyboard.KeyCombo = KeyCombo;
  return keyboard;
})));
});

const useKeyboardJs = (combination) => {
    const [state, set] = useState([false, null]);
    const [keyboardJs, setKeyboardJs] = useState(null);
    useMounted(() => {
        // import('keyboardjs').then((k) => setKeyboardJs(keyboardjs.default || keyboardjs));
        setKeyboardJs(keyboard);
    });
    useEffect(() => {
        if (!keyboardJs.value) {
            return;
        }
        const down = (event) => set([true, event]);
        const up = (event) => set([false, event]);
        keyboardJs.value.bind(combination, down, up, true);
        return () => {
            keyboardJs.value.unbind(combination, down, up);
        };
    }, sources([combination, keyboardJs]));
    return [computed(() => state.value[0]), computed(() => state.value[1])];
};

function useMounted(fn) {
    onMounted(() => {
        fn();
    });
}

const patchHistoryMethod = (method) => {
    const history = window.history;
    const original = history[method];
    history[method] = function (state) {
        const result = original.apply(this, arguments);
        const event = new Event(method.toLowerCase());
        event.state = state;
        window.dispatchEvent(event);
        return result;
    };
};
if (isBrowser) {
    patchHistoryMethod('pushState');
    patchHistoryMethod('replaceState');
}
const useLocationServer = () => ({
    trigger: 'load',
    length: 1,
});
const buildState = (trigger) => {
    const { state, length } = window.history;
    const { hash, host, hostname, href, origin, pathname, port, protocol, search } = window.location;
    return {
        trigger,
        state,
        length,
        hash,
        host,
        hostname,
        href,
        origin,
        pathname,
        port,
        protocol,
        search,
    };
};
const useLocationBrowser = () => {
    const [state, setState] = useComputedState(buildState('load'));
    useEffect(() => {
        const onPopstate = () => setState(buildState('popstate'));
        const onPushstate = () => setState(buildState('pushstate'));
        const onReplacestate = () => setState(buildState('replacestate'));
        on(window, 'popstate', onPopstate);
        on(window, 'pushstate', onPushstate);
        on(window, 'replacestate', onReplacestate);
        return () => {
            off(window, 'popstate', onPopstate);
            off(window, 'pushstate', onPushstate);
            off(window, 'replacestate', onReplacestate);
        };
    }, []);
    return state;
};
const hasEventConstructor = typeof Event === 'function';
var useLocation = isBrowser && hasEventConstructor ? useLocationBrowser : useLocationServer;

const isTouchEvent = (ev) => {
    return 'touches' in ev;
};
const preventDefault$1 = (ev) => {
    if (!isTouchEvent(ev))
        return;
    if (ev.touches.length < 2 && ev.preventDefault) {
        ev.preventDefault();
    }
};
const useLongPress = (callback, options = { isPreventDefault: true, delay: 300 }) => {
    const timeout = ref();
    const target = ref();
    const start = (event) => {
        // prevent ghost click on mobile devices
        if (unref(options.isPreventDefault) && event.target) {
            on(event.target, 'touchend', preventDefault$1, { passive: false });
            target.value = event.target;
        }
        timeout.value = setTimeout(() => unref(callback)(event), unref(options.delay));
    };
    const clear = () => {
        // clearTimeout and removeEventListener
        timeout.value && clearTimeout(timeout.value);
        if (unref(options.isPreventDefault) && target.value) {
            off(target.value, 'touchend', preventDefault$1);
        }
    };
    return {
        onMousedown: (e) => start(e),
        onTouchstart: (e) => start(e),
        onMouseup: clear,
        onMouseleave: clear,
        onTouchend: clear,
    };
};

var react = function equal(a, b) {
  if (a === b) return true;
  if (a && b && typeof a == 'object' && typeof b == 'object') {
    if (a.constructor !== b.constructor) return false;
    var length, i, keys;
    if (Array.isArray(a)) {
      length = a.length;
      if (length != b.length) return false;
      for (i = length; i-- !== 0;)
        if (!equal(a[i], b[i])) return false;
      return true;
    }
    if (a.constructor === RegExp) return a.source === b.source && a.flags === b.flags;
    if (a.valueOf !== Object.prototype.valueOf) return a.valueOf() === b.valueOf();
    if (a.toString !== Object.prototype.toString) return a.toString() === b.toString();
    keys = Object.keys(a);
    length = keys.length;
    if (length !== Object.keys(b).length) return false;
    for (i = length; i-- !== 0;)
      if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false;
    for (i = length; i-- !== 0;) {
      var key = keys[i];
      if (key === '_owner' && a.$$typeof) {
        continue;
      }
      if (!equal(a[key], b[key])) return false;
    }
    return true;
  }
  return a!==a && b!==b;
};

const nav$1 = isNavigator ? navigator : undefined;
const isBatteryApiSupported = nav$1 && typeof nav$1.getBattery === 'function';
function useBatteryMock() {
    return { isSupported: false };
}
function useBattery() {
    const [state, setState] = useReadonly({ isSupported: true, fetched: false });
    useEffect(() => {
        let isMounted = true;
        let battery = null;
        const handleChange = () => {
            if (!isMounted || !battery) {
                return;
            }
            const newState = {
                isSupported: true,
                fetched: true,
                level: battery.level,
                charging: battery.charging,
                dischargingTime: battery.dischargingTime,
                chargingTime: battery.chargingTime,
            };
            !react(state, newState) && setState(newState);
        };
        nav$1.getBattery().then((bat) => {
            if (!isMounted) {
                return;
            }
            battery = bat;
            on(battery, 'chargingchange', handleChange);
            on(battery, 'chargingtimechange', handleChange);
            on(battery, 'dischargingtimechange', handleChange);
            on(battery, 'levelchange', handleChange);
            handleChange();
        });
        return () => {
            isMounted = false;
            if (battery) {
                off(battery, 'chargingchange', handleChange);
                off(battery, 'chargingtimechange', handleChange);
                off(battery, 'dischargingtimechange', handleChange);
                off(battery, 'levelchange', handleChange);
            }
        };
    }, []);
    return state;
}
var useBattery$1 = isBatteryApiSupported ? useBattery : useBatteryMock;

function useReactive(initialState = {}) {
    const state = isReactive(initialState) ? initialState : (initialState instanceof Function ? reactive(initialState()) : reactive(initialState));
    const setState = (patch) => {
        Object.assign(state, resolveHookState(patch, toRaw(state)));
    };
    return [state, setState];
}

function useReadonly(initialState = {}) {
    const [state, setState] = useReactive(initialState);
    return [readonly(state), setState];
}

function useMediatedState(mediator, initialState) {
    const mediatorFn = ref(mediator);
    const [state, setMediatedState] = useState(initialState);
    const setState = (newState) => {
        if (mediatorFn.value.length === 2) {
            mediatorFn.value(newState, setMediatedState);
        }
        else {
            setMediatedState(mediatorFn.value(newState));
        }
    };
    watch(state, (newState) => {
        if (mediatorFn.value.length === 2) {
            mediatorFn.value(newState, setMediatedState);
        }
        else {
            setMediatedState(mediatorFn.value(newState));
        }
    });
    return [state, setState];
}

function useReducer(reducer, initialState, initializer) {
    if (initializer) {
        initialState = initializer(resolveHookState(initialState));
    }
    const [state, setState] = useState(initialState);
    const dispatch = (action) => {
        setState(prevState => reducer(prevState, action));
    };
    return [computed(() => {
            return state.value;
        }), dispatch];
}

const useMethods = (createMethods, initialState) => {
    const reducer = (reducerState, action) => {
        return createMethods(reducerState)[action.type](...action.payload);
    };
    const [state, dispatch] = useReducer(reducer, initialState);
    const wrappedMethods = (() => {
        const actionTypes = Object.keys(createMethods(initialState));
        return actionTypes.reduce((acc, type) => {
            acc[type] = (...payload) => dispatch({ type, payload });
            return acc;
        }, {});
    })();
    return [state, wrappedMethods];
};

const useSlider = (ref$1, options = {}) => {
    const isMounted = useMountedState();
    const isSliding = ref(false);
    const valueRef = ref(0);
    const frame = ref(0);
    const [state, setState] = useReactive({
        isSliding: false,
        value: 0,
    });
    valueRef.value = state.value;
    useEffect(() => {
        if (!isBrowser) {
            return;
        }
        const reverse = toRaw(options.reverse) === undefined ? false : toRaw(options.reverse);
        if (ref$1.value) {
            ref$1.value.style.userSelect = 'none';
        }
        const startScrubbing = () => {
            if (!isSliding.value && isMounted()) {
                (options.onScrubStart || noop)();
                isSliding.value = true;
                setState({ isSliding: true });
                bindEvents();
            }
        };
        const stopScrubbing = () => {
            if (isSliding.value && isMounted()) {
                (options.onScrubStop || noop)(valueRef.value);
                isSliding.value = false;
                setState({ isSliding: false });
                unbindEvents();
            }
        };
        const onMouseDown = (event) => {
            startScrubbing();
            onMouseMove(event);
        };
        const onMouseMove = toRaw(options.vertical)
            ? (event) => onScrub(event.clientY)
            : (event) => onScrub(event.clientX);
        const onTouchStart = (event) => {
            startScrubbing();
            onTouchMove(event);
        };
        const onTouchMove = toRaw(options.vertical)
            ? (event) => onScrub(event.changedTouches[0].clientY)
            : (event) => onScrub(event.changedTouches[0].clientX);
        const bindEvents = () => {
            on(document, 'mousemove', onMouseMove);
            on(document, 'mouseup', stopScrubbing);
            on(document, 'touchmove', onTouchMove);
            on(document, 'touchend', stopScrubbing);
        };
        const unbindEvents = () => {
            off(document, 'mousemove', onMouseMove);
            off(document, 'mouseup', stopScrubbing);
            off(document, 'touchmove', onTouchMove);
            off(document, 'touchend', stopScrubbing);
        };
        const onScrub = (clientXY) => {
            cancelAnimationFrame(frame.value);
            frame.value = requestAnimationFrame(() => {
                if (isMounted() && ref$1.value) {
                    const rect = ref$1.value.getBoundingClientRect();
                    const pos = toRaw(options.vertical) ? rect.top : rect.left;
                    const length = toRaw(options.vertical) ? rect.height : rect.width;
                    // Prevent returning 0 when element is hidden by CSS
                    if (!length) {
                        return;
                    }
                    let value = (clientXY - pos) / length;
                    if (value > 1) {
                        value = 1;
                    }
                    else if (value < 0) {
                        value = 0;
                    }
                    if (reverse) {
                        value = 1 - value;
                    }
                    setState({
                        value,
                    });
                    (options.onScrub || noop)(value);
                }
            });
        };
        on(ref$1.value, 'mousedown', onMouseDown);
        on(ref$1.value, 'touchstart', onTouchStart);
        return () => {
            off(ref$1.value, 'mousedown', onMouseDown);
            off(ref$1.value, 'touchstart', onTouchStart);
        };
    }, sources([ref$1, options.vertical]));
    return state;
};

function useDebounce(fn, ms = 0, deps = []) {
    const [isReady, cancel, reset] = useTimeoutFn(fn, ms);
    useEffect(reset, sources(deps));
    return [isReady, cancel];
}

const useFavicon = (href) => {
    useEffect(() => {
        const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
        link.type = 'image/x-icon';
        link.rel = 'shortcut icon';
        link.href = unref(href);
        document.getElementsByTagName('head')[0].appendChild(link);
    }, sources([href]));
};

function useLocalStorage(key, initialValue, options) {
    if (!isBrowser) {
        return [computed(() => unref(initialValue)), noop, noop];
    }
    if (!key) {
        throw new Error('useLocalStorage key may not be falsy');
    }
    const deserializer = options
        ? options.raw
            ? (value) => value
            : options.deserializer
        : JSON.parse;
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [state, setState] = useState(() => {
        try {
            const serializer = options ? (options.raw ? String : options.serializer) : JSON.stringify;
            const localStorageValue = localStorage.getItem(key);
            if (localStorageValue !== null) {
                return deserializer(localStorageValue);
            }
            else {
                initialValue && localStorage.setItem(key, serializer(initialValue));
                return initialValue;
            }
        }
        catch (_a) {
            // If user is in private mode or has storage restriction
            // localStorage can throw. JSON.parse and JSON.stringify
            // can throw, too.
            return initialValue;
        }
    });
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const set = (valOrFunc) => {
        try {
            const newState = typeof valOrFunc === 'function' ? valOrFunc(state) : valOrFunc;
            if (typeof newState === 'undefined') {
                return;
            }
            let value;
            if (options)
                if (options.raw) {
                    if (typeof newState === 'string') {
                        value = newState;
                    }
                    else {
                        value = JSON.stringify(newState);
                    }
                }
                else if (options.serializer) {
                    value = options.serializer(newState);
                }
                else {
                    value = JSON.stringify(newState);
                }
            else {
                value = JSON.stringify(newState);
            }
            localStorage.setItem(key, value);
            setState(deserializer(value));
        }
        catch (_a) {
            // If user is in private mode or has storage restriction
            // localStorage can throw. Also JSON.stringify can throw.
        }
    };
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const remove = () => {
        try {
            localStorage.removeItem(key);
            setState(undefined);
        }
        catch (_a) {
            // If user is in private mode or has storage restriction
            // localStorage can throw.
        }
    };
    return [computed(() => state.value), set, remove];
}

function getClosestBody(el) {
    if (!el) {
        return null;
    }
    else if (el.tagName === 'BODY') {
        return el;
    }
    else if (el.tagName === 'IFRAME') {
        const document = el.contentDocument;
        return document ? document.body : null;
    }
    else if (!el.offsetParent) {
        return null;
    }
    return getClosestBody(el.offsetParent);
}
function preventDefault(rawEvent) {
    const e = rawEvent || window.event;
    // Do not prevent if the event has more than one touch (usually meaning this is a multi touch gesture like pinch to zoom).
    if (e.touches.length > 1)
        return true;
    if (e.preventDefault)
        e.preventDefault();
    return false;
}
const isIosDevice = isBrowser &&
    window.navigator &&
    window.navigator.platform &&
    /iP(ad|hone|od)/.test(window.navigator.platform);
const bodies = new Map();
const doc = typeof document === 'object' ? document : undefined;
let documentListenerAdded = false;
var useLockBodyScroll = !doc
    ? function useLockBodyMock(_locked = true, _elementRef) {
    }
    : function useLockBody(locked = true, elementRef) {
        const bodyRef = ref(doc.body);
        elementRef = elementRef || bodyRef;
        const lock = (body) => {
            const bodyInfo = bodies.get(body);
            if (!bodyInfo) {
                bodies.set(body, { counter: 1, initialOverflow: body.style.overflow });
                if (isIosDevice) {
                    if (!documentListenerAdded) {
                        on(document, 'touchmove', preventDefault, { passive: false });
                        documentListenerAdded = true;
                    }
                }
                else {
                    body.style.overflow = 'hidden';
                }
            }
            else {
                bodies.set(body, {
                    counter: bodyInfo.counter + 1,
                    initialOverflow: bodyInfo.initialOverflow,
                });
            }
        };
        const unlock = (body) => {
            const bodyInfo = bodies.get(body);
            if (bodyInfo) {
                if (bodyInfo.counter === 1) {
                    bodies.delete(body);
                    if (isIosDevice) {
                        body.ontouchmove = null;
                        if (documentListenerAdded) {
                            off(document, 'touchmove', preventDefault);
                            documentListenerAdded = false;
                        }
                    }
                    else {
                        body.style.overflow = bodyInfo.initialOverflow;
                    }
                }
                else {
                    bodies.set(body, {
                        counter: bodyInfo.counter - 1,
                        initialOverflow: bodyInfo.initialOverflow,
                    });
                }
            }
        };
        useEffect(() => {
            const body = getClosestBody(elementRef.value);
            if (!body) {
                return;
            }
            if (unref(locked)) {
                lock(body);
            }
            else {
                unlock(body);
            }
        }, sources([locked, elementRef]));
        // clean up, on un-mount
        useEffect(() => {
            const body = getClosestBody(elementRef.value);
            if (!body) {
                return;
            }
            return () => {
                unlock(body);
            };
        });
    };

const usePermission = (permissionDesc) => {
    let mounted = true;
    let permissionStatus = null;
    const [state, setState] = useState('');
    const onChange = () => {
        if (mounted && permissionStatus) {
            setState(permissionStatus.state);
        }
    };
    const changeState = () => {
        onChange();
        on(permissionStatus, 'change', onChange);
    };
    useEffect(() => {
        navigator.permissions
            .query(permissionDesc)
            .then((status) => {
            permissionStatus = status;
            changeState();
        })
            .catch(noop);
        return () => {
            mounted = false;
            permissionStatus && off(permissionStatus, 'change', onChange);
        };
    });
    return state;
};

// https://developer.mozilla.org/zh-CN/docs/Web/API/Window/requestAnimationFrame
function useRafLoop(callback, initiallyActive = true) {
    const raf = ref(null);
    const rafActivity = ref(false);
    const rafCallback = ref(callback);
    rafCallback.value = callback;
    const step = (time) => {
        if (rafActivity.value) {
            rafCallback.value(time);
            raf.value = requestAnimationFrame(step);
        }
    };
    const stop = () => {
        if (rafActivity.value) {
            rafActivity.value = false;
            raf.value && cancelAnimationFrame(raf.value);
        }
    };
    const start = () => {
        if (!rafActivity.value) {
            rafActivity.value = true;
            raf.value = requestAnimationFrame(step);
        }
    };
    const isActive = computed(() => {
        return rafActivity.value;
    });
    useEffect(() => {
        if (initiallyActive) {
            start();
        }
        return stop;
    });
    return [stop, start, isActive];
}

const useSessionStorage = (key, initialValue, raw) => {
    if (!isBrowser) {
        return [ref(initialValue), () => {
                //
            }];
    }
    const [state, setState] = useState(() => {
        try {
            const sessionStorageValue = sessionStorage.getItem(key);
            if (typeof sessionStorageValue !== 'string') {
                sessionStorage.setItem(key, raw ? String(initialValue) : JSON.stringify(initialValue));
                return initialValue;
            }
            else {
                return raw ? sessionStorageValue : JSON.parse(sessionStorageValue || 'null');
            }
        }
        catch (_a) {
            // If user is in private mode or has storage restriction
            // sessionStorage can throw. JSON.parse and JSON.stringify
            // cat throw, too.
            return initialValue;
        }
    });
    watch(state, () => {
        try {
            const serializedState = raw ? String(state.value) : JSON.stringify(state.value);
            sessionStorage.setItem(key, serializedState);
        }
        catch (_a) {
            // If user is in private mode or has storage restriction
            // sessionStorage can throw. Also JSON.stringify can throw.
        }
    });
    return [state, setState];
};

const useThrottleFn = (fn, ms = 200, args) => {
    const [state, setState] = useState(null);
    const timeout = ref();
    const nextArgs = ref();
    useEffect(() => {
        if (!timeout.value) {
            setState(fn(...args));
            const timeoutCallback = () => {
                if (nextArgs.value) {
                    setState(fn(...nextArgs.value));
                    nextArgs.value = undefined;
                    timeout.value = setTimeout(timeoutCallback, ms);
                }
                else {
                    timeout.value = undefined;
                }
            };
            timeout.value = setTimeout(timeoutCallback, ms);
        }
        else {
            nextArgs.value = args;
        }
    }, sources(args));
    onUnmounted(() => {
        timeout.value && clearTimeout(timeout.value);
    });
    return state;
};

const useThrottle = (value, ms = 200) => {
    const [state, setState] = useState(isRef(value) ? unref(value) : value);
    const timeout = ref();
    const nextValue = ref(null);
    const hasNextValue = ref(0);
    useEffect(() => {
        if (!timeout.value) {
            setState(value);
            const timeoutCallback = () => {
                if (hasNextValue.value) {
                    hasNextValue.value = false;
                    setState(nextValue.value);
                    timeout.value = setTimeout(timeoutCallback, ms);
                }
                else {
                    timeout.value = undefined;
                }
            };
            timeout.value = setTimeout(timeoutCallback, ms);
        }
        else {
            nextValue.value = unref(value);
            hasNextValue.value = true;
        }
    }, sources([value]));
    onUnmounted(() => {
        timeout.value && clearTimeout(timeout.value);
    });
    return state;
};

function useCounter(initialValue = 0, max = null, min = null) {
    let init = isRef(initialValue) ? initialValue : ref(resolveHookState(initialValue));
    if (typeof init.value !== 'number') {
        console.error('initialValue has to be a number, got ' + typeof initialValue);
    }
    const minRef = ref(min);
    const maxRef = ref(max);
    if (typeof minRef.value === 'number') {
        init.value = Math.max(init.value, minRef.value);
    }
    else if (minRef.value !== null) {
        console.error('min has to be a number, got ' + typeof minRef.value);
    }
    if (typeof maxRef.value === 'number') {
        init.value = Math.min(init.value, maxRef.value);
    }
    else if (maxRef.value !== null) {
        console.error('max has to be a number, got ' + typeof maxRef.value);
    }
    const [current, setInternal] = useState(init.value);
    const get = () => {
        return current.value;
    };
    const set = (newState) => {
        const prevState = get();
        let rState = resolveHookState(newState, prevState);
        if (prevState !== rState) {
            if (typeof minRef.value === 'number') {
                rState = Math.max(rState, minRef.value);
            }
            if (typeof maxRef.value === 'number') {
                rState = Math.min(rState, maxRef.value);
            }
            prevState !== rState && setInternal(rState);
        }
    };
    return [
        computed(() => {
            return current.value;
        }),
        {
            get,
            set,
            inc: (delta = 1) => {
                const rDelta = resolveHookState(delta, get());
                if (typeof rDelta !== 'number') {
                    console.error('delta has to be a number or function returning a number, got ' + typeof rDelta);
                }
                set((num) => num + rDelta);
            },
            dec: (delta = 1) => {
                const rDelta = resolveHookState(delta, get());
                if (typeof rDelta !== 'number') {
                    console.error('delta has to be a number or function returning a number, got ' + typeof rDelta);
                }
                set((num) => num - rDelta);
            },
            reset: (value = initialValue) => {
                const rValue = isRef(value) ? value.value : resolveHookState(value, get());
                if (typeof rValue !== 'number') {
                    console.error('value has to be a number or function returning a number, got ' + typeof rValue);
                }
                // eslint-disable-next-line react-hooks/exhaustive-deps
                init.value = rValue;
                set(rValue);
            },
        },
    ];
}

const DEFAULT_USE_TITLE_OPTIONS = {
    restoreOnUnmount: false,
};
function useTitle(title, options = DEFAULT_USE_TITLE_OPTIONS) {
    const prevTitleRef = ref(document.title);
    document.title = title;
    useEffect(() => {
        if (options && options.restoreOnUnmount) {
            return () => {
                document.title = prevTitleRef.value;
            };
        }
        else {
            return;
        }
    });
}
var useTitle$1 = typeof document !== 'undefined' ? useTitle : (_title) => { };

function useRaf(ms = 1e12, delay = 0) {
    const [elapsed, set] = useState(0);
    useEffect(() => {
        let raf;
        let timerStop;
        let start;
        const onFrame = () => {
            const time = Math.min(1, (Date.now() - start) / unref(ms));
            set(time);
            loop();
        };
        const loop = () => {
            raf = requestAnimationFrame(onFrame);
        };
        const onStart = () => {
            timerStop = setTimeout(() => {
                cancelAnimationFrame(raf);
                set(1);
            }, unref(ms));
            start = Date.now();
            loop();
        };
        const timerDelay = setTimeout(onStart, unref(delay));
        return () => {
            clearTimeout(timerStop);
            clearTimeout(timerDelay);
            cancelAnimationFrame(raf);
        };
    }, sources([ms, delay]));
    return computed(() => {
        return elapsed.value;
    });
}

var KEBAB_REGEX = /[A-Z]/g;
var hash = function (str) {
    var h = 5381, i = str.length;
    while (i) h = (h * 33) ^ str.charCodeAt(--i);
    return '_' + (h >>> 0).toString(36);
};
var create = function (config) {
    config = config || {};
    var assign = config.assign || Object.assign;
    var client = typeof window === 'object';
    if (process.env.NODE_ENV !== 'production') {
        if (client) {
            if ((typeof document !== 'object') || !document.getElementsByTagName('HTML')) {
                console.error(
                    'nano-css detected browser environment because of "window" global, but ' +
                    '"document" global seems to be defective.'
                );
            }
        }
    }
    var renderer = assign({
        raw: '',
        pfx: '_',
        client: client,
        assign: assign,
        stringify: JSON.stringify,
        kebab: function (prop) {
            return prop.replace(KEBAB_REGEX, '-$&').toLowerCase();
        },
        decl: function (key, value) {
            key = renderer.kebab(key);
            return key + ':' + value + ';';
        },
        hash: function (obj) {
            return hash(renderer.stringify(obj));
        },
        selector: function (parent, selector) {
            return parent + (selector[0] === ':' ? ''  : ' ') + selector;
        },
        putRaw: function (rawCssRule) {
            renderer.raw += rawCssRule;
        },
    }, config);
    if (renderer.client) {
        if (!renderer.sh)
            document.head.appendChild(renderer.sh = document.createElement('style'));
        if (process.env.NODE_ENV !== 'production') {
            renderer.sh.setAttribute('data-nano-css-dev', '');
            renderer.shTest = document.createElement('style');
            renderer.shTest.setAttribute('data-nano-css-dev-tests', '');
            document.head.appendChild(renderer.shTest);
        }
        renderer.putRaw = function (rawCssRule) {
            if (process.env.NODE_ENV === 'production') {
                var sheet = renderer.sh.sheet;
                try {
                    sheet.insertRule(rawCssRule, sheet.cssRules.length);
                } catch (error) {}
            } else {
                try {
                    renderer.shTest.sheet.insertRule(rawCssRule, renderer.shTest.sheet.cssRules.length);
                } catch (error) {
                    if (config.verbose) {
                        console.error(error);
                    }
                }
                renderer.sh.appendChild(document.createTextNode(rawCssRule));
            }
        };
    }
    renderer.put = function (selector, decls, atrule) {
        var str = '';
        var prop, value;
        var postponed = [];
        for (prop in decls) {
            value = decls[prop];
            if ((value instanceof Object) && !(value instanceof Array)) {
                postponed.push(prop);
            } else {
                if ((process.env.NODE_ENV !== 'production') && !renderer.sourcemaps) {
                    str += '    ' + renderer.decl(prop, value, selector, atrule) + '\n';
                } else {
                    str += renderer.decl(prop, value, selector, atrule);
                }
            }
        }
        if (str) {
            if ((process.env.NODE_ENV !== 'production') && !renderer.sourcemaps) {
                str = '\n' + selector + ' {\n' + str + '}\n';
            } else {
                str = selector + '{' + str + '}';
            }
            renderer.putRaw(atrule ? atrule + '{' + str + '}' : str);
        }
        for (var i = 0; i < postponed.length; i++) {
            prop = postponed[i];
            if (prop[0] === '@' && prop !== '@font-face') {
                renderer.putAt(selector, decls[prop], prop);
            } else {
                renderer.put(renderer.selector(selector, prop), decls[prop], atrule);
            }
        }
    };
    renderer.putAt = renderer.put;
    return renderer;
};

var pkgName = 'nano-css';
var warnOnMissingDependencies = function warnOnMissingDependencies (addon, renderer, deps) {
    var missing = [];
    for (var i = 0; i < deps.length; i++) {
        var name = deps[i];
        if (!renderer[name]) {
            missing.push(name);
        }
    }
    if (missing.length) {
        var str = 'Addon "' + addon + '" is missing the following dependencies:';
        for (var j = 0; j < missing.length; j++) {
            str += '\n require("' + pkgName + '/addon/' + missing[j] + '").addon(nano);';
        }
        throw new Error(str);
    }
};

var addon$1 = function (renderer) {
    if (!renderer.client) return;
    if (process.env.NODE_ENV !== 'production') {
        warnOnMissingDependencies('cssom', renderer, ['sh']);
    }
    document.head.appendChild(renderer.msh = document.createElement('style'));
    renderer.createRule = function (selector, prelude) {
        var rawCss = selector + '{}';
        if (prelude) rawCss = prelude + '{' + rawCss + '}';
        var sheet = prelude ? renderer.msh.sheet : renderer.sh.sheet;
        var index = sheet.insertRule(rawCss, sheet.cssRules.length);
        var rule = (sheet.cssRules || sheet.rules)[index];
        rule.index = index;
        if (prelude) {
            var selectorRule = (rule.cssRules || rule.rules)[0];
            rule.style = selectorRule.style;
            rule.styleMap = selectorRule.styleMap;
        }
        return rule;
    };
};

function removeRule$1 (rule) {
    var maxIndex = rule.index;
    var sh = rule.parentStyleSheet;
    var rules = sh.cssRules || sh.rules;
    maxIndex = Math.max(maxIndex, rules.length - 1);
    while (maxIndex >= 0) {
        if (rules[maxIndex] === rule) {
            sh.deleteRule(maxIndex);
            break;
        }
        maxIndex--;
    }
}
var removeRule_2 = removeRule$1;
var removeRule_1 = {
	removeRule: removeRule_2
};

var removeRule = removeRule_1.removeRule;
var addon = function (renderer) {
    if (!renderer.client) return;
    if (process.env.NODE_ENV !== 'production') {
        warnOnMissingDependencies('cssom', renderer, ['createRule']);
    }
    var kebab = renderer.kebab;
    function VRule (selector, prelude) {
        this.rule = renderer.createRule(selector, prelude);
        this.decl = {};
    }
    VRule.prototype.diff = function (newDecl) {
        var oldDecl = this.decl;
        var style = this.rule.style;
        var property;
        for (property in oldDecl)
            if (newDecl[property] === undefined)
                style.removeProperty(property);
        for (property in newDecl)
            if (newDecl[property] !== oldDecl[property])
                style.setProperty(kebab(property), newDecl[property]);
        this.decl = newDecl;
    };
    VRule.prototype.del = function () {
        removeRule(this.rule);
    };
    function VSheet () {
        this.tree = {};
    }
    VSheet.prototype.diff = function (newTree) {
        var oldTree = this.tree;
        for (var prelude in oldTree) {
            if (newTree[prelude] === undefined) {
                var rules = oldTree[prelude];
                for (var selector in rules)
                    rules[selector].del();
            }
        }
        for (var prelude in newTree) {
            if (oldTree[prelude] === undefined) {
                for (var selector in newTree[prelude]) {
                    var rule = new VRule(selector, prelude);
                    rule.diff(newTree[prelude][selector]);
                    newTree[prelude][selector] = rule;
                }
            } else {
                var oldRules = oldTree[prelude];
                var newRules = newTree[prelude];
                for (var selector in oldRules)
                    if (!newRules[selector])
                        oldRules[selector].del();
                for (var selector in newRules) {
                    var rule = oldRules[selector];
                    if (rule) {
                        rule.diff(newRules[selector]);
                        newRules[selector] = rule;
                    } else {
                        rule = new VRule(selector, prelude);
                        rule.diff(newRules[selector]);
                        newRules[selector] = rule;
                    }
                }
            }
        }
        this.tree = newTree;
    };
    renderer.VRule = VRule;
    renderer.VSheet = VSheet;
};

function cssToTree (tree, css, selector, prelude) {
    var declarations = {};
    var hasDeclarations = false;
    var key, value;
    for (key in css) {
        value = css[key];
        if (typeof value !== 'object') {
            hasDeclarations = true;
            declarations[key] = value;
        }
    }
    if (hasDeclarations) {
        if (!tree[prelude]) tree[prelude] = {};
        tree[prelude][selector] = declarations;
    }
    for (key in css) {
        value = css[key];
        if (typeof value === 'object') {
            if (key[0] === '@') {
                cssToTree(tree, value, selector, key);
            } else {
                var hasCurrentSymbol = key.indexOf('&') > -1;
                var selectorParts = selector.split(',');
                if (hasCurrentSymbol) {
                    for (var i = 0; i < selectorParts.length; i++) {
                        selectorParts[i] = key.replace(/&/g, selectorParts[i]);
                    }
                } else {
                    for (var i = 0; i < selectorParts.length; i++) {
                        selectorParts[i] = selectorParts[i] + ' ' + key;
                    }
                }
                cssToTree(tree, value, selectorParts.join(','), prelude);
            }
        }
    }
}var cssToTree_2 = cssToTree;

const nano = create();
addon$1(nano);
addon(nano);
let counter = 0;
function useCss(css) {
    const className = 'vue-next-use-css-' + (counter++).toString(36);
    const sheet = new nano.VSheet();
    useEffect(() => {
        const tree = {};
        cssToTree_2(tree, unref(css), '.' + className, '');
        sheet.diff(tree);
        return () => {
            sheet.diff({});
        };
    }, isRef(css) ? css : null);
    return className;
}

var easing = {
    linear: function (t) { return t; },
    quadratic: function (t) { return t * (-(t * t) * t + 4 * t * t - 6 * t + 4); },
    cubic: function (t) { return t * (4 * t * t - 9 * t + 6); },
    elastic: function (t) { return t * (33 * t * t * t * t - 106 * t * t * t + 126 * t * t - 67 * t + 15); },
    inQuad: function (t) { return t * t; },
    outQuad: function (t) { return t * (2 - t); },
    inOutQuad: function (t) { return t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t; },
    inCubic: function (t) { return t * t * t; },
    outCubic: function (t) { return (--t) * t * t + 1; },
    inOutCubic: function (t) { return t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1; },
    inQuart: function (t) { return t * t * t * t; },
    outQuart: function (t) { return 1 - (--t) * t * t * t; },
    inOutQuart: function (t) { return t < .5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t; },
    inQuint: function (t) { return t * t * t * t * t; },
    outQuint: function (t) { return 1 + (--t) * t * t * t * t; },
    inOutQuint: function (t) { return t < .5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t; },
    inSine: function (t) { return -Math.cos(t * (Math.PI / 2)) + 1; },
    outSine: function (t) { return Math.sin(t * (Math.PI / 2)); },
    inOutSine: function (t) { return -(Math.cos(Math.PI * t) - 1) / 2; },
    inExpo: function (t) { return Math.pow(2, 10 * (t - 1)); },
    outExpo: function (t) { return -Math.pow(2, -10 * t) + 1; },
    inOutExpo: function (t) {
        t /= .5;
        if (t < 1)
            return Math.pow(2, 10 * (t - 1)) / 2;
        t--;
        return (-Math.pow(2, -10 * t) + 2) / 2;
    },
    inCirc: function (t) { return -Math.sqrt(1 - t * t) + 1; },
    outCirc: function (t) { return Math.sqrt(1 - (t = t - 1) * t); },
    inOutCirc: function (t) {
        t /= .5;
        if (t < 1)
            return -(Math.sqrt(1 - t * t) - 1) / 2;
        t -= 2;
        return (Math.sqrt(1 - t * t) + 1) / 2;
    }
};
Object.defineProperty({
	easing: easing
}, '__esModule', {value: true});

const useTween = (easingName = 'inCirc', ms = 200, delay = 0) => {
    const fn = easing[easingName];
    const t = useRaf(ms, delay);
    if (process.env.NODE_ENV !== 'production') {
        if (typeof fn !== 'function') {
            console.error('useTween() expected "easingName" property to be a valid easing function name, like:' +
                '"' +
                Object.keys(easing).join('", "') +
                '".');
            console.trace();
            return computed(() => 0);
        }
    }
    return computed(() => {
        return fn(t.value);
    });
};

function createGlobalState(initialState) {
    const store = {
        state: initialState instanceof Function ? initialState() : initialState,
        setState(nextState) {
            store.state = resolveHookState(nextState, store.state);
            store.setters.forEach((setter) => setter(store.state));
        },
        setters: [],
    };
    return () => {
        const [globalState, stateSetter] = useState(store.state);
        useEffect(() => () => {
            store.setters = store.setters.filter((setter) => setter !== stateSetter);
        });
        useEffect(() => {
            if (!store.setters.includes(stateSetter)) {
                store.setters.push(stateSetter);
            }
        });
        return [globalState, store.setState];
    };
}

function useDefault(defaultValue, initialValue) {
    const [value, setValue] = useState(resolveHookState(initialValue));
    watch(value, (newValue) => {
        if (newValue === undefined || newValue === null) {
            setValue(defaultValue);
        }
    }, {
        immediate: true
    });
    return [value, setValue];
}

function useRafState(initialState) {
    const frame = ref(0);
    const [state, setState] = useState(initialState);
    const setRafState = (value) => {
        cancelAnimationFrame(frame.value);
        frame.value = requestAnimationFrame(() => {
            setState(value);
        });
    };
    onUnmounted(() => {
        cancelAnimationFrame(frame.value);
    });
    return [state, setRafState];
}

function useRafReactive(initialState) {
    const frame = ref(0);
    const [state, setState] = useReactive(initialState);
    const setRafState = (value) => {
        cancelAnimationFrame(frame.value);
        frame.value = requestAnimationFrame(() => {
            setState(value);
        });
    };
    onUnmounted(() => {
        cancelAnimationFrame(frame.value);
    });
    return [state, setRafState];
}

function useStateList(stateSet = []) {
    const isMounted = useMountedState();
    const index = ref(0);
    // If new state list is shorter that before - switch to the last element
    useEffect(() => {
        if (unref(stateSet).length <= index.value) {
            index.value = unref(stateSet).length - 1;
        }
    }, computed(() => {
        return unref(stateSet).length;
    }));
    const actions = {
        next: () => actions.setStateAt(index.value + 1),
        prev: () => actions.setStateAt(index.value - 1),
        setStateAt: (newIndex) => {
            // do nothing on unmounted component
            if (!isMounted())
                return;
            // do nothing on empty states list
            if (!unref(stateSet).length)
                return;
            // in case new index is equal current - do nothing
            if (newIndex === index.value)
                return;
            // it gives the ability to travel through the left and right borders.
            // 4ex: if list contains 5 elements, attempt to set index 9 will bring use to 5th element
            // in case of negative index it will start counting from the right, so -17 will bring us to 4th element
            index.value =
                newIndex >= 0
                    ? newIndex % unref(stateSet).length
                    : unref(stateSet).length + (newIndex % unref(stateSet).length);
        },
        setState: (state) => {
            // do nothing on unmounted component
            if (!isMounted())
                return;
            const newIndex = unref(stateSet).length ? unref(stateSet).indexOf(state) : -1;
            if (newIndex === -1) {
                throw new Error(`State '${state}' is not a valid state (does not exist in state list)`);
            }
            index.value = newIndex;
        },
    };
    return Object.assign({ state: computed(() => {
            return unref(stateSet)[index.value];
        }), currentIndex: index.value }, actions);
}

function useMultiStateValidator(states, validator, initialValidity = [undefined]) {
    if (typeof states !== 'object') {
        throw new Error('states expected to be an object or array, got ' + typeof states);
    }
    const validatorInner = ref(validator);
    const statesInner = ref(states);
    validatorInner.value = validator;
    statesInner.value = states;
    const [validity, setValidity] = useReadonly(initialValidity);
    const validate = () => {
        if (validatorInner.value.length >= 2) {
            validatorInner.value(statesInner.value.map(item => unref(item)), setValidity);
        }
        else {
            setValidity(validatorInner.value(statesInner.value.map(item => unref(item))));
        }
    };
    useEffect(() => {
        validate();
    }, Object.values(states));
    return [validity, validate];
}

const defaultState$2 = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
};
function useMeasure() {
    const [element, ref] = useState(null);
    const [rect, setRect] = useReadonly(defaultState$2);
    const observer = new window.ResizeObserver((entries) => {
        if (entries[0]) {
            const { x, y, width, height, top, left, bottom, right } = entries[0].contentRect;
            setRect({ x, y, width, height, top, left, bottom, right });
        }
    });
    useEffect(() => {
        if (!element) {
            return;
        }
        observer.observe(element.value);
        return () => {
            observer.disconnect();
        };
    }, [element]);
    return [ref, rect];
}
var useMeasure$1 = isBrowser && typeof window.ResizeObserver !== 'undefined'
    ? useMeasure
    : (() => [noop, defaultState$2]);

function useMedia(query, defaultState = false) {
    const [state, setState] = useState(isBrowser ? () => window.matchMedia(unref(query)).matches : defaultState);
    useEffect(() => {
        let mounted = true;
        const mql = window.matchMedia(unref(query));
        const onChange = () => {
            if (!mounted) {
                return;
            }
            setState(!!mql.matches);
        };
        mql.addListener(onChange);
        setState(mql.matches);
        return () => {
            mounted = false;
            mql.removeListener(onChange);
        };
    }, sources([query]));
    return computed(() => {
        return state.value;
    });
}

const useMediaDevices = () => {
    const [state, setState] = useReactive({});
    useEffect(() => {
        let mounted = true;
        const onChange = () => {
            navigator.mediaDevices
                .enumerateDevices()
                .then((devices) => {
                if (mounted) {
                    setState({
                        devices: devices.map(({ deviceId, groupId, kind, label }) => ({
                            deviceId,
                            groupId,
                            kind,
                            label,
                        })),
                    });
                }
            })
                .catch(noop);
        };
        on(navigator.mediaDevices, 'devicechange', onChange);
        onChange();
        return () => {
            mounted = false;
            off(navigator.mediaDevices, 'devicechange', onChange);
        };
    }, []);
    return state;
};
const useMediaDevicesMock = () => ({});
var useMediaDevices$1 = isNavigator && !!navigator.mediaDevices ? useMediaDevices : useMediaDevicesMock;

const defaultState$1 = {
    acceleration: {
        x: null,
        y: null,
        z: null,
    },
    accelerationIncludingGravity: {
        x: null,
        y: null,
        z: null,
    },
    rotationRate: {
        alpha: null,
        beta: null,
        gamma: null,
    },
    interval: 16,
};
const useMotion = (initialState = defaultState$1) => {
    const [state, setState] = useReactive(initialState);
    const handler = (event) => {
        const { acceleration, accelerationIncludingGravity, rotationRate, interval } = event;
        setState({
            acceleration: {
                x: acceleration.x,
                y: acceleration.y,
                z: acceleration.z,
            },
            accelerationIncludingGravity: {
                x: accelerationIncludingGravity.x,
                y: accelerationIncludingGravity.y,
                z: accelerationIncludingGravity.z,
            },
            rotationRate: {
                alpha: rotationRate.alpha,
                beta: rotationRate.beta,
                gamma: rotationRate.gamma,
            },
            interval,
        });
    };
    let hasGranted = false;
    const needGrantPermission = typeof DeviceMotionEvent.requestPermission === 'function';
    const requestPermisson = () => {
        if (needGrantPermission) {
            if (hasGranted)
                return;
            hasGranted = true;
            return DeviceMotionEvent.requestPermission().then(function (state) {
                if ('granted' === state) {
                    on(window, 'devicemotion', handler);
                }
            });
        }
        return new Promise((resolve) => {
            resolve({ state: '' });
        });
    };
    useEffect(() => {
        if (!needGrantPermission) {
            on(window, 'devicemotion', handler);
        }
        return () => {
            off(window, 'devicemotion', handler);
        };
    }, []);
    return [state, requestPermisson];
};

const useMouse = (ref) => {
    if (process.env.NODE_ENV === 'development') {
        if (typeof ref !== 'object' || typeof ref.value === 'undefined') {
            console.error('useMouse expects a single ref argument.');
        }
    }
    const [state, setState] = useRafState({
        docX: 0,
        docY: 0,
        posX: 0,
        posY: 0,
        elX: 0,
        elY: 0,
        elH: 0,
        elW: 0,
    });
    useEffect(() => {
        const moveHandler = (event) => {
            if (ref && ref.value) {
                const { left, top, width: elW, height: elH } = ref.value.getBoundingClientRect();
                const posX = left + window.pageXOffset;
                const posY = top + window.pageYOffset;
                const elX = event.pageX - posX;
                const elY = event.pageY - posY;
                setState({
                    docX: event.pageX,
                    docY: event.pageY,
                    posX,
                    posY,
                    elX,
                    elY,
                    elH,
                    elW,
                });
            }
        };
        on(document, 'mousemove', moveHandler);
        return () => {
            off(document, 'mousemove', moveHandler);
        };
    }, [ref]);
    return computed(() => {
        return state.value;
    });
};

const useMouseHovered = (ref, options = {}) => {
    const whenHovered = !!unref(options.whenHovered);
    const bound = !!unref(options.bound);
    const isHovered = useHoverDirty(ref, whenHovered);
    const state = useMouse(computed(() => {
        return whenHovered && !isHovered.value ? null : ref.value;
    }));
    if (unref(bound)) {
        watch(state, () => {
            state.value.elX = Math.max(0, Math.min(state.value.elX, state.value.elW));
            state.value.elY = Math.max(0, Math.min(state.value.elY, state.value.elH));
        });
    }
    return state;
};

function useMouseWheel() {
    const [mouseWheelScrolled, setMouseWheelScrolled] = useState(0);
    useEffect(() => {
        const updateScroll = (e) => {
            setMouseWheelScrolled(e.deltaY + mouseWheelScrolled.value);
        };
        on(window, 'wheel', updateScroll, false);
        return () => off(window, 'wheel', updateScroll);
    });
    return mouseWheelScrolled;
}

const nav = isNavigator ? navigator : undefined;
const conn = nav && (nav.connection || nav.mozConnection || nav.webkitConnection);
function getConnectionState(previousState) {
    const online = nav === null || nav === void 0 ? void 0 : nav.onLine;
    const previousOnline = previousState === null || previousState === void 0 ? void 0 : previousState.online;
    return {
        online,
        previous: previousOnline,
        since: online !== previousOnline ? new Date() : previousState === null || previousState === void 0 ? void 0 : previousState.since,
        downlink: conn === null || conn === void 0 ? void 0 : conn.downlink,
        downlinkMax: conn === null || conn === void 0 ? void 0 : conn.downlinkMax,
        effectiveType: conn === null || conn === void 0 ? void 0 : conn.effectiveType,
        rtt: conn === null || conn === void 0 ? void 0 : conn.rtt,
        saveData: conn === null || conn === void 0 ? void 0 : conn.saveData,
        type: conn === null || conn === void 0 ? void 0 : conn.type,
    };
}
function useNetworkState(initialState) {
    const [state, setState] = useReactive(initialState !== null && initialState !== void 0 ? initialState : getConnectionState);
    useEffect(() => {
        const handleStateChange = () => {
            setState(getConnectionState);
        };
        on(window, 'online', handleStateChange, { passive: true });
        on(window, 'offline', handleStateChange, { passive: true });
        if (conn) {
            on(conn, 'change', handleStateChange, { passive: true });
        }
        return () => {
            off(window, 'online', handleStateChange);
            off(window, 'offline', handleStateChange);
            if (conn) {
                off(conn, 'change', handleStateChange);
            }
        };
    }, []);
    return state;
}

const defaultState = {
    angle: 0,
    type: 'landscape-primary',
};
function useOrientation(initialState = defaultState) {
    const [state, setState] = useReactive(initialState);
    useEffect(() => {
        const screen = window.screen;
        let mounted = true;
        const onChange = () => {
            if (mounted) {
                const { orientation } = screen;
                if (orientation) {
                    const { angle, type } = orientation;
                    setState({ angle, type });
                }
                else if (window.orientation !== undefined) {
                    setState({
                        angle: typeof window.orientation === 'number' ? window.orientation : 0,
                        type: '',
                    });
                }
                else {
                    setState(initialState);
                }
            }
        };
        on(window, 'orientationchange', onChange);
        onChange();
        return () => {
            mounted = false;
            off(window, 'orientationchange', onChange);
        };
    }, []);
    return state;
}

const usePageLeave = (onPageLeave, args = []) => {
    useEffect(() => {
        if (!onPageLeave) {
            return;
        }
        const handler = (event) => {
            event = event ? event : window.event;
            const from = event.relatedTarget || event.toElement;
            if (!from || from.nodeName === 'HTML') {
                onPageLeave();
            }
        };
        on(document, 'mouseout', handler);
        return () => {
            off(document, 'mouseout', handler);
        };
    }, sources(args));
};

function useScratch(params = {}) {
    const { disabled } = params;
    const paramsRef = ref(params);
    const [state, setState] = useState({ isScratching: false });
    const refState = ref(state.value);
    const refScratching = ref(false);
    const refAnimationFrame = ref(null);
    const [el, setEl] = useState(null);
    useEffect(() => {
        if (disabled)
            return;
        if (el.value == null)
            return;
        const onMoveEvent = (docX, docY) => {
            cancelAnimationFrame(refAnimationFrame.value);
            refAnimationFrame.value = requestAnimationFrame(() => {
                if (el.value == null)
                    return;
                if (state.value.isScratching == false)
                    return;
                const { left, top } = el.value.getBoundingClientRect();
                const elX = left + window.scrollX;
                const elY = top + window.scrollY;
                const x = docX - elX;
                const y = docY - elY;
                setState((oldState) => {
                    const newState = Object.assign(Object.assign({}, oldState), { dx: x - (oldState.x || 0), dy: y - (oldState.y || 0), end: Date.now(), isScratching: true });
                    refState.value = newState;
                    (paramsRef.value.onScratch || noop)(newState);
                    return newState;
                });
            });
        };
        const onMouseMove = (event) => {
            onMoveEvent(event.pageX, event.pageY);
        };
        const onTouchMove = (event) => {
            onMoveEvent(event.changedTouches[0].pageX, event.changedTouches[0].pageY);
        };
        let onMouseUp;
        let onTouchEnd;
        const stopScratching = () => {
            if (!refScratching.value)
                return;
            refScratching.value = false;
            refState.value = Object.assign(Object.assign({}, refState.value), { isScratching: false });
            (paramsRef.value.onScratchEnd || noop)(refState.value);
            setState({ isScratching: false });
            off(window, 'mousemove', onMouseMove);
            off(window, 'touchmove', onTouchMove);
            off(window, 'mouseup', onMouseUp);
            off(window, 'touchend', onTouchEnd);
        };
        onMouseUp = stopScratching;
        onTouchEnd = stopScratching;
        const startScratching = (docX, docY) => {
            if (!refScratching.value)
                return;
            if (el.value == null)
                return;
            const { left, top } = el.value.getBoundingClientRect();
            const elX = left + window.scrollX;
            const elY = top + window.scrollY;
            const x = docX - elX;
            const y = docY - elY;
            const time = Date.now();
            const newState = {
                isScratching: true,
                start: time,
                end: time,
                docX,
                docY,
                x,
                y,
                dx: 0,
                dy: 0,
                elH: el.value.offsetHeight,
                elW: el.value.offsetWidth,
                elX,
                elY,
            };
            refState.value = newState;
            (paramsRef.value.onScratchStart || noop)(newState);
            setState(newState);
            on(window, 'mousemove', onMouseMove);
            on(window, 'touchmove', onTouchMove);
            on(window, 'mouseup', onMouseUp);
            on(window, 'touchend', onTouchEnd);
        };
        const onMouseDown = (event) => {
            refScratching.value = true;
            startScratching(event.pageX, event.pageY);
        };
        const onTouchStart = (event) => {
            refScratching.value = true;
            startScratching(event.changedTouches[0].pageX, event.changedTouches[0].pageY);
        };
        on(el.value, 'mousedown', onMouseDown);
        on(el.value, 'touchstart', onTouchStart);
        return () => {
            off(el.value, 'mousedown', onMouseDown);
            off(el.value, 'touchstart', onTouchStart);
            off(window, 'mousemove', onMouseMove);
            off(window, 'touchmove', onTouchMove);
            off(window, 'mouseup', onMouseUp);
            off(window, 'touchend', onTouchEnd);
            if (refAnimationFrame.value)
                cancelAnimationFrame(refAnimationFrame.value);
            refAnimationFrame.value = null;
            refScratching.value = false;
            refState.value = { isScratching: false };
            setState(refState.value);
        };
    }, sources([el, disabled, paramsRef]));
    return [setEl, computed(() => {
            return state.value;
        })];
}

function useScroll(ref) {
    if (process.env.NODE_ENV === 'development') {
        if (typeof ref !== 'object' || typeof ref.value === 'undefined') {
            console.error('`useScroll` expects a single ref argument.');
        }
    }
    const [state, setState] = useRafReactive({
        x: 0,
        y: 0,
    });
    useEffect(() => {
        const handler = () => {
            if (ref.value) {
                setState({
                    x: ref.value.scrollLeft,
                    y: ref.value.scrollTop,
                });
            }
        };
        if (ref.value) {
            on(ref.value, 'scroll', handler, {
                capture: false,
                passive: true,
            });
        }
        return () => {
            if (ref.value) {
                off(ref.value, 'scroll', handler);
            }
        };
    }, [ref]);
    return readonly(state);
}

const useScrolling = (ref) => {
    const [scrolling, setScrolling] = useState(false);
    useEffect(() => {
        if (ref.value) {
            let scrollingTimeout;
            const handleScrollEnd = () => {
                setScrolling(false);
            };
            const handleScroll = () => {
                setScrolling(true);
                clearTimeout(scrollingTimeout);
                scrollingTimeout = setTimeout(() => handleScrollEnd(), 150);
            };
            on(ref.value, 'scroll', handleScroll, false);
            return () => {
                if (ref.value) {
                    off(ref.value, 'scroll', handleScroll, false);
                }
            };
        }
        return () => {
            // void
        };
    }, [ref]);
    return readonly(scrolling);
};

const getValue = (search, param) => new URLSearchParams(search).get(param);
const useSearchParam = (param) => {
    const location = window.location;
    const [value, setValue] = useState(() => getValue(location.search, unref(param)));
    useEffect(() => {
        const onChange = () => {
            setValue(getValue(location.search, unref(param)));
        };
        on(window, 'popstate', onChange);
        on(window, 'pushstate', onChange);
        on(window, 'replacestate', onChange);
        return () => {
            off(window, 'popstate', onChange);
            off(window, 'pushstate', onChange);
            off(window, 'replacestate', onChange);
        };
    }, []);
    return value;
};
const useSearchParamServer = () => null;
var useSearchParam$1 = isBrowser ? useSearchParam : useSearchParamServer;

const DRAF = (callback) => setTimeout(callback, 35);
const useSize = ({ width = Infinity, height = Infinity } = {}) => {
    if (!isBrowser) {
        return [
            createVNode(""),
            { width, height },
        ];
    }
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [state, setState] = useReactive({ width, height });
    const ref$1 = ref(null);
    let window = null;
    const setSize = () => {
        const iframe = ref$1.value;
        const size = iframe
            ? {
                width: iframe.offsetWidth,
                height: iframe.offsetHeight,
            }
            : { width, height };
        setState(size);
    };
    const onWindow = (windowToListenOn) => {
        on(windowToListenOn, 'resize', setSize);
        DRAF(setSize);
    };
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
        const iframe = ref$1.value;
        if (!iframe) {
            // iframe will be undefined if component is already unmounted
            return;
        }
        if (iframe.parentElement) {
            iframe.parentElement.style.position = 'relative';
        }
        if (iframe.contentWindow) {
            window = iframe.contentWindow;
            onWindow(window);
        }
        else {
            const onLoad = () => {
                on(iframe, 'load', onLoad);
                window = iframe.contentWindow;
                onWindow(window);
            };
            off(iframe, 'load', onLoad);
        }
        return () => {
            if (window && window.removeEventListener) {
                off(window, 'resize', setSize);
            }
        };
    });
    const Sized = createVNode({
        render() {
            return createVNode('iframe', {
                ref: ref$1,
                style: {
                    background: 'transparent',
                    border: 'none',
                    height: '100%',
                    left: 0,
                    position: 'absolute',
                    top: 0,
                    width: '100%',
                    zIndex: -1,
                },
            });
        }
    });
    return [Sized, readonly(state)];
};

const isFocusedElementEditable = () => {
    const { activeElement, body } = document;
    if (!activeElement) {
        return false;
    }
    // If not element has focus, we assume it is not editable, too.
    if (activeElement === body) {
        return false;
    }
    // Assume <input> and <textarea> elements are editable.
    switch (activeElement.tagName) {
        case 'INPUT':
        case 'TEXTAREA':
            return true;
    }
    // Check if any other focused element id editable.
    return activeElement.hasAttribute('contenteditable');
};
const isTypedCharGood = ({ keyCode, metaKey, ctrlKey, altKey }) => {
    if (metaKey || ctrlKey || altKey) {
        return false;
    }
    // 0...9
    if (keyCode >= 48 && keyCode <= 57) {
        return true;
    }
    // a...z
    if (keyCode >= 65 && keyCode <= 90) {
        return true;
    }
    // All other keys.
    return false;
};
const useStartTyping = (onStartTyping) => {
    useEffect(() => {
        const keydown = (event) => {
            !isFocusedElementEditable() && isTypedCharGood(event) && onStartTyping(event);
        };
        on(document, 'keydown', keydown);
        return () => {
            off(document, 'keydown', keydown);
        };
    });
};

const useWindowScroll = () => {
    const [state, setState] = useRafReactive(() => ({
        x: isBrowser ? window.pageXOffset : 0,
        y: isBrowser ? window.pageYOffset : 0,
    }));
    useEffect(() => {
        const handler = () => {
            setState((state) => {
                const { pageXOffset, pageYOffset } = window;
                //Check state for change, return same state if no change happened to prevent rerender
                //(see useState/setState documentation). useState/setState is used internally in useRafState/setState.
                return state.x !== pageXOffset || state.y !== pageYOffset
                    ? {
                        x: pageXOffset,
                        y: pageYOffset,
                    }
                    : state;
            });
        };
        //We have to update window scroll at mount, before subscription.
        //Window scroll may be changed between render and effect handler.
        handler();
        on(window, 'scroll', handler, {
            capture: false,
            passive: true,
        });
        return () => {
            off(window, 'scroll', handler);
        };
    });
    return state;
};

const useWindowSize = (initialWidth = Infinity, initialHeight = Infinity) => {
    const [state, setState] = useRafReactive({
        width: isBrowser ? window.innerWidth : initialWidth,
        height: isBrowser ? window.innerHeight : initialHeight,
    });
    useEffect(() => {
        if (isBrowser) {
            const handler = () => {
                setState({
                    width: window.innerWidth,
                    height: window.innerHeight,
                });
            };
            on(window, 'resize', handler);
            return () => {
                off(window, 'resize', handler);
            };
        }
    }, []);
    return state;
};

function useMemo(factory, deps = undefined) {
    const [state, setState] = useState(() => factory());
    if (deps) {
        watch(deps, function () {
            setState(() => factory());
        });
    }
    return state;
}

function useBreakpoint(breakpoints = { laptopL: 1440, laptop: 1024, tablet: 768 }) {
    const [screen, setScreen] = useState(0);
    useEffect(() => {
        const setSideScreen = () => {
            setScreen(window.innerWidth);
        };
        setSideScreen();
        on(window, 'resize', setSideScreen);
        return () => {
            off(window, 'resize', setSideScreen);
        };
    });
    const sortedBreakpoints = useMemo(() => {
        return Object.entries(unref(breakpoints)).sort((a, b) => (a[1] >= b[1] ? 1 : -1));
    }, sources([breakpoints]));
    const result = useMemo(() => {
        return sortedBreakpoints.value.reduce((acc, [name, width]) => {
            if (screen.value >= width) {
                return name;
            }
            else {
                return acc;
            }
        }, sortedBreakpoints.value[0][0]);
    }, screen);
    return result;
}

function useStateValidator(state, validator, initialState = [undefined]) {
    const stateInner = ref(state);
    const validatorInner = ref(validator);
    const [validity, setValidity] = useReadonly(initialState);
    const validate = () => {
        if (validatorInner.value.length >= 2) {
            validatorInner.value(unref(stateInner.value), setValidity);
        }
        else {
            setValidity(validatorInner.value(unref(stateInner.value)));
        }
    };
    return [validity, validate];
}

export { UseKey, createGlobalState, off, on, sources, useAsync, useAsyncFn, useAsyncRetry, useAudio, useBattery$1 as useBattery, useBeforeUnload, useToggle as useBoolean, useBreakpoint, useClickAway, useComputedSetState, useComputedState, useCookie, useCopyToClipboard, useCounter, useCss, useDebounce, useDefault, useDrop, useDropArea, useEffect, useEvent, useFavicon, useFullscreen, useGeolocation, useGetSet, useHarmonicIntervalFn, useHash, useHover, useHoverDirty, useIdle, useIntersection, useInterval, useKey, useKeyPress, useKeyPressEvent, useKeyboardJs, useList, useLocalStorage, useLocation, useLockBodyScroll, useLongPress, useMap, useMeasure$1 as useMeasure, useMedia, useMediaDevices$1 as useMediaDevices, useMediatedState, useMemo, useMethods, useMotion, useMounted, useMountedState, useMouse, useMouseHovered, useMouseWheel, useMultiStateValidator, useNetworkState, useOrientation, usePageLeave, usePermission, useQueue, useRaf, useRafLoop, useRafReactive, useRafState, useReactive, useReadonly, useReducer, useScratch, useScroll, useScrolling, useSearchParam$1 as useSearchParam, useSessionStorage, useSet, useSetState, useSize, useSlider, useSpeech, useSpring, useStartTyping, useState, useStateList, useStateValidator, useThrottle, useThrottleFn, useTimeout, useTimeoutFn, useTitle$1 as useTitle, useToggle, useTween, useVideo, useWindowScroll, useWindowSize };
//# sourceMappingURL=vue-next-use.bundle.esm.js.map
