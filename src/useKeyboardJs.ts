import {computed, ComputedRef} from "vue";
import {useEffect, useState, useMount, sources} from './index';

const useKeyboardJs = (combination: string | string[]): [ComputedRef<boolean>, ComputedRef<null | KeyboardEvent>] => {
    const [state, set] = useState<[boolean, null | KeyboardEvent]>([false, null]);
    const [keyboardJs, setKeyboardJs] = useState<any>(null);

    useMount(() => {
        import('keyboardjs').then((k) => setKeyboardJs(k.default || k));
    });

    useEffect(() => {
        if (!keyboardJs.value) {
            return;
        }

        const down = (event) => set([true, event]);
        const up = (event) => set([false, event]);
        keyboardJs.value.bind(combination, down, up, true);

        return () => {
            keyboardJs.value.unbind(combination, down, up);
        };
    }, sources([combination, keyboardJs]));

    return [computed(() => state.value[0]), computed(() => state.value[1])];
};

export default useKeyboardJs;
