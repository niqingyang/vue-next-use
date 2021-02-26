export type PromiseType<P extends Promise<any>> = P extends Promise<infer T> ? T : never;

export type FunctionReturningPromise = (...args: any[]) => Promise<any>;

export type SetStateAction<S> = S | ((prevState: S) => S);

// NOTE: callbacks are _only_ allowed to return either void, or a destructor.
// The destructor is itself only allowed to return void.
export type EffectCallback = () => (void | (() => void | undefined));

// TODO (TypeScript 3.0): ReadonlyArray<unknown>
export type DependencyList = ReadonlyArray<any>;

export type EventHandler<E extends Event> = { bivarianceHack(event: E): void }["bivarianceHack"];

export type ClipboardEventHandler<T = Element> = EventHandler<ClipboardEvent>;
export type CompositionEventHandler<T = Element> = EventHandler<CompositionEvent>;
export type DragEventHandler<T = Element> = EventHandler<DragEvent>;
export type FocusEventHandler<T = Element> = EventHandler<FocusEvent>;
export type KeyboardEventHandler<T = Element> = EventHandler<KeyboardEvent>;
export type MouseEventHandler<T = Element> = EventHandler<MouseEvent>;
export type TouchEventHandler<T = Element> = EventHandler<TouchEvent>;
export type PointerEventHandler<T = Element> = EventHandler<PointerEvent>;
export type UIEventHandler<T = Element> = EventHandler<UIEvent>;
export type WheelEventHandler<T = Element> = EventHandler<WheelEvent>;
export type AnimationEventHandler<T = Element> = EventHandler<AnimationEvent>;
export type TransitionEventHandler<T = Element> = EventHandler<TransitionEvent>;