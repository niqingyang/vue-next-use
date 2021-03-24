import {onMounted, onUnmounted, watch, WatchSource} from "vue";
import {useState} from "./index";

declare type MultiWatchSources = (WatchSource<unknown> | object)[];

export default function useEffect(fn: () => (void | (() => void)), deps: MultiWatchSources | WatchSource | null | undefined = undefined) {

    const [callback, setCallback] = useState<(() => void) | void>(undefined);

    onMounted(() => {
        setCallback(() => fn());

        if (deps) {
            watch(deps, (newValue, oldValue) => {
                if (callback.value instanceof Function) {
                    callback.value();
                }
                setCallback(() => fn());
            });
        }
    });

    onUnmounted(() => {
        if (callback.value instanceof Function) {
            callback.value();
        }
    });
}