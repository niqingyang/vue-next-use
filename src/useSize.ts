import {cloneVNode, createVNode, readonly, Ref, VNode} from 'vue';
import {isBrowser, off, on} from './misc/util';
import {useState, useEffect, useRef, useReactive} from './index';

const DRAF = (callback: () => void) => setTimeout(callback, 35);

export type Element = ((state: State) => VNode<any>) | VNode<any>;

export interface State {
    width: number;
    height: number;
}

const useSize = (
    {width = Infinity, height = Infinity}: Partial<State> = {}
): [VNode<any>, Readonly<State>] => {
    if (!isBrowser) {
        return [
            createVNode(""),
            {width, height},
        ];
    }

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [state, setState] = useReactive<State>({width, height});

    const ref = useRef<HTMLIFrameElement | null>(null);
    let window: Window | null = null;
    const setSize = () => {
        const iframe = ref.value;
        const size = iframe
            ? {
                width: iframe.offsetWidth,
                height: iframe.offsetHeight,
            }
            : {width, height};
        setState(size);
    };
    const onWindow = (windowToListenOn: Window) => {
        on(windowToListenOn, 'resize', setSize);
        DRAF(setSize);
    };

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
        const iframe: HTMLIFrameElement | null = ref.value;

        if (!iframe) {
            // iframe will be undefined if component is already unmounted
            return;
        }

        if (iframe.parentElement) {
            iframe.parentElement.style.position = 'relative';
        }

        if (iframe.contentWindow) {
            window = iframe.contentWindow!;
            onWindow(window);
        } else {
            const onLoad = () => {
                on(iframe, 'load', onLoad);
                window = iframe.contentWindow!;
                onWindow(window);
            };

            off(iframe, 'load', onLoad);
        }

        return () => {
            if (window && window.removeEventListener) {
                off(window, 'resize', setSize);
            }
        };
    });

    const Sized = createVNode({
        render() {
            return createVNode('iframe', {
                ref: ref,
                style: {
                    background: 'transparent',
                    border: 'none',
                    height: '100%',
                    left: 0,
                    position: 'absolute',
                    top: 0,
                    width: '100%',
                    zIndex: -1,
                },
            })
        }
    });

    return [Sized, readonly(state)];
};

export default useSize;
