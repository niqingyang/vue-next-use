import {ShowDemo, ShowDocs} from './util/index';
import {useEvent, useList} from "../src";

export default {
    title: 'Sensors/useEvent',
    argTypes: {},
};

export const Docs = ShowDocs(require('../docs/useEvent.md'));

export const Demo = ShowDemo({
    setup() {
        const [list, {push, clear}] = useList();

        const onKeyDown = ({key}) => {
            if (key === "r") {
                clear();
            }
            push(key);
        };

        useEvent("keydown", onKeyDown);

        return () => (
            <div>
                <p>
                    Press some keys on your keyboard, <code style="color: tomato">r</code> key
                    resets the list
                </p>
                <pre>
                  {JSON.stringify(list.value, null, 2)}
                </pre>
            </div>
        );
    },
});




