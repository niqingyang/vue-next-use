import {useState} from "./index";

export default function useRef<T>(initialState: T | (() => T)) {
    return useState(initialState);
};