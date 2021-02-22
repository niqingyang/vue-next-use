import {Ref} from "vue";
import {useState} from "./index";

const useToggle = (initialValue: boolean): [Ref<boolean>, (nextValue?: any) => void] => {

    const [state, set] = useState(initialValue);

    const toggle = (nextValue?: any) => {
        set(typeof nextValue === 'boolean' ? nextValue : !state.value)
    }

    return [state, toggle];
};

export default useToggle;