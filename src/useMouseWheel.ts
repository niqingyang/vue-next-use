import {Ref} from "vue";
import {useEffect, useState} from './index';
import {off, on} from './misc/util';

export default function useMouseWheel(): Ref<number> {
    const [mouseWheelScrolled, setMouseWheelScrolled] = useState(0);
    useEffect(() => {
        const updateScroll = (e: MouseWheelEvent) => {
            setMouseWheelScrolled(e.deltaY + mouseWheelScrolled.value);
        };
        on(window, 'wheel', updateScroll, false);
        return () => off(window, 'wheel', updateScroll);
    });
    return mouseWheelScrolled;
};
