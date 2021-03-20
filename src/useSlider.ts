import {Ref, ref as useRef, toRaw, watchEffect} from 'vue';
import {isBrowser, noop, off, on, sources} from './misc/util';
import useMountedState from './useMountedState';
import useSetState from './useSetState';
import {useEffect, useReactive} from "./index";

export interface State {
    isSliding: boolean;
    value: number;
}

export interface Options {
    onScrub: (value: number) => void;
    onScrubStart: () => void;
    onScrubStop: (value: number) => void;
    reverse: boolean;
    vertical?: boolean;
}

const useSlider = (ref: Ref<HTMLElement>, options: Partial<Options> = {}): State => {
    const isMounted = useMountedState();
    const isSliding = useRef(false);
    const valueRef = useRef(0);
    const frame = useRef(0);
    const [state, setState] = useReactive<State>({
        isSliding: false,
        value: 0,
    });

    valueRef.value = state.value;

    useEffect(() => {
        if (!isBrowser) {
            return;
        }

        const reverse = toRaw(options.reverse) === undefined ? false : toRaw(options.reverse);

        if (ref.value) {
            ref.value.style.userSelect = 'none';
        }

        const startScrubbing = () => {
            if (!isSliding.value && isMounted()) {
                (options.onScrubStart || noop)();
                isSliding.value = true;
                setState({isSliding: true});
                bindEvents();
            }
        };

        const stopScrubbing = () => {
            if (isSliding.value && isMounted()) {
                (options.onScrubStop || noop)(valueRef.value);
                isSliding.value = false;
                setState({isSliding: false});
                unbindEvents();
            }
        };

        const onMouseDown = (event: MouseEvent) => {
            startScrubbing();
            onMouseMove(event);
        };
        const onMouseMove = toRaw(options.vertical)
            ? (event: MouseEvent) => onScrub(event.clientY)
            : (event: MouseEvent) => onScrub(event.clientX);

        const onTouchStart = (event: TouchEvent) => {
            startScrubbing();
            onTouchMove(event);
        };
        const onTouchMove = toRaw(options.vertical)
            ? (event: TouchEvent) => onScrub(event.changedTouches[0].clientY)
            : (event: TouchEvent) => onScrub(event.changedTouches[0].clientX);

        const bindEvents = () => {
            on(document, 'mousemove', onMouseMove);
            on(document, 'mouseup', stopScrubbing);

            on(document, 'touchmove', onTouchMove);
            on(document, 'touchend', stopScrubbing);
        };

        const unbindEvents = () => {
            off(document, 'mousemove', onMouseMove);
            off(document, 'mouseup', stopScrubbing);

            off(document, 'touchmove', onTouchMove);
            off(document, 'touchend', stopScrubbing);
        };

        const onScrub = (clientXY: number) => {
            cancelAnimationFrame(frame.value);

            frame.value = requestAnimationFrame(() => {
                if (isMounted() && ref.value) {
                    const rect = ref.value.getBoundingClientRect();
                    const pos = toRaw(options.vertical) ? rect.top : rect.left;
                    const length = toRaw(options.vertical) ? rect.height : rect.width;

                    // Prevent returning 0 when element is hidden by CSS
                    if (!length) {
                        return;
                    }

                    let value = (clientXY - pos) / length;

                    if (value > 1) {
                        value = 1;
                    } else if (value < 0) {
                        value = 0;
                    }

                    if (reverse) {
                        value = 1 - value;
                    }

                    setState({
                        value,
                    });

                    (options.onScrub || noop)(value);
                }
            });
        };

        on(ref.value, 'mousedown', onMouseDown);
        on(ref.value, 'touchstart', onTouchStart);

        return () => {
            off(ref.value, 'mousedown', onMouseDown);
            off(ref.value, 'touchstart', onTouchStart);
        };
    }, sources([ref, options.vertical]));

    return state;
};

export default useSlider;