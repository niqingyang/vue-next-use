import {computed, ComputedRef} from "vue";
import {useComputedState, useState} from './index';
import useKey, {KeyFilter} from './useKey';

const useKeyPress = (keyFilter: KeyFilter): [ComputedRef<boolean>, ComputedRef<null | KeyboardEvent>] => {
    const [state, set] = useState<[boolean, null | KeyboardEvent]>([false, null]);

    useKey(keyFilter, (event) => set([true, event]), {event: 'keydown'});
    useKey(keyFilter, (event) => set([false, event]), {event: 'keyup'});

    return [computed(() => state.value[0]), computed(() => state.value[1])];
};

export default useKeyPress;