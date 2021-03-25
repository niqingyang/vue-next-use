import {computed, ComputedRef, isRef, Ref} from 'vue';
import {useRef, useState} from './index';
import {IHookStateInitAction, IHookStateSetAction, resolveHookState} from './misc/hookState';

export interface CounterActions {
    inc: (delta?: number) => void;
    dec: (delta?: number) => void;
    get: () => number;
    set: (value: IHookStateSetAction<number>) => void;
    reset: (value?: IHookStateSetAction<number>) => void;
}

export default function useCounter(
    initialValue: Ref<number> | IHookStateInitAction<number> = 0,
    max: Ref<number> | number | null = null,
    min: Ref<number> | number | null = null
): [ComputedRef<number>, CounterActions] {
    let init = isRef(initialValue) ? initialValue : useRef<number>(resolveHookState(initialValue));

    if (typeof init.value !== 'number') {
        console.error('initialValue has to be a number, got ' + typeof initialValue);
    }

    const minRef = useRef(min);
    const maxRef = useRef(max);

    if (typeof minRef.value === 'number') {
        init.value = Math.max(init.value as number, minRef.value);
    } else if (minRef.value !== null) {
        console.error('min has to be a number, got ' + typeof minRef.value);
    }

    if (typeof maxRef.value === 'number') {
        init.value = Math.min(init.value as number, maxRef.value);
    } else if (maxRef.value !== null) {
        console.error('max has to be a number, got ' + typeof maxRef.value);
    }

    const [current, setInternal] = useState<number>(init.value);

    const get = () => {
        return current.value;
    }

    const set = (newState: IHookStateSetAction<number>) => {
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
            inc: (delta: IHookStateSetAction<number> = 1) => {
                const rDelta = resolveHookState(delta, get());

                if (typeof rDelta !== 'number') {
                    console.error(
                        'delta has to be a number or function returning a number, got ' + typeof rDelta
                    );
                }

                set((num: number) => num + rDelta);
            },
            dec: (delta: IHookStateSetAction<number> = 1) => {
                const rDelta = resolveHookState(delta, get());

                if (typeof rDelta !== 'number') {
                    console.error(
                        'delta has to be a number or function returning a number, got ' + typeof rDelta
                    );
                }

                set((num: number) => num - rDelta);
            },
            reset: (value: Ref<number> | IHookStateSetAction<number> = initialValue) => {
                const rValue = isRef(value) ? value.value : resolveHookState(value, get());

                if (typeof rValue !== 'number') {
                    console.error(
                        'value has to be a number or function returning a number, got ' + typeof rValue
                    );
                }

                // eslint-disable-next-line react-hooks/exhaustive-deps
                init.value = rValue;
                set(rValue);
            },
        },
    ];
}
