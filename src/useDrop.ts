import {isRef, Ref, unref, watchEffect} from 'vue';
import {sources, useEffect, useMountedState, useReadonly} from "./index";
import {DragEventHandler, ClipboardEventHandler} from './misc/types';
import {noop, off, on} from './misc/util';

export interface DropAreaState {
    over: boolean;
}

export interface DropAreaBond {
    onDragover: DragEventHandler;
    onDragenter: DragEventHandler;
    onDragleave: DragEventHandler;
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
        (unref(options.onUri) || noop)(uri, event);
        return;
    }

    if (dataTransfer.files && dataTransfer.files.length) {
        (unref(options.onFiles) || noop)(Array.from(dataTransfer.files), event);
        return;
    }

    if (dataTransfer.items && dataTransfer.items.length) {
        dataTransfer.items[0].getAsString((text) => {
            if (isMounted()) {
                (unref(options.onText) || noop)(text, event);
            }
        });
    }
};

const useDrop = (options: DropAreaOptions = {}, args = []): Readonly<DropAreaState> => {
    const {ref, onFiles, onText, onUri} = options;
    const [state, set] = useReadonly<DropAreaState>({over: false});

    const setOver = (over: boolean) => {
        set({over});
    }

    const isMounted = useMountedState();

    const process = createProcess(options, isMounted);

    useEffect(() => {
        const element = ref?.value ? ref.value : document;

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

        if (unref(onText)) {
            on(element, 'paste', onPaste);
        }

        return () => {
            off(element, 'dragover', onDragOver);
            off(element, 'dragenter', onDragEnter);
            off(element, 'dragleave', onDragLeave);
            off(element, 'dragexit', onDragExit);
            off(element, 'drop', onDrop);
            off(element, 'paste', onPaste);
        }
    }, sources([ref, isRef(onText) ? onText : null, isRef(onFiles) ? onFiles : null, isRef(onUri) ? onUri : null]));

    return state;
};

export default useDrop;