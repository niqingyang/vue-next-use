import {ComputedRef, unref} from 'vue';
import {
    Dispatch,
    SetStateAction,
    useEffect,
    useReactive,
    useReadonly,
    useRef
} from './index';

export type ValidityState = [boolean | undefined, ...any[]] | [undefined];

export interface StateValidator<V, S> {
    (state: S): V;

    (state: S, dispatch: Dispatch<SetStateAction<V>>): void;
}

export type UseStateValidatorReturn<V> = [Readonly<V>, () => void];

export default function useStateValidator<V extends ValidityState, S>(
    state: S,
    validator: StateValidator<V, S>,
    initialState: V = [undefined] as V
): UseStateValidatorReturn<V> {
    const stateInner = useRef(state);
    const validatorInner = useRef(validator);

    const [validity, setValidity] = useReadonly(initialState as V);

    const validate = () => {
        if (validatorInner.value.length >= 2) {
            validatorInner.value(unref(stateInner.value) as S, setValidity as Dispatch<SetStateAction<V>>);
        } else {
            setValidity(validatorInner.value(unref(stateInner.value) as S));
        }
    };

    useEffect(() => {
        validate();
    }, stateInner);

    return [validity, validate];
}
