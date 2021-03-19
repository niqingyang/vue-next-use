import {Ref, unref} from 'vue';
import {noop} from './misc/util';
import {DragEventHandler, ClipboardEventHandler} from './misc/types';
import {useReadonly, useMountedState} from "./index";

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
    onFiles?: (files: File[], event?: Event) => void;
    onText?: (text: string, event?: Event) => void;
    onUri?: (url: string, event?: Event) => void;
}

/*
const defaultState: DropAreaState = {
  over: false,
};
*/

const createProcess = (options: DropAreaOptions, isMounted: () => boolean) => (
    dataTransfer: DataTransfer,
    event: (ClipboardEvent | DragEvent)
) => {
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

const createBond = (process: (dataTransfer: DataTransfer, event: (ClipboardEvent | DragEvent)) => void, setOver: (over: boolean) => void): DropAreaBond => ({
    onDragover: (event) => {
        event.preventDefault();
        setOver(true);
    },
    onDragenter: (event) => {
        event.preventDefault();
        setOver(true);
    },
    onDragleave: () => {
        setOver(false);
    },
    onDrop: (event: DragEvent) => {
        event.preventDefault();
        setOver(false);
        process(event.dataTransfer as DataTransfer, event);
    },
    onPaste: (event: ClipboardEvent) => {
        process(event.clipboardData as DataTransfer, event);
    },
});

// 绑定事件
// @dragover="bond.onDragOver"
// @dragenter="bond.onDragEnter"
// @dragleave="bond.onDragLeave"
// @drop="bond.onDrop"
// @paste="bond.onPaste"
const useDropArea = (options: DropAreaOptions = {}): [DropAreaBond, Readonly<DropAreaState>] => {
    const {onFiles, onText, onUri} = options;
    const isMounted = useMountedState();
    const [state, set] = useReadonly<DropAreaState>({over: false});

    const setOver = (over: boolean) => {
        set({over});
    }

    const process = createProcess(options, isMounted);
    const bond: DropAreaBond = createBond(process, setOver);

    return [bond, state];
};

export default useDropArea;