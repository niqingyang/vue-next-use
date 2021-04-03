import {computed, ComputedRef} from "vue";
import {useEffect, useState} from './index';
import {scrollbarWidth} from '@xobotyi/scrollbar-width';

export default function useScrollbarWidth(): ComputedRef<number | undefined> {
    const [sbw, setSbw] = useState(scrollbarWidth());

    // this needed to ensure the scrollbar width in case hook called before the DOM is ready
    useEffect(() => {
        if (typeof sbw !== 'undefined') {
            return;
        }

        const raf = requestAnimationFrame(() => {
            setSbw(scrollbarWidth());
        });

        return () => cancelAnimationFrame(raf);
    }, []);

    return computed(() => {
        return sbw.value;
    });
}
