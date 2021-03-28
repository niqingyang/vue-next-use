import {watch} from "vue";
import {useState} from './index';
import {resolveHookState} from "./misc/hookState";

export default function useDefault<T>(
    defaultValue: T,
    initialValue: T | (() => T)
) {
    const [value, setValue] = useState<T | undefined | null>(resolveHookState(initialValue));

    watch(value, (newValue) => {
        if (newValue === undefined || newValue === null) {
            setValue(defaultValue);
        }
    }, {
        immediate: true
    });

    return [value, setValue] as const;
};

