import * as Vue from 'vue';
import { noop } from './misc/util';
import { useState } from './index';

export type Element = ((state: Vue.Ref<boolean>) => Vue.VNode<any>) | Vue.VNode<any>;

const useHover = (element: Element): [Vue.VNode<any>, Vue.ComputedRef<boolean>] => {
    const [state, setState] = useState(false);

    const onMouseEnter = (originalOnMouseEnter?: any) => (event: any) => {
        (originalOnMouseEnter || noop)(event);
        setState(true);
    };
    const onMouseLeave = (originalOnMouseLeave?: any) => (event: any) => {
        (originalOnMouseLeave || noop)(event);
        setState(false);
    };

    if (typeof element === 'function') {
        element = element(state);
    }

    const el = Vue.cloneVNode(element, {
        onmouseenter: onMouseEnter(element?.props?.onmouseenter),
        onmouseleave: onMouseLeave(element?.props?.onmouseleave),
    });

    return [el, Vue.computed(() => {
        return state.value;
    })];
};

export default useHover;