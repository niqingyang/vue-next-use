import {isRef, Ref, unref, watch} from 'vue';
import useEvent, {UseEventTarget} from './useEvent';
import {noop} from './misc/util';
import {useState} from "./index";

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
        : typeof keyFilter === 'string'
        ? (event: KeyboardEvent) => event.key === keyFilter
        : keyFilter
            ? () => true
            : () => false;

const useKey = (
    key: KeyFilter,
    fn: Handler = noop,
    opts: UseKeyOptions = {},
) => {
    const {event = 'keydown', target, options} = opts;
    const [predicate, setPredicate] = useState<KeyPredicate>(() => createKeyPredicate(unref(key)));

    if (isRef(key)) {
        watch(key, () => {
            setPredicate(() => createKeyPredicate(unref(key)));
        });
    }

    const handler: Handler = (handlerEvent) => {
        if (unref(predicate)(handlerEvent)) {
            return fn(handlerEvent);
        }
    };

    useEvent(event, handler, target, options);
};

export default useKey;