import { isRef, isReactive, WatchSource } from "vue";

export const noop = () => {
};

export function on<T extends Window | Document | HTMLElement | EventTarget>(
    obj: T | null,
    ...args: Parameters<T['addEventListener']> | [string, Function | null, ...any]
): void {
    if (obj && obj.addEventListener) {
        obj.addEventListener(...(args as Parameters<HTMLElement['addEventListener']>));
    }
}

export function off<T extends Window | Document | HTMLElement | EventTarget>(
    obj: T | null,
    ...args: Parameters<T['removeEventListener']> | [string, Function | null, ...any]
): void {
    if (obj && obj.removeEventListener) {
        obj.removeEventListener(...(args as Parameters<HTMLElement['removeEventListener']>));
    }
}

export const isBrowser = typeof window !== 'undefined';

export const isNavigator = typeof navigator !== 'undefined';

export const isWatchSource = (target: any) => {
    // A watch source can only be a getter/effect function, a ref, a reactive object, or an array of these types.
    if (isRef(target) || isReactive(target) || target instanceof Function) {
        return true;
    }
    return false;
}

declare type MultiWatchSources = (WatchSource<unknown> | object)[];

/**
 * filter watch sources
 * @param target 
 * @returns 
 */
export const sources = (target: any): (MultiWatchSources | WatchSource | null) => {

    const deps: any[] = [];

    if (Array.isArray(target)) {
        target.forEach((item) => {
            if (isWatchSource(item)) {
                deps.push(item);
            }
        });
        return deps.length > 0 ? deps : null;
    }

    if (isWatchSource(target)) {
        return target;
    }

    return null;
}