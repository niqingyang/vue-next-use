import {cloneVNode, createVNode, unref, VNode, renderSlot, computed, ComputedRef} from 'vue';
import {sources, useEffect, useReactive, useRef, useState} from './index';
import {noop, off, on} from './misc/util';

export interface ScratchSensorParams {
    disabled?: boolean;
    onScratch?: (state: ScratchSensorState) => void;
    onScratchStart?: (state: ScratchSensorState) => void;
    onScratchEnd?: (state: ScratchSensorState) => void;
}

export interface ScratchSensorState {
    isScratching: boolean;
    start?: number;
    end?: number;
    x?: number;
    y?: number;
    dx?: number;
    dy?: number;
    docX?: number;
    docY?: number;
    posX?: number;
    posY?: number;
    elH?: number;
    elW?: number;
    elX?: number;
    elY?: number;
}

export default function useScratch(
    params: ScratchSensorParams = {}
): [(el: HTMLElement | null) => void, ComputedRef<ScratchSensorState>] {
    const {disabled} = params;
    const paramsRef = useRef(params);
    const [state, setState] = useState<ScratchSensorState>({isScratching: false});
    const refState = useRef<ScratchSensorState>(state.value);
    const refScratching = useRef<boolean>(false);
    const refAnimationFrame = useRef<any>(null);
    const [el, setEl] = useState<HTMLElement | null>(null);
    useEffect(() => {
        if (disabled) return;
        if (el.value == null) return;

        const onMoveEvent = (docX, docY) => {
            cancelAnimationFrame(refAnimationFrame.value);
            refAnimationFrame.value = requestAnimationFrame(() => {
                if (el.value == null) return;
                if (state.value.isScratching == false) return;
                const {left, top} = el.value.getBoundingClientRect();
                const elX = left + window.scrollX;
                const elY = top + window.scrollY;
                const x = docX - elX;
                const y = docY - elY;
                setState((oldState) => {
                    const newState = {
                        ...oldState,
                        dx: x - (oldState.x || 0),
                        dy: y - (oldState.y || 0),
                        end: Date.now(),
                        isScratching: true,
                    };
                    refState.value = newState;
                    (paramsRef.value.onScratch || noop)(newState);
                    return newState;
                });
            });
        };

        const onMouseMove = (event) => {
            onMoveEvent(event.pageX, event.pageY);
        };

        const onTouchMove = (event) => {
            onMoveEvent(event.changedTouches[0].pageX, event.changedTouches[0].pageY);
        };

        let onMouseUp;
        let onTouchEnd;

        const stopScratching = () => {
            if (!refScratching.value) return;
            refScratching.value = false;
            refState.value = {...refState.value, isScratching: false};
            (paramsRef.value.onScratchEnd || noop)(refState.value);
            setState({isScratching: false});
            off(window, 'mousemove', onMouseMove);
            off(window, 'touchmove', onTouchMove);
            off(window, 'mouseup', onMouseUp);
            off(window, 'touchend', onTouchEnd);
        };

        onMouseUp = stopScratching;
        onTouchEnd = stopScratching;

        const startScratching = (docX, docY) => {
            if (!refScratching.value) return;
            if (el.value == null) return;
            const {left, top} = el.value.getBoundingClientRect();
            const elX = left + window.scrollX;
            const elY = top + window.scrollY;
            const x = docX - elX;
            const y = docY - elY;
            const time = Date.now();
            const newState = {
                isScratching: true,
                start: time,
                end: time,
                docX,
                docY,
                x,
                y,
                dx: 0,
                dy: 0,
                elH: el.value.offsetHeight,
                elW: el.value.offsetWidth,
                elX,
                elY,
            };
            refState.value = newState;
            (paramsRef.value.onScratchStart || noop)(newState);
            setState(newState);
            on(window, 'mousemove', onMouseMove);
            on(window, 'touchmove', onTouchMove);
            on(window, 'mouseup', onMouseUp);
            on(window, 'touchend', onTouchEnd);
        };

        const onMouseDown = (event) => {
            refScratching.value = true;
            startScratching(event.pageX, event.pageY);
        };

        const onTouchStart = (event) => {
            refScratching.value = true;
            startScratching(event.changedTouches[0].pageX, event.changedTouches[0].pageY);
        };

        on(el.value, 'mousedown', onMouseDown);
        on(el.value, 'touchstart', onTouchStart);

        return () => {
            off(el.value, 'mousedown', onMouseDown);
            off(el.value, 'touchstart', onTouchStart);
            off(window, 'mousemove', onMouseMove);
            off(window, 'touchmove', onTouchMove);
            off(window, 'mouseup', onMouseUp);
            off(window, 'touchend', onTouchEnd);

            if (refAnimationFrame.value) cancelAnimationFrame(refAnimationFrame.value);
            refAnimationFrame.value = null;

            refScratching.value = false;
            refState.value = {isScratching: false};
            setState(refState.value);
        };
    }, sources([el, disabled, paramsRef]));

    return [setEl, computed(()=>{
        return state.value;
    })];
};

// 有Bug，未实现
interface ScratchSensorProps extends ScratchSensorParams {
    children: (
        state: ScratchSensorState,
        ref: (el: HTMLElement | null) => void
    ) => VNode<any>;
}

// 有Bug，未实现
const ScratchSensor = {
    props: {},
    setup(props, ctx) {
        const [setRef, state] = useScratch(ctx.args);
        const element = render(props, state);

        return () => cloneVNode(renderSlot(ctx.slots, 'default'), {
            ...props,
            ref: (el: HTMLElement) => {
                if (props.ref) {
                    if (typeof element.props.ref === 'object') element.props.ref.value = el;
                    if (typeof element.props.ref === 'function') element.props.ref(el);
                }
                setRef(el);
            },
        });
    }
};

const isFn = fn => typeof fn === 'function';

const render = (props, data, ...more) => {

    props = unref(props);
    data = unref(data);

    console.log(props, data)

    if (process.env.NODE_ENV !== 'production') {
        if (typeof props !== 'object') {
            throw new TypeError('renderChildren(props, data) first argument must be a props object.');
        }

        const {children, render} = props;

        if (isFn(children) && isFn(render)) {
            console.warn(
                'Both "render" and "children" are specified for in a universal interface component. ' +
                'Children will be used.'
            );
            console.trace();
        }

        if (typeof data !== 'object') {
            console.warn(
                'Universal component interface normally expects data to be an object, ' +
                `"${typeof data}" received.`
            );
            console.trace();
        }
    }

    const {render, children = render, component, comp = component} = props;

    if (isFn(children)) return children(data, ...more);

    if (comp) {
        return createVNode(comp, data);
    }

    if (children instanceof Array)
        return children;

    if (children && (children instanceof Object)) {
        if (process.env.NODE_ENV !== 'production') {
            if (!children.type || ((typeof children.type !== 'string') && (typeof children.type !== 'function') && (typeof children.type !== 'symbol'))) {
                console.warn(
                    'Universal component interface received object as children, ' +
                    'expected React element, but received unexpected React "type".'
                );
                console.trace();
            }

            if (typeof children.type === 'string')
                return children;

            return cloneVNode(children, Object.assign({}, children.props, data));
        } else {
            if (typeof children.type === 'string')
                return children;

            return cloneVNode(children, Object.assign({}, children.props, data));
        }
    }

    return children || null;
};