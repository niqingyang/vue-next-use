import { WatchSource } from 'vue';

export type PromiseType<P extends Promise<any>> = P extends Promise<infer T> ? T : never;

export type FunctionReturningPromise = (...args: any[]) => Promise<any>;

// Unlike the class component setState, the updates are not allowed to be partial
export type SetStateAction<S> = S | ((prevState: S) => S);
// this technically does accept a second argument, but it's already under a deprecation warning
// and it's not even released so probably better to not define it.
export type Dispatch<A> = (value: A) => void;
// Since action _can_ be undefined, dispatch may be called without any parameters.
export type DispatchWithoutAction = () => void;
// Unlike redux, the actions _can_ be anything
export type Reducer<S, A> = (prevState: S, action: A) => S;
// If useReducer accepts a reducer without action, dispatch may be called without any parameters.
export type ReducerWithoutAction<S> = (prevState: S) => S;
// types used to try and prevent the compiler from reducing S
// to a supertype common with the second argument to useReducer()
export type ReducerState<R extends Reducer<any, any>> = R extends Reducer<infer S, any> ? S : never;
export type ReducerAction<R extends Reducer<any, any>> = R extends Reducer<any, infer A> ? A : never;
// The identity check is done with the SameValue algorithm (Object.is), which is stricter than ===
export type ReducerStateWithoutAction<R extends ReducerWithoutAction<any>> = R extends ReducerWithoutAction<infer S> ? S : never;

// NOTE: callbacks are _only_ allowed to return either void, or a destructor.
// The destructor is itself only allowed to return void.
export type EffectCallback = () => (void | (() => void | undefined));

declare type MultiWatchSources = (WatchSource<unknown> | object)[];

// TODO (TypeScript 3.0): ReadonlyArray<unknown>
export type DependencyList = MultiWatchSources | WatchSource;

export type EventHandler<E> = { bivarianceHack(event: E): void }["bivarianceHack"];

export type ClipboardEventHandler = EventHandler<ClipboardEvent>;
export type DragEventHandler = EventHandler<DragEvent>;
