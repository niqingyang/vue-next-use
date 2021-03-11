import { computed, Ref, ComputedRef, unref } from 'vue';
import { useEffect, useState } from './index';
import { throttle } from 'throttle-debounce';
import { off, on, sources } from './misc/util';

const defaultEvents = ['mousemove', 'mousedown', 'resize', 'keydown', 'touchstart', 'wheel'];
const oneMinute = 60e3;

const useIdle = (
    ms: number = oneMinute,
    initialState: boolean = false,
    events: string[] = defaultEvents
): ComputedRef<boolean> => {
    const [state, setState] = useState<boolean>(initialState);

    useEffect(() => {
        let mounted = true;
        let timeout: any;
        let localState: boolean = state.value;
        const set = (newState: boolean) => {
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
        return state.value
    });
};

export default useIdle;