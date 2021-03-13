import {Handler, KeyFilter} from './useKey';
import useKeyPressDefault from './useKeyPress';
import {unref, watch} from "vue";

const useKeyPressEvent = (
    key: string | KeyFilter,
    keydown?: Handler | null | undefined,
    keyup?: Handler | null | undefined,
    useKeyPress = useKeyPressDefault
) => {
    const [pressed, event] = useKeyPress(key);

    watch(pressed, (newPressed) => {
        if (!newPressed && keyup) {
            keyup(unref(event)!);
        } else if (newPressed && keydown) {
            keydown(unref(event)!);
        }
    });
};

export default useKeyPressEvent;