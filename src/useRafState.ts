import {onUnmounted, Ref} from 'vue';
import {Dispatch, SetStateAction, useReactive, useRef, useState} from './index';

export default function useRafState<S>(initialState: S | (() => S)): [Ref<S>, Dispatch<SetStateAction<S>>] {
    const frame = useRef(0);

    const [state, setState] = useState(initialState);

    const setRafState = (value: S | ((prevState: S) => S)) => {
        cancelAnimationFrame(frame.value);

        frame.value = requestAnimationFrame(() => {
            setState(value);
        });
    };

    onUnmounted(() => {
        cancelAnimationFrame(frame.value);
    });

    return [state, setRafState];
};
