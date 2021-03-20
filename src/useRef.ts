import {useState} from "./index";

export default function useRef<T>(initialState: T) {
    const [ref] = useState(initialState);
    return ref;
};