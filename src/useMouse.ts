import {computed, ComputedRef, Ref} from 'vue';
import {useEffect, useRafState} from './index';
import {off, on} from './misc/util';

export interface State {
    docX: number;
    docY: number;
    posX: number;
    posY: number;
    elX: number;
    elY: number;
    elH: number;
    elW: number;
}

const useMouse = (ref: Ref<Element | null>): ComputedRef<State> => {
    if (process.env.NODE_ENV === 'development') {
        if (typeof ref !== 'object' || typeof ref.value === 'undefined') {
            console.error('useMouse expects a single ref argument.');
        }
    }

    const [state, setState] = useRafState<State>({
        docX: 0,
        docY: 0,
        posX: 0,
        posY: 0,
        elX: 0,
        elY: 0,
        elH: 0,
        elW: 0,
    });

    useEffect(() => {
        const moveHandler = (event: MouseEvent) => {
            if (ref && ref.value) {
                const {left, top, width: elW, height: elH} = ref.value.getBoundingClientRect();
                const posX = left + window.pageXOffset;
                const posY = top + window.pageYOffset;
                const elX = event.pageX - posX;
                const elY = event.pageY - posY;

                setState({
                    docX: event.pageX,
                    docY: event.pageY,
                    posX,
                    posY,
                    elX,
                    elY,
                    elH,
                    elW,
                });
            }
        };

        on(document, 'mousemove', moveHandler);

        return () => {
            off(document, 'mousemove', moveHandler);
        };
    }, [ref]);

    return computed(() => {
        return state.value;
    });
};

export default useMouse;
