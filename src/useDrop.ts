import {Ref, watchEffect} from 'vue';
import {useSetState, useMountedState} from "./index";
import {noop, off, on} from './misc/util';
import {DragEventHandler, ClipboardEventHandler} from './misc/types';

export interface DropAreaState {
    over: boolean;
}

export interface DropAreaBond {
    onDragOver: DragEventHandler;
    onDragEnter: DragEventHandler;
    onDragLeave: DragEventHandler;
    onDrop: DragEventHandler;
    onPaste: ClipboardEventHandler;
}

export interface DropAreaOptions {
    ref?: Ref<HTMLElement>,
    onFiles?: (files: File[], event?: Event) => void;
    onText?: (text: string, event?: Event) => void;
    onUri?: (url: string, event?: Event) => void;
}

const createProcess = (options: DropAreaOptions, isMounted: () => boolean) => (dataTransfer: DataTransfer, event: (ClipboardEvent | DragEvent)) => {
    const uri = dataTransfer.getData('text/uri-list');

    if (uri) {
        (options.onUri || noop)(uri, event);
        return;
    }

    if (dataTransfer.files && dataTransfer.files.length) {
        (options.onFiles || noop)(Array.from(dataTransfer.files), event);
        return;
    }

    if (dataTransfer.items && dataTransfer.items.length) {
        dataTransfer.items[0].getAsString((text) => {
            if (isMounted()) {
                (options.onText || noop)(text, event);
            }
        });
    }
};

const useDrop = (options: DropAreaOptions = {}, args = []): Ref<DropAreaState> => {
    const {ref, onFiles, onText, onUri} = options;
    const [state, set] = useSetState<DropAreaState>({over: false});

    const setOver = (over: boolean) => {
        set({over});
    }

    const isMounted = useMountedState();

    watchEffect((onInvalidate) => {
        const element = ref?.value ? ref?.value : document;

        const onDragOver = (event: Event) => {
            event.preventDefault();
            setOver(true);
        };

        const onDragEnter = (event: Event) => {
            event.preventDefault();
            setOver(true);
        };

        const onDragLeave = () => {
            setOver(false);
        };

        const onDragExit = () => {
            setOver(false);
        };

        const process = createProcess(options, isMounted);

        const onDrop = (event: DragEvent) => {
            event.preventDefault();
            setOver(false);
            process(event.dataTransfer as DataTransfer, event);
        };

        const onPaste = (event: ClipboardEvent) => {
            process(event.clipboardData as DataTransfer, event);
        };

        on(element, 'dragover', onDragOver);
        on(element, 'dragenter', onDragEnter);
        on(element, 'dragleave', onDragLeave);
        on(element, 'dragexit', onDragExit);
        on(element, 'drop', onDrop);

        if (onText) {
            on(element, 'paste', onPaste);
        }

        onInvalidate(() => {
            off(element, 'dragover', onDragOver);
            off(element, 'dragenter', onDragEnter);
            off(element, 'dragleave', onDragLeave);
            off(element, 'dragexit', onDragExit);
            off(element, 'drop', onDrop);
            off(element, 'paste', onPaste);
        })
    });

    return state;
};

export default useDrop;