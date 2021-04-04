import { WatchSource, Ref, ComputedRef, UnwrapRef, AudioHTMLAttributes, VideoHTMLAttributes, VNode, RendererElement } from 'vue';
export { ref as useRef } from 'vue';
import Cookies from 'js-cookie';

declare function on<T extends Window | Document | HTMLElement | EventTarget>(obj: T | null, ...args: Parameters<T['addEventListener']> | [string, Function | null, ...any]): void;
declare function off<T extends Window | Document | HTMLElement | EventTarget>(obj: T | null, ...args: Parameters<T['removeEventListener']> | [string, Function | null, ...any]): void;
declare type MultiWatchSources$2 = (WatchSource<unknown> | object)[];
/**
 * filter watch sources
 * @param target
 * @returns
 */
declare const sources: (target: any) => (MultiWatchSources$2 | WatchSource | null);

declare type PromiseType<P extends Promise<any>> = P extends Promise<infer T> ? T : never;
declare type FunctionReturningPromise = (...args: any[]) => Promise<any>;
declare type SetStateAction<S> = S | ((prevState: S) => S);
declare type Dispatch$1<A> = (value: A) => void;
declare type DispatchWithoutAction = () => void;
declare type Reducer<S, A> = (prevState: S, action: A) => S;
declare type ReducerWithoutAction<S> = (prevState: S) => S;
declare type ReducerState<R extends Reducer<any, any>> = R extends Reducer<infer S, any> ? S : never;
declare type ReducerAction<R extends Reducer<any, any>> = R extends Reducer<any, infer A> ? A : never;
declare type EventHandler<E> = {
    bivarianceHack(event: E): void;
}["bivarianceHack"];
declare type ClipboardEventHandler = EventHandler<ClipboardEvent>;
declare type DragEventHandler = EventHandler<DragEvent>;

declare type AsyncState<T> = {
    loading: boolean;
    error?: undefined;
    value?: undefined;
} | {
    loading: true;
    error?: Error | undefined;
    value?: T;
} | {
    loading: false;
    error: Error;
    value?: undefined;
} | {
    loading: false;
    error?: undefined;
    value: T;
};
declare type StateFromFunctionReturningPromise<T extends FunctionReturningPromise> = AsyncState<PromiseType<ReturnType<T>>>;
declare type AsyncFnReturn<T extends FunctionReturningPromise = FunctionReturningPromise> = [
    StateFromFunctionReturningPromise<T>,
    T
];
declare function useAsyncFn<T extends FunctionReturningPromise>(fn: T, initialState?: StateFromFunctionReturningPromise<T>): AsyncFnReturn<T>;

declare function useAsync<T extends FunctionReturningPromise>(fn: T, deps?: any[]): {
    loading: boolean;
    error?: undefined;
    value?: undefined;
} | {
    loading: false;
    error: Error;
    value?: undefined;
} | {
    loading: true;
    error?: Error | undefined;
    value?: PromiseType<ReturnType<T>> | undefined;
} | {
    loading: false;
    error?: undefined;
    value: PromiseType<ReturnType<T>>;
};

declare type AsyncStateRetry<T> = AsyncState<T> & {
    retry(): void;
};
declare function useAsyncRetry<T>(fn: () => Promise<T>, deps?: any[]): AsyncStateRetry<T>;

declare type IHookStateInitialSetter<S> = () => S;
declare type IHookStateInitAction<S> = S | IHookStateInitialSetter<S>;
declare type IHookStateSetter<S> = ((prevState: S) => S) | (() => S);
declare type IHookStateSetAction<S> = S | IHookStateSetter<S>;

declare type ToRef<T> = [T] extends [Ref] ? T : Ref<T>;
declare function useState<T extends object>(value: T): [ToRef<T>, (prevState: SetStateAction<T>) => void];
declare function useState<T>(value: IHookStateInitAction<T>): [Ref<T>, (prevState: SetStateAction<T>) => void];
declare function useState<T>(value: T): [ToRef<T>, (prevState: SetStateAction<T>) => void];
declare function useState<T = any>(): [Ref<T | undefined>, (prevState: SetStateAction<T>) => void];

declare type ToComputedRef<T> = [T] extends [ComputedRef] ? T : ComputedRef<T>;
declare function useComputedState<T extends object>(value: T): [ToComputedRef<T>, (prevState: SetStateAction<T>) => void];
declare function useComputedState<T>(value: IHookStateInitAction<T>): [ToComputedRef<T>, (prevState: SetStateAction<T>) => void];
declare function useComputedState<T>(value: T): [ComputedRef<UnwrapRef<T>>, (prevState: SetStateAction<T>) => void];
declare function useComputedState<T = any>(): [ComputedRef<T | undefined>, (prevState: SetStateAction<T>) => void];

declare const useBeforeUnload: (enabled?: boolean | (() => boolean), message?: string | undefined) => void;

interface QueueMethods<T> {
    add: (item: T) => void;
    remove: () => T | undefined;
    first: ComputedRef<UnwrapRef<T>>;
    last: ComputedRef<UnwrapRef<T>>;
    size: ComputedRef<UnwrapRef<number>>;
}
declare const useQueue: <T>(initialValue?: T[]) => QueueMethods<T>;

interface ListActions<T> {
    /**
     * @description Set new list instead old one
     */
    set: (newList: IHookStateSetAction<T[]>) => void;
    /**
     * @description Add item(s) at the end of list
     */
    push: (...items: T[]) => void;
    /**
     * @description Replace item at given position. If item at given position not exists it will be set.
     */
    updateAt: (index: number, item: T) => void;
    /**
     * @description Insert item at given position, all items to the right will be shifted.
     */
    insertAt: (index: number, item: T) => void;
    /**
     * @description Replace all items that matches predicate with given one.
     */
    update: (predicate: (a: T, b: T) => boolean, newItem: T) => void;
    /**
     * @description Replace first item matching predicate with given one.
     */
    updateFirst: (predicate: (a: T, b: T) => boolean, newItem: T) => void;
    /**
     * @description Like `updateFirst` bit in case of predicate miss - pushes item to the list
     */
    upsert: (predicate: (a: T, b: T) => boolean, newItem: T) => void;
    /**
     * @description Sort list with given sorting function
     */
    sort: (compareFn?: (a: T, b: T) => number) => void;
    /**
     * @description Same as native Array's method
     */
    filter: (callbackFn: (value: T, index?: number, array?: T[]) => boolean, thisArg?: any) => void;
    /**
     * @description Removes item at given position. All items to the right from removed will be shifted.
     */
    removeAt: (index: number) => void;
    /**
     * @description Make the list empty
     */
    clear: () => void;
    /**
     * @description Reset list to initial value
     */
    reset: () => void;
}
declare function useList<T>(initialList?: IHookStateInitAction<T[]>): [ComputedRef<T[]>, ListActions<T>];

interface StableActions$1<T extends object> {
    set: <K extends keyof T>(key: K, value: T[K]) => void;
    setAll: (newMap: T) => void;
    remove: <K extends keyof T>(key: K) => void;
    reset: () => void;
}
interface Actions$1<T extends object> extends StableActions$1<T> {
    get: <K extends keyof T>(key: K) => T[K];
}
declare const useMap: <T extends object = any>(initialMap?: T) => [ComputedRef<T>, Actions$1<T>];

declare type SetPatchStateAction<T> = (patch: Partial<T> | ((prevState: T) => Partial<T>)) => void;
declare function useSetState<T extends object>(value: T): [ToRef<T>, SetPatchStateAction<T>];
declare function useSetState<T>(value: IHookStateInitAction<T>): [Ref<T>, SetPatchStateAction<T>];
declare function useSetState<T>(value: T): [ToRef<T>, SetPatchStateAction<T>];
declare function useSetState<T = any>(): [Ref<T | undefined>, SetPatchStateAction<T>];

declare function useComputedSetState<T extends object>(value: T): [ToComputedRef<T>, (prevState: SetStateAction<T>) => void];
declare function useComputedSetState<T>(value: IHookStateInitAction<T>): [ComputedRef<T>, (prevState: SetStateAction<T>) => void];
declare function useComputedSetState<T>(value: T): [ComputedRef<T>, (prevState: SetStateAction<T>) => void];
declare function useComputedSetState<T = any>(): [ComputedRef<T | undefined>, (prevState: SetStateAction<T>) => void];

declare function useMountedState(): () => boolean;

interface CopyToClipboardState {
    value?: string;
    noUserInteraction: boolean;
    error?: Error;
}
declare const useCopyToClipboard: () => [CopyToClipboardState, (value: string) => void];

declare const useToggle: (initialValue: boolean) => [Ref<boolean>, (nextValue?: any) => void];

declare function useGetSet<S>(initialState: IHookStateInitAction<S>): [get: () => S, set: (value: IHookStateSetAction<S>) => void];

interface StableActions<K> {
    add: (key: K) => void;
    remove: (key: K) => void;
    toggle: (key: K) => void;
    reset: () => void;
}
interface Actions<K> extends StableActions<K> {
    has: (key: K) => boolean;
}
declare const useSet: <K>(initialSet?: Set<K>) => [Ref<Set<K>>, Actions<K>];

interface HTMLMediaProps extends AudioHTMLAttributes, VideoHTMLAttributes {
    src: string;
}
interface HTMLMediaState {
    buffered: any[];
    duration: number;
    paused: boolean;
    muted: boolean;
    time: number;
    volume: number;
    controls: boolean;
    autoplay: boolean;
}
interface HTMLMediaControls {
    play: () => Promise<void> | void;
    pause: () => void;
    mute: () => void;
    unmute: () => void;
    volume: (volume: number) => void;
    seek: (time: number) => void;
    toggle: (controls?: boolean) => void;
    autoplay: (autoplay: boolean) => void;
    change: (src: string) => void;
}

declare const useAudio: (elOrProps: HTMLMediaProps | VNode<HTMLMediaProps, RendererElement, {
    [key: string]: any;
}>) => [() => VNode<HTMLMediaProps, RendererElement, {
    [key: string]: any;
}>, ComputedRef<HTMLMediaState>, HTMLMediaControls, Ref<HTMLAudioElement | null>];

declare const useVideo: (elOrProps: HTMLMediaProps | VNode<HTMLMediaProps, RendererElement, {
    [key: string]: any;
}>) => [() => VNode<HTMLMediaProps, RendererElement, {
    [key: string]: any;
}>, ComputedRef<HTMLMediaState>, HTMLMediaControls, Ref<HTMLAudioElement | null>];

interface SpeechState {
    isPlaying: boolean;
    lang: string;
    voice: SpeechSynthesisVoice;
    rate: number;
    pitch: number;
    volume: number;
}
interface SpeechOptions {
    lang?: string;
    voice?: SpeechSynthesisVoice;
    rate?: number;
    pitch?: number;
    volume?: number;
}
declare const useSpeech: (text: string, opts?: SpeechOptions) => SpeechState;

declare const useClickAway: <E extends Event = Event>(ref: Ref<HTMLElement | null>, onClickAway: (event: E) => void, events?: string[]) => void;

interface DropAreaState$1 {
    over: boolean;
}
interface DropAreaOptions$1 {
    ref?: Ref<HTMLElement>;
    onFiles?: (files: File[], event?: Event) => void;
    onText?: (text: string, event?: Event) => void;
    onUri?: (url: string, event?: Event) => void;
}
declare const useDrop: (options?: DropAreaOptions$1, args?: never[]) => Readonly<DropAreaState$1>;

interface DropAreaState {
    over: boolean;
}
interface DropAreaBond {
    onDragover: DragEventHandler;
    onDragenter: DragEventHandler;
    onDragleave: DragEventHandler;
    onDrop: DragEventHandler;
    onPaste: ClipboardEventHandler;
}
interface DropAreaOptions {
    onFiles?: (files: File[], event?: Event) => void;
    onText?: (text: string, event?: Event) => void;
    onUri?: (url: string, event?: Event) => void;
}
declare const useDropArea: (options?: DropAreaOptions) => [DropAreaBond, Readonly<DropAreaState>];

interface FullScreenOptions {
    video?: Ref<HTMLVideoElement & {
        webkitEnterFullscreen?: () => void;
        webkitExitFullscreen?: () => void;
    }>;
    onClose?: (error?: Error) => void;
}
declare const useFullscreen: (ref: Ref<Element>, enabled: Ref<boolean>, options?: FullScreenOptions) => ComputedRef<boolean>;

declare const useCookie: (cookieName: string) => [ComputedRef<string | null>, (newValue: string, options?: Cookies.CookieAttributes | undefined) => void, () => void];

declare type UseTimeoutReturn = [ComputedRef<boolean | null>, () => void, () => void];
declare function useTimeout(ms?: number | Ref<number>): UseTimeoutReturn;

declare type UseTimeoutFnReturn = [ComputedRef<boolean | null>, () => void, () => void];
declare function useTimeoutFn(fn: Function | Ref<Function>, ms?: number | Ref<number>): UseTimeoutFnReturn;

declare const useInterval: (callback: Function | Ref<Function>, delay?: number | Ref<number> | undefined) => void;

declare const useHarmonicIntervalFn: (fn: Function, delay?: number | Ref<number> | null) => void;

declare type MultiWatchSources$1 = (WatchSource<unknown> | object)[];
declare function useEffect(fn: () => (void | (() => void)), deps?: MultiWatchSources$1 | WatchSource | null | undefined): void;

declare const useSpring: (targetValue?: number | Ref<number>, tension?: number | Ref<number>, friction?: number | Ref<number>) => Ref<number>;

interface ListenerType1 {
    addEventListener(name: string, handler: (event?: any) => void, ...args: any[]): any;
    removeEventListener(name: string, handler: (event?: any) => void, ...args: any[]): any;
}
interface ListenerType2 {
    on(name: string, handler: (event?: any) => void, ...args: any[]): any;
    off(name: string, handler: (event?: any) => void, ...args: any[]): any;
}
declare type UseEventTarget = ListenerType1 | ListenerType2;
declare type AddEventListener<T> = T extends ListenerType1 ? T['addEventListener'] : T extends ListenerType2 ? T['on'] : never;
declare const useEvent: <T extends UseEventTarget>(name: Parameters<AddEventListener<T>>[0], handler?: Parameters<AddEventListener<T>>[1] | Ref<Parameters<AddEventListener<T>>[1]> | null | undefined, target?: Window | T | Ref<T> | null, options?: Parameters<AddEventListener<T>>[2] | undefined) => void;

declare type KeyFilter = null | undefined | Ref<string> | string | ((event: KeyboardEvent) => boolean);
declare type Handler = (event: KeyboardEvent) => void;
interface UseKeyOptions {
    event?: 'keydown' | 'keypress' | 'keyup';
    target?: UseEventTarget;
    options?: any;
}
declare const useKey: (key: KeyFilter, fn?: Handler, opts?: UseKeyOptions) => void;

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
            type: String,
        },
        target: {
            Object
        },
        options: {
            Object
        },
    },
    setup(props) {
        return {};
    }
};

/**
 * @desc Made compatible with {GeolocationPositionError} and {PositionError} cause
 * PositionError been renamed to GeolocationPositionError in typescript 4.1.x and making
 * own compatible interface is most easiest way to avoid errors.
 */
interface IGeolocationPositionError {
    readonly code: number;
    readonly message: string;
    readonly PERMISSION_DENIED: number;
    readonly POSITION_UNAVAILABLE: number;
    readonly TIMEOUT: number;
}
interface GeoLocationSensorState {
    loading: boolean;
    accuracy: number | null;
    altitude: number | null;
    altitudeAccuracy: number | null;
    heading: number | null;
    latitude: number | null;
    longitude: number | null;
    speed: number | null;
    timestamp: number | null;
    error?: Error | IGeolocationPositionError;
}
declare const useGeolocation: (options?: PositionOptions | undefined) => Readonly<GeoLocationSensorState>;

declare const useIdle: (ms?: number, initialState?: boolean, events?: string[]) => ComputedRef<boolean>;

declare type Element$1 = ((state: Ref<boolean>) => VNode<any>) | VNode<any>;
declare const useHover: (element: Element$1) => [VNode<any>, ComputedRef<boolean>];

declare const useHoverDirty: (ref: Ref<Element>, enabled?: boolean | Ref<boolean>) => ComputedRef<boolean>;

/**
 * read and write url hash, response to url hash change
 */
declare function useHash(): [Ref<string>, (hash: string) => void];

declare const useIntersection: (ref: Ref<HTMLElement>, options: IntersectionObserverInit | Ref<IntersectionObserverInit>) => ComputedRef<IntersectionObserverEntry | null> | null;

declare const useKeyPress: (keyFilter: KeyFilter) => [ComputedRef<boolean>, ComputedRef<null | KeyboardEvent>];

declare const useKeyPressEvent: (key: string | KeyFilter, keydown?: Handler | null | undefined, keyup?: Handler | null | undefined, useKeyPress?: (keyFilter: KeyFilter) => [ComputedRef<boolean>, ComputedRef<KeyboardEvent | null>]) => void;

declare const useKeyboardJs: (combination: string | string[]) => [ComputedRef<boolean>, ComputedRef<null | KeyboardEvent>];

declare function useMounted(fn: () => void): void;

interface LocationSensorState {
    trigger: string;
    state?: any;
    length?: number;
    hash?: string;
    host?: string;
    hostname?: string;
    href?: string;
    origin?: string;
    pathname?: string;
    port?: string;
    protocol?: string;
    search?: string;
}
declare const _default$6: (() => LocationSensorState) | (() => ComputedRef<LocationSensorState>);

interface Options$1 {
    isPreventDefault?: boolean | Ref<boolean>;
    delay?: number | Ref<number>;
}
declare const useLongPress: (callback: (e: TouchEvent | MouseEvent) => void | Ref<(e: TouchEvent | MouseEvent) => void>, options?: Options$1) => {
    readonly onMousedown: (e: any) => void;
    readonly onTouchstart: (e: any) => void;
    readonly onMouseup: () => void;
    readonly onMouseleave: () => void;
    readonly onTouchend: () => void;
};

interface BatteryState {
    charging: boolean;
    chargingTime: number;
    dischargingTime: number;
    level: number;
}
declare type UseBatteryState = {
    isSupported: false;
} | {
    isSupported: true;
    fetched: false;
} | (BatteryState & {
    isSupported: true;
    fetched: true;
});
declare function useBattery(): Readonly<UseBatteryState>;
declare const _default$5: typeof useBattery;

declare function useReactive<T extends Object>(initialState?: T | (() => T)): [T, (patch: Partial<T> | ((prevState: T) => Partial<T>)) => void];

declare function useReadonly<T extends Object>(initialState?: T | (() => T)): [Readonly<T>, (patch: Partial<T> | ((prevState: T) => Partial<T>)) => void];

declare type Dispatch<T> = (value: T) => void;
interface StateMediator<S = any> {
    (newState: any): S;
    (newState: any, dispatch: Dispatch<SetStateAction<S>>): void;
}
declare type UseMediatedStateReturn<S = any> = [Ref<S>, Dispatch<SetStateAction<S>>];
declare function useMediatedState<S = undefined>(mediator: StateMediator<S | undefined>): UseMediatedStateReturn<S | undefined>;
declare function useMediatedState<S = any>(mediator: StateMediator<S>, initialState: S): UseMediatedStateReturn<S>;
declare function useMediatedState<S = any>(mediator: StateMediator<S>, initialState?: S): UseMediatedStateReturn<S>;

declare function useReducer<R extends (Reducer<any, any> | ReducerWithoutAction<any>)>(reducer: R, initialState: ReducerState<R>, initializer?: (arg: ReducerState<R>) => ReducerState<R>): [ComputedRef<ReducerState<R>>, Dispatch$1<ReducerAction<R>> | DispatchWithoutAction];

declare type CreateMethods<M, T> = (state: T) => {
    [P in keyof M]: (payload?: any) => T;
};
declare type WrappedMethods<M> = {
    [P in keyof M]: (...payload: any) => void;
};
declare const useMethods: <M, T>(createMethods: CreateMethods<M, T>, initialState: T) => [ComputedRef<T>, WrappedMethods<M>];

interface State$5 {
    isSliding: boolean;
    value: number;
}
interface Options {
    onScrub: (value: number) => void;
    onScrubStart: () => void;
    onScrubStop: (value: number) => void;
    reverse: boolean;
    vertical?: boolean;
}
declare const useSlider: (ref: Ref<HTMLElement>, options?: Partial<Options>) => State$5;

declare type UseDebounceReturn = [ComputedRef<boolean | null>, () => void];
declare function useDebounce(fn: Function, ms?: number, deps?: any[]): UseDebounceReturn;

declare const useFavicon: (href: string | Ref<string>) => void;

declare type parserOptions<T> = {
    raw: true;
} | {
    raw: false;
    serializer: (value: T) => string;
    deserializer: (value: string) => T;
};
declare function useLocalStorage<T>(key: string, initialValue?: T, options?: parserOptions<T>): ((() => void) | ComputedRef<(T extends Ref<infer V> ? V : T) | undefined>)[] | (ComputedRef<T | undefined> | Dispatch$1<SetStateAction<T | undefined>>)[];

declare const _default$4: (_locked?: boolean | Ref<boolean>, _elementRef?: Ref<HTMLElement> | undefined) => void;

declare type PermissionDesc = PermissionDescriptor | DevicePermissionDescriptor | MidiPermissionDescriptor | PushPermissionDescriptor;
declare type State$4 = PermissionState | '';
declare const usePermission: (permissionDesc: PermissionDesc) => Ref<State$4>;

declare type RafLoopReturns = [() => void, () => void, ComputedRef<boolean>];
declare function useRafLoop(callback: FrameRequestCallback, initiallyActive?: boolean): RafLoopReturns;

declare const useSessionStorage: <T>(key: string, initialValue?: T | undefined, raw?: boolean | undefined) => [Ref<T>, (value: T) => void];

declare const useThrottleFn: <T, U extends any[]>(fn: (...args: U) => T, ms: number | undefined, args: U) => Ref<T | null>;

declare const useThrottle: <T>(value: T, ms?: number) => Ref<T>;

interface CounterActions {
    inc: (delta?: number) => void;
    dec: (delta?: number) => void;
    get: () => number;
    set: (value: IHookStateSetAction<number>) => void;
    reset: (value?: IHookStateSetAction<number>) => void;
}
declare function useCounter(initialValue?: Ref<number> | IHookStateInitAction<number>, max?: Ref<number> | number | null, min?: Ref<number> | number | null): [ComputedRef<number>, CounterActions];

interface UseTitleOptions {
    restoreOnUnmount?: boolean;
}
declare function useTitle(title: string, options?: UseTitleOptions): void;
declare const _default$3: typeof useTitle;

declare function useRaf(ms?: number | Ref<number>, delay?: number | Ref<number>): ComputedRef<number>;

declare function useCss(css: object | Ref<object>): string;

declare const useTween: (easingName?: string, ms?: number, delay?: number) => ComputedRef<number>;

declare function createGlobalState<S = any>(initialState: IHookStateInitAction<S>): () => [Ref<S>, (state: IHookStateSetAction<S>) => void];
declare function createGlobalState<S = undefined>(): () => [
    Ref<S>,
    (state: IHookStateSetAction<S>) => void
];

declare function useDefault<T>(defaultValue: T, initialValue: T | (() => T)): readonly [Ref<T | null | undefined>, (prevState: SetStateAction<T | null | undefined>) => void];

declare function useRafState<S>(initialState: S | (() => S)): [Ref<S>, Dispatch$1<SetStateAction<S>>];

declare function useRafReactive<S extends Object>(initialState: S | (() => S)): [S, Dispatch$1<SetStateAction<S>>];

interface UseStateListReturn<T> {
    state: ComputedRef<T>;
    currentIndex: number;
    setStateAt: (newIndex: number) => void;
    setState: (state: T) => void;
    next: () => void;
    prev: () => void;
}
declare function useStateList<T>(stateSet?: T[] | Ref<T[]>): UseStateListReturn<T>;

declare type ValidityState = [boolean | undefined, ...any[]] | [undefined];
interface StateValidator<V, S> {
    (state: S): V;
    (state: S, dispatch: Dispatch$1<SetStateAction<V>>): void;
}
declare type UseStateValidatorReturn<V> = [Readonly<V>, () => void];
declare function useStateValidator<V extends ValidityState, S>(state: S, validator: StateValidator<V, S>, initialState?: V): UseStateValidatorReturn<V>;

declare type MultiStateValidatorStates = any[] | {
    [p: string]: any;
} | {
    [p: number]: any;
};
declare type MultiStateValidator<V extends ValidityState, S extends MultiStateValidatorStates> = StateValidator<V, S>;
declare function useMultiStateValidator<V extends ValidityState, S extends MultiStateValidatorStates>(states: S, validator: MultiStateValidator<V, S>, initialValidity?: V): UseStateValidatorReturn<V>;

declare type UseMeasureRect = Pick<DOMRectReadOnly, 'x' | 'y' | 'top' | 'left' | 'right' | 'bottom' | 'height' | 'width'>;
declare type UseMeasureRef<E extends Element = Element> = (element: E) => void;
declare type UseMeasureResult<E extends Element = Element> = [UseMeasureRef<E>, UseMeasureRect];
declare function useMeasure<E extends Element = Element>(): UseMeasureResult<E>;
declare const _default$2: typeof useMeasure;

declare function useMedia(query: string | Ref<string>, defaultState?: boolean): ComputedRef<boolean>;

declare const _default$1: () => {};

interface MotionSensorState {
    acceleration: {
        x: number | null;
        y: number | null;
        z: number | null;
    };
    accelerationIncludingGravity: {
        x: number | null;
        y: number | null;
        z: number | null;
    };
    rotationRate: {
        alpha: number | null;
        beta: number | null;
        gamma: number | null;
    };
    interval: number | null;
}
declare const useMotion: (initialState?: MotionSensorState) => (MotionSensorState | (() => Promise<unknown> | undefined))[];

interface State$3 {
    docX: number;
    docY: number;
    posX: number;
    posY: number;
    elX: number;
    elY: number;
    elH: number;
    elW: number;
}
declare const useMouse: (ref: Ref<Element | null>) => ComputedRef<State$3>;

interface UseMouseHoveredOptions {
    whenHovered?: boolean | Ref<boolean>;
    bound?: boolean | Ref<boolean>;
}
declare const useMouseHovered: (ref: Ref<Element>, options?: UseMouseHoveredOptions) => ComputedRef<State$3>;

declare function useMouseWheel(): Ref<number>;

interface INetworkInformation extends EventTarget {
    readonly downlink: number;
    readonly downlinkMax: number;
    readonly effectiveType: 'slow-2g' | '2g' | '3g' | '4g';
    readonly rtt: number;
    readonly saveData: boolean;
    readonly type: 'bluetooth' | 'cellular' | 'ethernet' | 'none' | 'wifi' | 'wimax' | 'other' | 'unknown';
    onChange: (event: Event) => void;
}
interface IUseNetworkState {
    /**
     * @desc Whether browser connected to the network or not.
     */
    online: boolean | undefined;
    /**
     * @desc Previous value of `online` property. Helps to identify if browser
     * just connected or lost connection.
     */
    previous: boolean | undefined;
    /**
     * @desc The {Date} object pointing to the moment when state change occurred.
     */
    since: Date | undefined;
    /**
     * @desc Effective bandwidth estimate in megabits per second, rounded to the
     * nearest multiple of 25 kilobits per seconds.
     */
    downlink: INetworkInformation['downlink'] | undefined;
    /**
     * @desc Maximum downlink speed, in megabits per second (Mbps), for the
     * underlying connection technology
     */
    downlinkMax: INetworkInformation['downlinkMax'] | undefined;
    /**
     * @desc Effective type of the connection meaning one of 'slow-2g', '2g', '3g', or '4g'.
     * This value is determined using a combination of recently observed round-trip time
     * and downlink values.
     */
    effectiveType: INetworkInformation['effectiveType'] | undefined;
    /**
     * @desc Estimated effective round-trip time of the current connection, rounded
     * to the nearest multiple of 25 milliseconds
     */
    rtt: INetworkInformation['rtt'] | undefined;
    /**
     * @desc {true} if the user has set a reduced data usage option on the user agent.
     */
    saveData: INetworkInformation['saveData'] | undefined;
    /**
     * @desc The type of connection a device is using to communicate with the network.
     * It will be one of the following values:
     *  - bluetooth
     *  - cellular
     *  - ethernet
     *  - none
     *  - wifi
     *  - wimax
     *  - other
     *  - unknown
     */
    type: INetworkInformation['type'] | undefined;
}
declare function useNetworkState(initialState?: IHookStateInitAction<IUseNetworkState>): IUseNetworkState;

interface OrientationState {
    angle: number;
    type: string;
}
declare function useOrientation(initialState?: OrientationState): OrientationState;

declare const usePageLeave: (onPageLeave: any, args?: never[]) => void;

interface ScratchSensorParams {
    disabled?: boolean;
    onScratch?: (state: ScratchSensorState) => void;
    onScratchStart?: (state: ScratchSensorState) => void;
    onScratchEnd?: (state: ScratchSensorState) => void;
}
interface ScratchSensorState {
    isScratching: boolean;
    start?: number;
    end?: number;
    x?: number;
    y?: number;
    dx?: number;
    dy?: number;
    docX?: number;
    docY?: number;
    posX?: number;
    posY?: number;
    elH?: number;
    elW?: number;
    elX?: number;
    elY?: number;
}
declare function useScratch(params?: ScratchSensorParams): [(el: HTMLElement | null) => void, ComputedRef<ScratchSensorState>];

interface State$2 {
    x: number;
    y: number;
}
declare function useScroll(ref: Ref<HTMLElement>): Readonly<State$2>;

declare const useScrolling: (ref: Ref<HTMLElement>) => Readonly<Ref<boolean>>;

declare type UseQueryParam = (param: string | Ref<string>) => Ref<string | null>;
declare const _default: UseQueryParam | (() => null);

interface State$1 {
    width: number;
    height: number;
}
declare const useSize: ({ width, height }?: Partial<State$1>) => [VNode<any>, Readonly<State$1>];

declare const useStartTyping: (onStartTyping: (event: KeyboardEvent) => void) => void;

interface State {
    x: number;
    y: number;
}
declare const useWindowScroll: () => State;

declare const useWindowSize: (initialWidth?: number, initialHeight?: number) => {
    width: number;
    height: number;
};

declare type MultiWatchSources = (WatchSource<unknown> | object)[];
declare function useMemo<T>(factory: () => T, deps?: MultiWatchSources | WatchSource | null | undefined): Ref<T>;

declare type Breakpoints = {
    [name: string]: number;
};
declare function useBreakpoint(breakpoints?: Breakpoints | Ref<Breakpoints>): Ref<string>;

export { Dispatch$1 as Dispatch, Reducer, SetStateAction, UseKey, UseStateValidatorReturn, ValidityState, createGlobalState, off, on, sources, useAsync, useAsyncFn, useAsyncRetry, useAudio, _default$5 as useBattery, useBeforeUnload, useToggle as useBoolean, useBreakpoint, useClickAway, useComputedSetState, useComputedState, useCookie, useCopyToClipboard, useCounter, useCss, useDebounce, useDefault, useDrop, useDropArea, useEffect, useEvent, useFavicon, useFullscreen, useGeolocation, useGetSet, useHarmonicIntervalFn, useHash, useHover, useHoverDirty, useIdle, useIntersection, useInterval, useKey, useKeyPress, useKeyPressEvent, useKeyboardJs, useList, useLocalStorage, _default$6 as useLocation, _default$4 as useLockBodyScroll, useLongPress, useMap, _default$2 as useMeasure, useMedia, _default$1 as useMediaDevices, useMediatedState, useMemo, useMethods, useMotion, useMounted, useMountedState, useMouse, useMouseHovered, useMouseWheel, useMultiStateValidator, useNetworkState, useOrientation, usePageLeave, usePermission, useQueue, useRaf, useRafLoop, useRafReactive, useRafState, useReactive, useReadonly, useReducer, useScratch, useScroll, useScrolling, _default as useSearchParam, useSessionStorage, useSet, useSetState, useSize, useSlider, useSpeech, useSpring, useStartTyping, useState, useStateList, useStateValidator, useThrottle, useThrottleFn, useTimeout, useTimeoutFn, _default$3 as useTitle, useToggle, useTween, useVideo, useWindowScroll, useWindowSize };
//# sourceMappingURL=vue-next-use.d.ts.map
