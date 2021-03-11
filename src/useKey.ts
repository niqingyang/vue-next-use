import { Ref, unref } from 'vue';
import useEvent, { UseEventTarget } from './useEvent';
import { noop } from './misc/util';

export type KeyPredicate = (event: KeyboardEvent) => boolean;
export type KeyFilter = null | undefined | Ref<string> | string | ((event: KeyboardEvent) => boolean);
export type Handler = (event: KeyboardEvent) => void;

export interface UseKeyOptions {
    event?: 'keydown' | 'keypress' | 'keyup';
    target?: UseEventTarget;
    options?: any;
}

const createKeyPredicate = (keyFilter: KeyFilter): KeyPredicate =>
    typeof keyFilter === 'function'
        ? keyFilter
        : typeof unref(keyFilter) === 'string'
            ? (event: KeyboardEvent) => event.key === keyFilter
            : keyFilter
                ? () => true
                : () => false;

const useKey = (
    key: KeyFilter,
    fn: Handler = noop,
    opts: UseKeyOptions = {},
) => {
    const { event = 'keydown', target, options } = opts;
    const handler = () => {
        const predicate: KeyPredicate = createKeyPredicate(unref(key));
        const handler: Handler = (handlerEvent) => {
            if (predicate(handlerEvent)) {
                return fn(handlerEvent);
            }
        };
        return handler;
    };
    useEvent(event, handler, target, options);
};

export default useKey;