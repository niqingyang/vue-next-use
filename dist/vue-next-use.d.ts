import { Ref, UnwrapRef, ComputedRef, AudioHTMLAttributes, VideoHTMLAttributes, VNode, RendererElement, WatchSource } from 'vue';

declare function on<T extends Window | Document | HTMLElement | EventTarget>(obj: T | null, ...args: Parameters<T['addEventListener']> | [string, Function | null, ...any]): void;
declare function off<T extends Window | Document | HTMLElement | EventTarget>(obj: T | null, ...args: Parameters<T['removeEventListener']> | [string, Function | null, ...any]): void;

declare type PromiseType<P extends Promise<any>> = P extends Promise<infer T> ? T : never;
declare type FunctionReturningPromise = (...args: any[]) => Promise<any>;
declare type SetStateAction<S> = S | ((prevState: S) => S);
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
    Ref<UnwrapRef<StateFromFunctionReturningPromise<T>>>,
    T
];
declare function useAsyncFn<T extends FunctionReturningPromise>(fn: T, initialState?: StateFromFunctionReturningPromise<T>): AsyncFnReturn<T>;

declare function useAsync<T extends FunctionReturningPromise>(fn: T, deps?: any[]): Ref<{
    loading: boolean;
    error?: undefined;
    value?: undefined;
} | {
    loading: false;
    error: {
        name: string;
        message: string;
        stack?: string | undefined;
    };
    value?: undefined;
} | {
    loading: true;
    error?: {
        name: string;
        message: string;
        stack?: string | undefined;
    } | undefined;
    value?: UnwrapRef<PromiseType<ReturnType<T>>> | undefined;
} | {
    loading: false;
    error?: undefined;
    value: UnwrapRef<PromiseType<ReturnType<T>>>;
}>;

declare function useAsyncRetry<T>(fn: () => Promise<T>, deps?: any[]): [Ref<UnwrapRef<AsyncState<T>>>, () => void];

declare function useState<T>(initialState: T | (() => T)): [Ref<T>, (prevState: SetStateAction<T>) => void];

declare const useBeforeUnload: (enabled?: boolean | (() => boolean), message?: string | undefined) => void;

interface QueueMethods<T> {
    add: (item: T) => void;
    remove: () => T | undefined;
    first: ComputedRef<UnwrapRef<T>>;
    last: ComputedRef<UnwrapRef<T>>;
    size: ComputedRef<UnwrapRef<number>>;
}
declare const useQueue: <T>(initialValue?: T[]) => QueueMethods<T>;

declare type IHookStateInitialSetter<S> = () => S;
declare type IHookStateInitAction<S> = S | IHookStateInitialSetter<S>;
declare type IHookStateSetter<S> = ((prevState: S) => S) | (() => S);
declare type IHookStateSetAction<S> = S | IHookStateSetter<S>;

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
declare function useList<T>(initialList?: IHookStateInitAction<T[]>): [Ref<T[]>, ListActions<T>];

interface StableActions$1<T extends object> {
    set: <K extends keyof T>(key: K, value: T[K]) => void;
    setAll: (newMap: T) => void;
    remove: <K extends keyof T>(key: K) => void;
    reset: () => void;
}
interface Actions$1<T extends object> extends StableActions$1<T> {
    get: <K extends keyof T>(key: K) => T[K];
}
declare const useMap: <T extends object = any>(initialMap?: T) => [Ref<T>, Actions$1<T>];

declare const useSetState: <T extends object>(initialState?: T) => [Ref<T>, (patch: Partial<T> | ((prevState: T) => Partial<T>)) => void];

declare function useMountedState(): () => boolean;

interface CopyToClipboardState {
    value?: string;
    noUserInteraction: boolean;
    error?: Error;
}
declare const useCopyToClipboard: () => [Ref<CopyToClipboardState>, (value: string) => void];

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
}

declare const useAudio: (elOrProps: HTMLMediaProps | VNode<HTMLMediaProps, RendererElement, {
    [key: string]: any;
}>) => [VNode<HTMLMediaProps, RendererElement, {
    [key: string]: any;
}>, Ref<HTMLMediaState>, HTMLMediaControls, Ref<HTMLAudioElement | null>];

declare const useVideo: (elOrProps: HTMLMediaProps | VNode<HTMLMediaProps, RendererElement, {
    [key: string]: any;
}>) => [VNode<HTMLMediaProps, RendererElement, {
    [key: string]: any;
}>, Ref<HTMLMediaState>, HTMLMediaControls, Ref<HTMLAudioElement | null>];

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
declare const useSpeech: (text: string, opts?: SpeechOptions) => Ref<SpeechState>;

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
declare const useDrop: (options?: DropAreaOptions$1, args?: never[]) => Ref<DropAreaState$1>;

interface DropAreaState {
    over: boolean;
}
interface DropAreaBond {
    onDragOver: DragEventHandler;
    onDragEnter: DragEventHandler;
    onDragLeave: DragEventHandler;
    onDrop: DragEventHandler;
    onPaste: ClipboardEventHandler;
}
interface DropAreaOptions {
    onFiles?: (files: File[], event?: Event) => void;
    onText?: (text: string, event?: Event) => void;
    onUri?: (url: string, event?: Event) => void;
}
declare const useDropArea: (options?: DropAreaOptions) => [DropAreaBond, Ref<DropAreaState>];

interface FullScreenOptions {
    video?: Ref<HTMLVideoElement & {
        webkitEnterFullscreen?: () => void;
        webkitExitFullscreen?: () => void;
    }>;
    onClose?: (error?: Error) => void;
}
declare const useFullscreen: (ref: Ref<Element>, enabled: Ref<boolean>, options?: FullScreenOptions) => ComputedRef<boolean>;

declare const useCookie: (cookieName: string) => [Ref<string | null>, (newValue: string, options?: any) => void, () => void];

declare type UseTimeoutReturn = [ComputedRef | null, () => void, () => void];
declare function useTimeout(ms?: number | Ref<number>): UseTimeoutReturn;

declare type UseTimeoutFnReturn = [ComputedRef | null, () => void, () => void];
declare function useTimeoutFn(fn: Function | Ref<Function>, ms?: number | Ref<number>): UseTimeoutFnReturn;

declare const useInterval: (callback: Function | Ref<Function>, delay?: number | Ref<number> | undefined) => void;

declare const useHarmonicIntervalFn: (fn: Function, delay?: number | Ref<number> | null) => void;

declare type MultiWatchSources = (WatchSource<unknown> | object)[];
declare function useEffect(fn: () => (void | (() => void)), deps?: MultiWatchSources | WatchSource | null | undefined): void;

declare const useSpring: (targetValue?: number | Ref<number>, tension?: number | Ref<number>, friction?: number | Ref<number>) => Ref<number>;

export { off, on, useAsync, useAsyncFn, useAsyncRetry, useAudio, useBeforeUnload, useToggle as useBoolean, useClickAway, useCookie, useCopyToClipboard, useDrop, useDropArea, useEffect, useFullscreen, useGetSet, useHarmonicIntervalFn, useInterval, useList, useMap, useMountedState, useQueue, useSet, useSetState, useSpeech, useSpring, useState, useTimeout, useTimeoutFn, useToggle, useVideo };
//# sourceMappingURL=vue-next-use.d.ts.map
