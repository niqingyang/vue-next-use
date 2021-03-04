import {onMounted, onUnmounted, onUpdated, unref, watch, WatchSource} from "vue";
import useState from "./useState";

declare type MultiWatchSources = (WatchSource<unknown> | object)[];

export default function useEffect(fn: () => (void | (() => void)), deps: MultiWatchSources | WatchSource | null | undefined = undefined) {

    const [callback, setCallback] = useState<(() => void) | void>(undefined);

    onMounted(() => {
        setCallback(() => fn());
    });

    if (deps) {
        watch(deps, (newValue, oldValue) => {
            if (callback.value instanceof Function) {
                callback.value();
            }
            setCallback(() => fn());
        });
    } else {
        // VUE3 与 React 有区别，数据绑定的效果无需在 updated 中重新执行
        // onUpdated(() => {
        //     if (callback.value instanceof Function) {
        //         callback.value();
        //     }
        //     setCallback(() => fn());
        // });
    }

    onUnmounted(() => {
        if (callback.value instanceof Function) {
            callback.value();
        }
    });
}