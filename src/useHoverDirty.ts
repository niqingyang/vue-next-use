import {unref, Ref, ComputedRef} from "vue";
import {useEffect, useComputedState} from './index';
import {off, on, sources} from './misc/util';

// kudos: https://usehooks.com/
const useHoverDirty = (ref: Ref<Element>, enabled: boolean | Ref<boolean> = true) : ComputedRef<boolean> => {
    if (process.env.NODE_ENV === 'development') {
        if (typeof ref !== 'object' || typeof unref(ref) === 'undefined') {
            console.error('useHoverDirty expects a single ref argument.');
        }
    }

    const [value, setValue] = useComputedState(false);

    const onMouseOver = () => setValue(true);
    const onMouseOut = () => setValue(false);

    useEffect(() => {
        if (enabled && ref && ref.value) {
            on(ref.value, 'mouseover', onMouseOver);
            on(ref.value, 'mouseout', onMouseOut);
        }

        // fixes react-hooks/exhaustive-deps warning about stale ref elements
        const {value} = ref;

        return () => {
            if (enabled && value) {
                off(value, 'mouseover', onMouseOver);
                off(value, 'mouseout', onMouseOut);
            }
        };
    }, sources([enabled, ref]));

    return value;
};

export default useHoverDirty;