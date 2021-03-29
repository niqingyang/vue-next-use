import {useEffect, useReactive, useReadonly, useState} from './index';
import {isBrowser, noop} from './misc/util';

export type UseMeasureRect = Pick<DOMRectReadOnly,
    'x' | 'y' | 'top' | 'left' | 'right' | 'bottom' | 'height' | 'width'>;
export type UseMeasureRef<E extends Element = Element> = (element: E) => void;
export type UseMeasureResult<E extends Element = Element> = [UseMeasureRef<E>, UseMeasureRect];

const defaultState: UseMeasureRect = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
};

function useMeasure<E extends Element = Element>(): UseMeasureResult<E> {
    const [element, ref] = useState<E | null>(null);
    const [rect, setRect] = useReadonly<UseMeasureRect>(defaultState);

    const observer = new (window as any).ResizeObserver((entries) => {
        if (entries[0]) {
            const {x, y, width, height, top, left, bottom, right} = entries[0].contentRect;
            setRect({x, y, width, height, top, left, bottom, right});
        }
    });

    useEffect(() => {
        if (!element) {
            return
        }
        observer.observe(element.value);
        return () => {
            observer.disconnect();
        };
    }, [element]);

    return [ref, rect];
}

export default isBrowser && typeof (window as any).ResizeObserver !== 'undefined'
    ? useMeasure
    : ((() => [noop, defaultState]) as typeof useMeasure);
