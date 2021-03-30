import {computed, ComputedRef, Ref, unref, watch} from 'vue';
import {useHoverDirty} from './index';
import useMouse, {State} from './useMouse';

export interface UseMouseHoveredOptions {
    whenHovered?: boolean | Ref<boolean>;
    bound?: boolean | Ref<boolean>;
}

const useMouseHovered = (ref: Ref<Element>, options: UseMouseHoveredOptions = {}): ComputedRef<State> => {
    const whenHovered = !!unref(options.whenHovered);
    const bound = !!unref(options.bound);

    const isHovered = useHoverDirty(ref, whenHovered);
    const state = useMouse(computed(() => {
        return whenHovered && !isHovered.value ? null : ref.value
    }));

    if (unref(bound)) {
        watch(state, () => {
            state.value.elX = Math.max(0, Math.min(state.value.elX, state.value.elW));
            state.value.elY = Math.max(0, Math.min(state.value.elY, state.value.elH));
        });
    }

    return state;
};

export default useMouseHovered;
