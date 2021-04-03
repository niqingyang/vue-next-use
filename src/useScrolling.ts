import {computed, ComputedRef, readonly, Ref} from 'vue';
import {useEffect, useState} from './index';
import {off, on} from './misc/util';

const useScrolling = (ref: Ref<HTMLElement>): Readonly<Ref<boolean>> => {
    const [scrolling, setScrolling] = useState<boolean>(false);

    useEffect(() => {
        if (ref.value) {
            let scrollingTimeout;

            const handleScrollEnd = () => {
                setScrolling(false);
            };

            const handleScroll = () => {
                setScrolling(true);
                clearTimeout(scrollingTimeout);
                scrollingTimeout = setTimeout(() => handleScrollEnd(), 150);
            };

            on(ref.value, 'scroll', handleScroll, false);
            return () => {
                if (ref.value) {
                    off(ref.value, 'scroll', handleScroll, false);
                }
            };
        }
        return () => {
            // void
        };
    }, [ref]);

    return readonly(scrolling);
};

export default useScrolling;
