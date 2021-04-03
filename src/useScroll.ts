import {computed, ComputedRef, readonly, Ref} from 'vue';
import {useEffect, useRafReactive, useRafState} from './index';
import {off, on} from './misc/util';

export interface State {
    x: number;
    y: number;
}

export default function useScroll(ref: Ref<HTMLElement>): Readonly<State> {
    if (process.env.NODE_ENV === 'development') {
        if (typeof ref !== 'object' || typeof ref.value === 'undefined') {
            console.error('`useScroll` expects a single ref argument.');
        }
    }

    const [state, setState] = useRafReactive<State>({
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
};
