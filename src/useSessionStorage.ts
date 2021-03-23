import {Ref, ref, watch} from "vue";
import {useEffect, useState} from './index';
import {isBrowser} from './misc/util';

const useSessionStorage = <T>(
    key: string,
    initialValue?: T,
    raw?: boolean
): [Ref<T>, (value: T) => void] => {
    if (!isBrowser) {
        return [ref(initialValue) as Ref<T>, () => {
            //
        }];
    }

    const [state, setState] = useState<T>(() => {
        try {
            const sessionStorageValue = sessionStorage.getItem(key);
            if (typeof sessionStorageValue !== 'string') {
                sessionStorage.setItem(key, raw ? String(initialValue) : JSON.stringify(initialValue));
                return initialValue;
            } else {
                return raw ? sessionStorageValue : JSON.parse(sessionStorageValue || 'null');
            }
        } catch {
            // If user is in private mode or has storage restriction
            // sessionStorage can throw. JSON.parse and JSON.stringify
            // cat throw, too.
            return initialValue;
        }
    });

    watch(state, () => {
        try {
            const serializedState = raw ? String(state.value) : JSON.stringify(state.value);
            sessionStorage.setItem(key, serializedState);
        } catch {
            // If user is in private mode or has storage restriction
            // sessionStorage can throw. Also JSON.stringify can throw.
        }
    });

    return [state, setState];
};

export default useSessionStorage;
