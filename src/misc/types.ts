import {
    AnimationEvent,
    ChangeEvent,
    ClipboardEvent,
    CompositionEvent,
    DragEvent,
    FocusEvent, FormEvent, KeyboardEvent, MouseEvent, PointerEvent,
    SyntheticEvent, TouchEvent, TransitionEvent, UIEvent, WheelEvent
} from "_@types_react@17.0.2@@types/react";

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
export type CompositionEventHandler = EventHandler<CompositionEvent>;
export type DragEventHandler = EventHandler<DragEvent>;
export type FocusEventHandler = EventHandler<FocusEvent>;
export type FormEventHandler = EventHandler<FormEvent>;
export type ChangeEventHandler = EventHandler<ChangeEvent>;
export type KeyboardEventHandler = EventHandler<KeyboardEvent>;
export type MouseEventHandler = EventHandler<MouseEvent>;
export type TouchEventHandler = EventHandler<TouchEvent>;
export type PointerEventHandler = EventHandler<PointerEvent>;
export type UIEventHandler = EventHandler<UIEvent>;
export type WheelEventHandler = EventHandler<WheelEvent>;
export type AnimationEventHandler = EventHandler<AnimationEvent>;
export type TransitionEventHandler = EventHandler<TransitionEvent>;
