import {Ref} from 'vue';
import {useState} from "./index";

const useSetState = <T extends object>(
    initialState: T = {} as T
): [Ref<T>, (patch: Partial<T> | ((prevState: T) => Partial<T>)) => void] => {
    const [state, set] = useState<T>(initialState);
    const setState = (patch: Object | Function) => {
        set((prevState) =>
            Object.assign({}, prevState, patch instanceof Function ? patch(prevState) : patch)
        );
    };

    return [state, setState];
};

export default useSetState;