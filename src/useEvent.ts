import {isRef, Ref, unref} from 'vue';
import {useEffect} from './index';
import {isBrowser, off, on, sources} from './misc/util';

export interface ListenerType1 {
    addEventListener(name: string, handler: (event?: any) => void, ...args: any[]);

    removeEventListener(name: string, handler: (event?: any) => void, ...args: any[]);
}

export interface ListenerType2 {
    on(name: string, handler: (event?: any) => void, ...args: any[]);

    off(name: string, handler: (event?: any) => void, ...args: any[]);
}

export type UseEventTarget = ListenerType1 | ListenerType2;

const defaultTarget = isBrowser ? window : null;

const isListenerType1 = (target: any): target is ListenerType1 => {
    return !!target.addEventListener;
};
const isListenerType2 = (target: any): target is ListenerType2 => {
    return !!target.on;
};

type AddEventListener<T> = T extends ListenerType1
    ? T['addEventListener']
    : T extends ListenerType2
        ? T['on']
        : never;

const useEvent = <T extends UseEventTarget>(
    name: Parameters<AddEventListener<T>>[0],
    handler?: null | undefined | Parameters<AddEventListener<T>>[1] | Ref<Parameters<AddEventListener<T>>[1]>,
    target: null | T | Ref<T> | Window = defaultTarget,
    options?: Parameters<AddEventListener<T>>[2]
) => {
    useEffect(() => {
        if (!handler) {
            return;
        }
        if (!target) {
            return;
        }

        const element = unref(target);
        const fn = unref(handler);

        if (isListenerType1(element)) {
            on(element, name, fn, options);
        } else if (isListenerType2(element)) {
            element.on(name, fn, options);
        }
        return () => {
            if (isListenerType1(element)) {
                off(element, name, fn, options);
            } else if (isListenerType2(element)) {
                element.off(name, fn, options);
            }
        };
    }, sources([name, isRef(handler) ? handler : () => handler, target, JSON.stringify(options)]));
};

export default useEvent;