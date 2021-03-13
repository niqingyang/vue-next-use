'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var Vue = require('vue');
var writeText = require('copy-to-clipboard');
var screenfull = require('screenfull');
var Cookies = require('js-cookie');
var setHarmonicInterval = require('set-harmonic-interval');
var rebound = require('rebound');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var writeText__default = /*#__PURE__*/_interopDefaultLegacy(writeText);
var screenfull__default = /*#__PURE__*/_interopDefaultLegacy(screenfull);
var Cookies__default = /*#__PURE__*/_interopDefaultLegacy(Cookies);

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
const isWatchSource = (target) => {
    // A watch source can only be a getter/effect function, a ref, a reactive object, or an array of these types.
    if (Vue.isRef(target) || Vue.isReactive(target) || target instanceof Function) {
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

function useState(initialState) {
    const state = initialState instanceof Function ? Vue.ref(initialState()) : Vue.ref(initialState);
    const set = (value) => {
        if (value instanceof Function) {
            state.value = value(state.value);
        }
        else {
            state.value = value;
        }
    };
    return [state, set];
}

function useMountedState() {
    const mountedRef = Vue.ref(false);
    const get = () => mountedRef.value;
    Vue.onMounted(() => {
        mountedRef.value = true;
    });
    Vue.onUnmounted(() => {
        mountedRef.value = false;
    });
    return get;
}

function useAsyncFn(fn, initialState = { loading: false }) {
    const lastCallId = Vue.ref(0);
    const isMounted = useMountedState();
    const [state, set] = useState(initialState);
    const callback = (...args) => {
        const callId = ++lastCallId.value;
        state.value.loading = true;
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
        Vue.watch(deps, () => {
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

function useAsyncRetry(fn, deps = []) {
    const [attempt, setAttempt] = useState(0);
    const state = useAsync(fn, [...deps, attempt]);
    const retry = () => {
        if (state.value.loading) {
            if (process.env.NODE_ENV === 'development') {
                console.log('You are calling useAsyncRetry hook retry() method while loading in progress, this is a no-op.');
            }
            return;
        }
        setAttempt((currentAttempt) => currentAttempt + 1);
    };
    return [state, retry];
}

function useComputedState(initialState) {
    const [state, setState] = useState(initialState);
    return [
        Vue.computed(() => {
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
    Vue.onMounted(() => {
        Vue.watch([enabled], ([value], oldValue) => {
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
    Vue.onBeforeUnmount(() => {
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
        first: Vue.computed(() => {
            return state.value[0];
        }),
        last: Vue.computed(() => {
            return state.value[state.value.length - 1];
        }),
        size: Vue.computed(() => {
            return state.value.length;
        }),
    };
};

function resolveHookState(nextState, currentState) {
    if (typeof nextState === 'function') {
        return nextState.length ? nextState(currentState) : nextState();
    }
    return nextState;
}

function useList(initialList = []) {
    const [list, set] = useState(resolveHookState(initialList));
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
    return [Vue.computed(() => {
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
    return [map, utils];
};

const useSetState = (initialState = {}) => {
    const [state, set] = useState(initialState);
    const setState = (patch) => {
        set((prevState) => Object.assign({}, prevState, patch instanceof Function ? patch(prevState) : patch));
    };
    return [state, setState];
};

const useCopyToClipboard = () => {
    const isMounted = useMountedState();
    const [state, setState] = useSetState({
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
            noUserInteraction = writeText__default['default'](normalizedValue);
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
        if (Vue.isVNode(elOrProps)) {
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
        const ref = Vue.ref(null);
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
            const { duration, buffered } = el;
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
            setState({ time: el.currentTime });
        };
        const onProgress = () => {
            const el = ref.value;
            if (!el) {
                return;
            }
            setState({ buffered: parseTimeRanges(el.buffered) });
        };
        if (element) {
            element = Vue.createVNode(element, Object.assign(Object.assign({ controls: false }, props), { ref, onPlay: wrapEvent(props.onPlay, onPlay), onPause: wrapEvent(props.onPause, onPause), onVolumeChange: wrapEvent(props.onVolumechange, onVolumeChange), onDurationChange: wrapEvent(props.onDurationchange, onDurationChange), onTimeUpdate: wrapEvent(props.onTimeupdate, onTimeUpdate), onProgress: wrapEvent(props.onProgress, onProgress) }));
        }
        else {
            element = Vue.createVNode(tag, Object.assign(Object.assign({ controls: false }, props), { onPlay: wrapEvent(props.onPlay, onPlay), onPause: wrapEvent(props.onPause, onPause), onVolumeChange: wrapEvent(props.onVolumechange, onVolumeChange), onDurationChange: wrapEvent(props.onDurationchange, onDurationChange), onTimeUpdate: wrapEvent(props.onTimeupdate, onTimeUpdate), onProgress: wrapEvent(props.onProgress, onProgress) })); // TODO: fix this typing.
        }
        // Some browsers return `Promise` on `.play()` and may throw errors
        // if one tries to execute another `.play()` or `.pause()` while that
        // promise is resolving. So we prevent that with this lock.
        // See: https://bugs.chromium.org/p/chromium/issues/detail?id=593273
        let lockPlay = false;
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
            seek: (time) => {
                const el = ref.value;
                if (!el || state.value.duration === undefined) {
                    return;
                }
                time = Math.min(state.value.duration, Math.max(0, time));
                el.currentTime = time;
            },
            volume: (volume) => {
                const el = ref.value;
                if (!el) {
                    return;
                }
                volume = Math.min(1, Math.max(0, volume));
                el.volume = volume;
                setState({ volume });
            },
            mute: () => {
                const el = ref.value;
                if (!el) {
                    return;
                }
                el.muted = true;
                setState({ muted: el.muted });
            },
            unmute: () => {
                const el = ref.value;
                if (!el) {
                    return;
                }
                el.muted = false;
                setState({ muted: el.muted });
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
            autoplay: (autoplay) => {
                const el = ref.value;
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
                const el = ref.value;
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
                    controls: el.controls,
                    autoplay: el.autoplay,
                });
                // Start media, if autoPlay requested.
                if (el.autoplay && el.paused) {
                    controls.play();
                }
            }
        };
        return [element, Vue.computed(() => {
                return state.value;
            }), controls, ref];
    };
}

const useAudio = createHTMLMediaHook('audio');

const useVideo = createHTMLMediaHook('video');

const voices = isBrowser && typeof window.speechSynthesis === 'object' ? window.speechSynthesis.getVoices() : [];
const useSpeech = (text, opts = {}) => {
    const [state, setState] = useSetState({
        isPlaying: false,
        lang: opts.lang || 'default',
        voice: opts.voice || voices[0],
        rate: opts.rate || 1,
        pitch: opts.pitch || 1,
        volume: opts.volume || 1,
    });
    const utteranceRef = Vue.ref(null);
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
    return state;
};

const defaultEvents$1 = ['mousedown', 'touchstart'];
const useClickAway = (ref, onClickAway, events = defaultEvents$1) => {
    const handler = (event) => {
        const { value: el } = ref;
        el && !el.contains(event.target) && onClickAway(event);
    };
    Vue.onMounted(() => {
        for (const eventName of events) {
            on(document, eventName, handler);
        }
    });
    Vue.onBeforeUnmount(() => {
        for (const eventName of events) {
            off(document, eventName, handler);
        }
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
    const [state, set] = useSetState({ over: false });
    const setOver = (over) => {
        set({ over });
    };
    const isMounted = useMountedState();
    Vue.watchEffect((onInvalidate) => {
        const element = (ref === null || ref === void 0 ? void 0 : ref.value) ? ref === null || ref === void 0 ? void 0 : ref.value : document;
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
        const process = createProcess$1(options, isMounted);
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
        onInvalidate(() => {
            off(element, 'dragover', onDragOver);
            off(element, 'dragenter', onDragEnter);
            off(element, 'dragleave', onDragLeave);
            off(element, 'dragexit', onDragExit);
            off(element, 'drop', onDrop);
            off(element, 'paste', onPaste);
        });
    });
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
    onDragOver: (event) => {
        event.preventDefault();
        setOver(true);
    },
    onDragEnter: (event) => {
        event.preventDefault();
        setOver(true);
    },
    onDragLeave: () => {
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
    const [state, set] = useState({ over: false });
    const setOver = (over) => {
        set({ over });
    };
    const process = createProcess(options, isMounted);
    const bond = createBond(process, setOver);
    return [bond, state];
};

const useFullscreen = (ref, enabled, options = {}) => {
    const { video, onClose = noop } = options;
    const [isFullscreen, setIsFullscreen] = useState(Vue.unref(enabled));
    useEffect(() => {
        if (!Vue.unref(enabled)) {
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
            if (screenfull__default['default'].isEnabled) {
                const isScreenfullFullscreen = screenfull__default['default'].isFullscreen;
                setIsFullscreen(isScreenfullFullscreen);
                if (!isScreenfullFullscreen) {
                    onClose();
                }
            }
        };
        if (screenfull__default['default'].isEnabled) {
            try {
                screenfull__default['default'].request(ref.value);
                setIsFullscreen(true);
            }
            catch (error) {
                onClose(error);
                setIsFullscreen(false);
            }
            screenfull__default['default'].on('change', onChange);
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
            if (screenfull__default['default'].isEnabled) {
                try {
                    screenfull__default['default'].off('change', onChange);
                    screenfull__default['default'].exit();
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
    return Vue.computed(() => {
        return isFullscreen.value;
    });
};

const useCookie = (cookieName) => {
    const [value, setValue] = useState(() => Cookies__default['default'].get(cookieName) || null);
    const updateCookie = (newValue, options) => {
        Cookies__default['default'].set(cookieName, newValue, options);
        setValue(newValue);
    };
    const deleteCookie = () => {
        Cookies__default['default'].remove(cookieName);
        setValue(null);
    };
    return [value, updateCookie, deleteCookie];
};

function useEffect(fn, deps = undefined) {
    const [callback, setCallback] = useState(undefined);
    Vue.onMounted(() => {
        setCallback(() => fn());
        if (deps) {
            Vue.watch(deps, (newValue, oldValue) => {
                if (callback.value instanceof Function) {
                    callback.value();
                }
                setCallback(() => fn());
            });
        }
    });
    Vue.onUnmounted(() => {
        if (callback.value instanceof Function) {
            callback.value();
        }
    });
}

// fn: Function - function that will be called;
// ms: number - delay in milliseconds;
// isReady: boolean|null - function returning current timeout state:
//      false - pending
//      true - called
//      null - cancelled
// cancel: ()=>void - cancel the timeout
// reset: ()=>void - reset the timeout
function useTimeoutFn(fn, ms = 0) {
    const ready = Vue.ref(false);
    const timeout = Vue.ref();
    const isReady = Vue.computed(() => ready.value);
    const set = () => {
        ready.value = false;
        timeout.value && clearTimeout(timeout.value);
        timeout.value = setTimeout(() => {
            ready.value = true;
            Vue.unref(fn)();
        }, Vue.unref(ms));
    };
    const clear = () => {
        ready.value = null;
        timeout.value && clearTimeout(timeout.value);
    };
    // set on mount, clear on unmount
    useEffect(() => {
        set();
        return clear;
    }, Vue.isRef(ms) ? ms : null);
    return [isReady, clear, set];
}

function useTimeout(ms = 0) {
    return useTimeoutFn(() => {
        return;
    }, ms);
}

const useInterval = (callback, delay) => {
    const savedCallback = Vue.ref(Vue.unref(callback));
    if (Vue.isRef(callback)) {
        Vue.watch(callback, () => {
            savedCallback.value = Vue.unref(callback);
        });
    }
    useEffect(() => {
        if (Vue.unref(delay) !== null) {
            const interval = setInterval(Vue.unref(savedCallback), Vue.unref(delay) || 0);
            return () => clearInterval(interval);
        }
        return undefined;
    }, Vue.isRef(delay) ? delay : undefined);
};

const useHarmonicIntervalFn = (fn, delay = 0) => {
    const latestCallback = Vue.ref(() => {
        // void
    });
    useEffect(() => {
        latestCallback.value = fn;
    });
    useEffect(() => {
        if (Vue.unref(delay) !== null) {
            const interval = setHarmonicInterval.setHarmonicInterval(() => latestCallback.value, Vue.unref(delay) || 0);
            return () => setHarmonicInterval.clearHarmonicInterval(interval);
        }
        return undefined;
    }, Vue.isRef(delay) ? delay : undefined);
};

const useSpring = (targetValue = 0, tension = 50, friction = 3) => {
    const [spring, setSpring] = useState(null);
    const [value, setValue] = useState(Vue.unref(targetValue));
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
            const newSpring = new rebound.SpringSystem().createSpring(Vue.unref(tension), Vue.unref(friction));
            newSpring.setCurrentValue(Vue.unref(targetValue));
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
        Vue.computed(() => {
            return Vue.unref(tension);
        }),
        Vue.computed(() => {
            return Vue.unref(friction);
        })
    ]);
    useEffect(() => {
        if (spring.value) {
            spring.value.setEndValue(Vue.unref(targetValue));
        }
    }, Vue.isRef(targetValue) ? targetValue : null);
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
        const element = Vue.unref(target);
        const fn = Vue.unref(handler);
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
    }, sources([name, Vue.isRef(handler) ? handler : () => handler, target, JSON.stringify(options)]));
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
    const [predicate, setPredicate] = useState(() => createKeyPredicate(Vue.unref(key)));
    if (Vue.isRef(key)) {
        Vue.watch(key, () => {
            setPredicate(() => createKeyPredicate(Vue.unref(key)));
        });
    }
    const handler = (handlerEvent) => {
        if (Vue.unref(predicate)(handlerEvent)) {
            return fn(handlerEvent);
        }
    };
    useEvent(event, handler, target, options);
};

var UseKey = {
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
    const [state, setState] = useState({
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
    return Vue.computed(() => {
        return state.value;
    });
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
            timeout = setTimeout(() => set(true), Vue.unref(ms));
        });
        const onVisibility = () => {
            if (!document.hidden) {
                onEvent();
            }
        };
        const e = Vue.unref(events);
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
    return Vue.computed(() => {
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
    const el = Vue.cloneVNode(element, {
        onmouseenter: onMouseEnter((_a = element === null || element === void 0 ? void 0 : element.props) === null || _a === void 0 ? void 0 : _a.onmouseenter),
        onmouseleave: onMouseLeave((_b = element === null || element === void 0 ? void 0 : element.props) === null || _b === void 0 ? void 0 : _b.onmouseleave),
    });
    return [el, Vue.computed(() => {
            return state.value;
        })];
};

// kudos: https://usehooks.com/
const useHoverDirty = (ref, enabled = true) => {
    if (process.env.NODE_ENV === 'development') {
        if (typeof ref !== 'object' || typeof Vue.unref(ref) === 'undefined') {
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
    Vue.watch(hash, (newHash) => {
        if (window.location.hash != newHash) {
            window.location.hash = newHash;
        }
    });
    const _setHash = (newHash) => {
        if (newHash !== Vue.unref(hash)) {
            window.location.hash = newHash;
        }
    };
    return [hash, _setHash];
}

const useIntersection = (ref, options) => {
    const [intersectionObserverEntry, setIntersectionObserverEntry,] = useComputedState(null);
    const deps = [ref];
    if (Vue.isRef(options)) {
        deps.push(() => Vue.unref(options).threshold);
        deps.push(() => Vue.unref(options).root);
        deps.push(() => Vue.unref(options).rootMargin);
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
            const observer = new IntersectionObserver(handler, Vue.unref(options));
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

exports.UseKey = UseKey;
exports.off = off;
exports.on = on;
exports.sources = sources;
exports.useAsync = useAsync;
exports.useAsyncFn = useAsyncFn;
exports.useAsyncRetry = useAsyncRetry;
exports.useAudio = useAudio;
exports.useBeforeUnload = useBeforeUnload;
exports.useBoolean = useToggle;
exports.useClickAway = useClickAway;
exports.useComputedSetState = useSetState;
exports.useComputedState = useComputedState;
exports.useCookie = useCookie;
exports.useCopyToClipboard = useCopyToClipboard;
exports.useDrop = useDrop;
exports.useDropArea = useDropArea;
exports.useEffect = useEffect;
exports.useEvent = useEvent;
exports.useFullscreen = useFullscreen;
exports.useGeolocation = useGeolocation;
exports.useGetSet = useGetSet;
exports.useHarmonicIntervalFn = useHarmonicIntervalFn;
exports.useHash = useHash;
exports.useHover = useHover;
exports.useHoverDirty = useHoverDirty;
exports.useIdle = useIdle;
exports.useIntersection = useIntersection;
exports.useInterval = useInterval;
exports.useKey = useKey;
exports.useList = useList;
exports.useMap = useMap;
exports.useMountedState = useMountedState;
exports.useQueue = useQueue;
exports.useSet = useSet;
exports.useSetState = useSetState;
exports.useSpeech = useSpeech;
exports.useSpring = useSpring;
exports.useState = useState;
exports.useTimeout = useTimeout;
exports.useTimeoutFn = useTimeoutFn;
exports.useToggle = useToggle;
exports.useVideo = useVideo;
//# sourceMappingURL=vue-next-use.bundle.cjs.js.map
