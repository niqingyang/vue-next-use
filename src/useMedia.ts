import {computed, ComputedRef, Ref, unref} from "vue";
import {sources, useEffect, useState} from './index';
import {isBrowser} from './misc/util';

export default function useMedia(query: string | Ref<string>, defaultState: boolean = false): ComputedRef<boolean> {
    const [state, setState] = useState(
        isBrowser ? () => window.matchMedia(unref(query)).matches : defaultState
    );

    useEffect(() => {
        let mounted = true;
        const mql = window.matchMedia(unref(query));
        const onChange = () => {
            if (!mounted) {
                return;
            }
            setState(!!mql.matches);
        };

        mql.addListener(onChange);
        setState(mql.matches);

        return () => {
            mounted = false;
            mql.removeListener(onChange);
        };
    }, sources([query]));

    return computed(() => {
        return state.value;
    });
};

