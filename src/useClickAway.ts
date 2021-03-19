import {Ref} from 'vue';
import {off, on} from './misc/util';
import {useEffect} from "./index";

const defaultEvents = ['mousedown', 'touchstart'];

const useClickAway = <E extends Event = Event>(
    ref: Ref<HTMLElement | null>,
    onClickAway: (event: E) => void,
    events: string[] = defaultEvents
) => {
    const handler = (event: E) => {
        const {value: el} = ref;
        el && !el.contains(event.target as Node) && onClickAway(event);
    };

    useEffect(() => {
        for (const eventName of events) {
            on(document, eventName, handler);
        }

        return () => {
            for (const eventName of events) {
                off(document, eventName, handler);
            }
        }
    });
};

export default useClickAway;