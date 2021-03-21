import {useEffect, useState} from './index';

const useError = (): ((err: Error) => void) => {
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (error.value) {
            throw error.value;
        }
    }, [error]);

    const dispatchError = (err: Error) => {
        setError(err);
    };

    return dispatchError;
};

export default useError;
