import {useCookie, useState, useEffect} from "../src/index";
import {ShowDemo, ShowDocs} from './util/index';

export default {
    title: 'SideEffects/useCookie',
    argTypes: {},
};

export const Docs = ShowDocs(require('../docs/useCookie.md'));

export const Demo = ShowDemo({
    setup() {

        const [value, updateCookie, deleteCookie] = useCookie("my-cookie");
        const [counter, setCounter] = useState(1);

        useEffect(() => {
            deleteCookie();
        }, []);

        const updateCookieHandler = () => {
            updateCookie(`my-awesome-cookie-${counter.value}`);
            setCounter(c => c + 1);
        };

        return () => (
            <div>
                <p>Value: {value.value}</p>
                <button onClick={updateCookieHandler}>Update Cookie</button>
                <br/>
                <button onClick={deleteCookie}>Delete Cookie</button>
            </div>
        );
    }
});

