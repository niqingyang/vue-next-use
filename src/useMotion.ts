import {useEffect, useReactive, useState} from './index';
import {off, on} from './misc/util';

export interface MotionSensorState {
    acceleration: {
        x: number | null;
        y: number | null;
        z: number | null;
    };
    accelerationIncludingGravity: {
        x: number | null;
        y: number | null;
        z: number | null;
    };
    rotationRate: {
        alpha: number | null;
        beta: number | null;
        gamma: number | null;
    };
    interval: number | null;
}

const defaultState: MotionSensorState = {
    acceleration: {
        x: null,
        y: null,
        z: null,
    },
    accelerationIncludingGravity: {
        x: null,
        y: null,
        z: null,
    },
    rotationRate: {
        alpha: null,
        beta: null,
        gamma: null,
    },
    interval: 16,
};

const useMotion = (initialState: MotionSensorState = defaultState) => {
    const [state, setState] = useReactive(initialState);

    const handler = (event) => {
        const {acceleration, accelerationIncludingGravity, rotationRate, interval} = event;

        setState({
            acceleration: {
                x: acceleration.x,
                y: acceleration.y,
                z: acceleration.z,
            },
            accelerationIncludingGravity: {
                x: accelerationIncludingGravity.x,
                y: accelerationIncludingGravity.y,
                z: accelerationIncludingGravity.z,
            },
            rotationRate: {
                alpha: rotationRate.alpha,
                beta: rotationRate.beta,
                gamma: rotationRate.gamma,
            },
            interval,
        });
    };

    let hasGranted = false;

    const needGrantPermission = typeof DeviceMotionEvent.requestPermission === 'function';

    const requestPermisson = () => {
        if (needGrantPermission) {

            if (hasGranted) return;

            hasGranted = true;

            return DeviceMotionEvent.requestPermission().then(function (state) {
                if ('granted' === state) {
                    on(window, 'devicemotion', handler);
                }
            });
        }
        return new Promise((resolve: Function) => {
            resolve({state: ''});
        });
    };

    useEffect(() => {
        if (!needGrantPermission) {
            on(window, 'devicemotion', handler);
        }

        return () => {
            off(window, 'devicemotion', handler);
        };
    }, []);

    return [state, requestPermisson];
};

export default useMotion;
