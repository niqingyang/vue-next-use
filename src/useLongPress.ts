import {Ref, ref as useRef, unref} from 'vue';
import {off, on} from './misc/util';
import {useTimeoutFn} from "./index";

interface Options {
    isPreventDefault?: boolean | Ref<boolean>;
    delay?: number | Ref<number>;
}

const isTouchEvent = (ev: Event): ev is TouchEvent => {
    return 'touches' in ev;
};

const preventDefault = (ev: Event) => {
    if (!isTouchEvent(ev)) return;

    if (ev.touches.length < 2 && ev.preventDefault) {
        ev.preventDefault();
    }
};

const useLongPress = (
    callback: (e: TouchEvent | MouseEvent) => void | Ref<(e: TouchEvent | MouseEvent) => void>,
    options: Options = {isPreventDefault: true, delay: 300}
) => {
    const timeout = useRef<ReturnType<typeof setTimeout>>();
    const target = useRef<EventTarget>();

    const start = (event: TouchEvent | MouseEvent) => {
        // prevent ghost click on mobile devices
        if (unref(options.isPreventDefault) && event.target) {
            on(event.target, 'touchend', preventDefault, {passive: false});
            target.value = event.target;
        }
        timeout.value = setTimeout(() => unref(callback)(event), unref(options.delay));
    };

    const clear = () => {
        // clearTimeout and removeEventListener
        timeout.value && clearTimeout(timeout.value);

        if (unref(options.isPreventDefault) && target.value) {
            off(target.value, 'touchend', preventDefault);
        }
    };

    return {
        onMousedown: (e: any) => start(e),
        onTouchstart: (e: any) => start(e),
        onMouseup: clear,
        onMouseleave: clear,
        onTouchend: clear,
    } as const;
};

export default useLongPress;
