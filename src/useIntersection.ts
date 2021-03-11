import {ComputedRef, isRef, Ref, unref} from "vue";
import {useEffect, useComputedState} from './index';
import {sources} from './misc/util';

const useIntersection = (
    ref: Ref<HTMLElement>,
    options: IntersectionObserverInit | Ref<IntersectionObserverInit>
): ComputedRef<IntersectionObserverEntry | null> | null => {
    const [
        intersectionObserverEntry,
        setIntersectionObserverEntry,
    ] = useComputedState<IntersectionObserverEntry | null>(null);

    const deps: any[] = [ref];

    if (isRef(options)) {
        deps.push(() => unref(options).threshold);
        deps.push(() => unref(options).root);
        deps.push(() => unref(options).rootMargin);
    } else {
        deps.push(options?.threshold);
        deps.push(options?.root);
        deps.push(options?.rootMargin);
    }

    useEffect(() => {
        if (ref.value && typeof IntersectionObserver === 'function') {
            const handler = (entries: IntersectionObserverEntry[]) => {
                setIntersectionObserverEntry(entries[0]);
            };

            const observer = new IntersectionObserver(handler, unref(options));
            observer.observe(ref.value);

            return () => {
                setIntersectionObserverEntry(null);
                observer.disconnect();
            };
        }
        return () => {
        };
    }, sources(deps));

    return intersectionObserverEntry;
};

export default useIntersection;