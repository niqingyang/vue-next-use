import {useRafState, useEffect} from "../src/index";
import {ShowDemo, ShowDocs} from './util/index';

export default {
    title: 'State/useRafState',
    argTypes: {},
};

export const Docs = ShowDocs(require('../docs/useRafState.md'));

export const Demo = ShowDemo({
    setup() {

        const [state, setState] = useRafState({
            clientWidth: 0,
            clientHeight: 0,
            innerWidth: 0,
            innerHeight: 0,
        });

        const [location, setLocation] = useRafState({
            x: 0,
            y: 0,
        });

        useEffect(() => {
            const onResize = (e) => {
                setState({
                    clientWidth: document.documentElement.clientWidth,
                    clientHeight: document.documentElement.clientHeight,
                    innerWidth: window.innerWidth,
                    innerHeight: window.innerHeight,
                });
            };

            const onMouseMove = (event) => {
                setLocation({x: event.clientX, y: event.clientY});
            };

            const onTouchMove = (event) => {
                setLocation({x: event.changedTouches[0].clientX, y: event.changedTouches[0].clientY});
            };

            window.addEventListener('resize', onResize);
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('touchmove', onTouchMove);

            return () => {
                window.removeEventListener('resize', onResize);
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('touchmove', onTouchMove);
            };
        });

        return () => (
            <div>
                <pre>{JSON.stringify(state.value, null, 2)}</pre>
                <pre>{JSON.stringify(location.value, null, 2)}</pre>
            </div>
        );
    }
});

