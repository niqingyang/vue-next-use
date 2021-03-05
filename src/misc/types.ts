export type PromiseType<P extends Promise<any>> = P extends Promise<infer T> ? T : never;

export type FunctionReturningPromise = (...args: any[]) => Promise<any>;

export type SetStateAction<S> = S | ((prevState: S) => S);

// NOTE: callbacks are _only_ allowed to return either void, or a destructor.
// The destructor is itself only allowed to return void.
export type EffectCallback = () => (void | (() => void | undefined));

// TODO (TypeScript 3.0): ReadonlyArray<unknown>
export type DependencyList = ReadonlyArray<any>;

export type EventHandler<E> = { bivarianceHack(event: E): void }["bivarianceHack"];

export type ClipboardEventHandler = EventHandler<ClipboardEvent>;
export type DragEventHandler = EventHandler<DragEvent>;
