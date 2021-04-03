import {Ref, toRaw, unref, watch, WatchSource} from "vue";
import {useReactive, useRef, useState} from "./index";

declare type MultiWatchSources = (WatchSource<unknown> | object)[];

export default function useMemo<T>(factory: () => T, deps: MultiWatchSources | WatchSource | null | undefined = undefined): Ref<T> {

    const [state, setState] = useState<T>(() => factory());

    if (deps) {
        watch(deps, function () {
            setState(() => factory());
        });
    }

    return state;
}