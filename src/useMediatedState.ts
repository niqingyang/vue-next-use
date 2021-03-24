import {useState} from "./index";
import {Ref, ref as useRef, watch} from 'vue';
import {SetStateAction} from './misc/types'

declare type Dispatch<T> = (value: T) => void

export interface StateMediator<S = any> {
    (newState: any): S;

    (newState: any, dispatch: Dispatch<SetStateAction<S>>): void;
}

export type UseMediatedStateReturn<S = any> = [Ref<S>, Dispatch<SetStateAction<S>>];

export function useMediatedState<S = undefined>(
    mediator: StateMediator<S | undefined>
): UseMediatedStateReturn<S | undefined>;

export function useMediatedState<S = any>(
    mediator: StateMediator<S>,
    initialState: S
): UseMediatedStateReturn<S>;

export default function useMediatedState<S = any>(
    mediator: StateMediator<S>,
    initialState?: S
): UseMediatedStateReturn<S> {
    const mediatorFn = useRef(mediator);

    const [state, setMediatedState] = useState<S>(initialState!);
    const setState = (newState: any) => {
        if (mediatorFn.value.length === 2) {
            mediatorFn.value(newState, setMediatedState);
        } else {
            setMediatedState(mediatorFn.value(newState));
        }
    };

    watch(state, (newState) => {
        if (mediatorFn.value.length === 2) {
            mediatorFn.value(newState, setMediatedState);
        } else {
            setMediatedState(mediatorFn.value(newState));
        }
    });

    return [state, setState];
}
