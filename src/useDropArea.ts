import {Ref} from 'vue';
import useState from './useState';
import useMountedState from './useMountedState';
import {noop} from './misc/util';
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

const createBond = (process: (dataTransfer: DataTransfer, event: (ClipboardEvent | DragEvent)) => void, setOver: (over: boolean) => void): DropAreaBond => ({
    onDragOver: (event) => {
        event.preventDefault();
        setOver(true);
    },
    onDragEnter: (event) => {
        event.preventDefault();
        setOver(true);
    },
    onDragLeave: () => {
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
const useDropArea = (options: DropAreaOptions = {}): [DropAreaBond, Ref<DropAreaState>] => {
    const {onFiles, onText, onUri} = options;
    const isMounted = useMountedState();
    const [state, set] = useState<DropAreaState>({over: false});

    const setOver = (over: boolean) => {
        set({over});
    }

    const process = createProcess(options, isMounted);
    const bond: DropAreaBond = createBond(process, setOver);

    return [bond, state];
};

export default useDropArea;