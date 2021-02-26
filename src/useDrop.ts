import {Ref, onMounted, onBeforeUnmount} from 'vue';
import {useSetState} from "./index";
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
    onFiles?: (files: File[], event?: Event) => void;
    onText?: (text: string, event?: Event) => void;
    onUri?: (url: string, event?: Event) => void;
}

const createProcess = (options: DropAreaOptions) => (dataTransfer: DataTransfer, event: (ClipboardEvent | DragEvent)) => {
    const uri = dataTransfer.getData('text/uri-list');

    if (uri) {
        (options.onUri || noop)(uri, event);
        return;
    }

    if (dataTransfer.files && dataTransfer.files.length) {
        (options.onFiles || noop)(Array.from(dataTransfer.files), event);
        return;
    }

    event = event as ClipboardEvent;

    if (event.clipboardData) {
        const text = event.clipboardData.getData('text');
        (options.onText || noop)(text, event);
        return;
    }
};

const useDrop = (options: DropAreaOptions = {}, args = []): Ref<DropAreaState> => {
    const {onFiles, onText, onUri} = options;
    const [state, set] = useSetState<DropAreaState>({over: false});
    const process = createProcess(options);

    const setOver = (over: boolean) => {
        set({over});
    }

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

    onMounted(() => {
        on(document, 'dragover', onDragOver);
        on(document, 'dragenter', onDragEnter);
        on(document, 'dragleave', onDragLeave);
        on(document, 'dragexit', onDragExit);
        on(document, 'drop', onDrop);
        if (onText) {
            on(document, 'paste', onPaste);
        }
    });

    onBeforeUnmount(() => {
        off(document, 'dragover', onDragOver);
        off(document, 'dragenter', onDragEnter);
        off(document, 'dragleave', onDragLeave);
        off(document, 'dragexit', onDragExit);
        off(document, 'drop', onDrop);
        off(document, 'paste', onPaste);
    })

    return state;
};

export default useDrop;