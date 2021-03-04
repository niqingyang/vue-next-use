import {computed, isRef, Ref, unref, watch, watchEffect} from 'vue';
import {useEffect, useState} from "./index";
import {Spring, SpringSystem} from 'rebound';

const useSpring = (targetValue: number | Ref<number> = 0, tension: number | Ref<number> = 50, friction: number | Ref<number> = 3) => {
    const [spring, setSpring] = useState<Spring | null>(null);
    const [value, setValue] = useState<number>(unref(targetValue));

    // memoize listener to being able to unsubscribe later properly, otherwise
    // listener fn will be different on each re-render and wouldn't unsubscribe properly.
    const listener = {
        onSpringUpdate: (currentSpring) => {
            const newValue = currentSpring.getCurrentValue();
            setValue(newValue);
        },
    };

    useEffect(() => {
        if (!spring.value) {
            const newSpring = new SpringSystem().createSpring(unref(tension), unref(friction));
            newSpring.setCurrentValue(unref(targetValue));
            setSpring(newSpring);
            newSpring.addListener(listener);
        }

        return () => {
            if (spring.value) {
                spring.value.removeListener(listener);
                setSpring(null);
            }
        };
    }, [
        computed(() => {
            return unref(tension)
        }),
        computed(() => {
            return unref(friction)
        })
    ]);

    useEffect(() => {
        if (spring.value) {
            spring.value.setEndValue(unref(targetValue));
        }
    }, isRef(targetValue) ? targetValue : null);

    return value;
};

export default useSpring;