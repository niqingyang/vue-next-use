import {useEffect, useReadonly, useRef, useState} from './index';
import {StateValidator, UseStateValidatorReturn, ValidityState} from './useStateValidator';
import {computed, toRaw, unref, watch} from "vue";

export type MultiStateValidatorStates = any[] | { [p: string]: any } | { [p: number]: any };
export type MultiStateValidator<V extends ValidityState,
    S extends MultiStateValidatorStates> = StateValidator<V, S>;

export default function useMultiStateValidator<V extends ValidityState,
    S extends MultiStateValidatorStates>(
    states: S,
    validator: MultiStateValidator<V, S>,
    initialValidity: V = [undefined] as V
): UseStateValidatorReturn<V> {

    if (typeof states !== 'object') {
        throw new Error('states expected to be an object or array, got ' + typeof states);
    }

    const validatorInner = useRef(validator);
    const statesInner = useRef(states);

    validatorInner.value = validator;
    statesInner.value = states;

    const [validity, setValidity] = useReadonly(initialValidity as V);

    const validate = () => {
        if (validatorInner.value.length >= 2) {
            validatorInner.value(statesInner.value.map(item=>unref(item)), setValidity);
        } else {
            setValidity(validatorInner.value(statesInner.value.map(item=>unref(item))));
        }
    };

    useEffect(() => {
        validate();
    }, Object.values(states));

    return [validity, validate];
}
