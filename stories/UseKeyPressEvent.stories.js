import {computed, unref} from "vue";
import {useKeyPressEvent, useState} from '../src/index'
import {ShowDemo, ShowDocs} from './util/index';
import './util/github-markdown.css';

export default {
    title: 'Sensors/useKeyPressEvent',
    argTypes: {},
};

export const Docs = ShowDocs({md: require('../docs/useKeyPressEvent.md')});

export const Demo = ShowDemo({
    setup() {
        const [count, setCount] = useState(0);

        const increment = () => setCount(count => ++count);
        const decrement = () => setCount(count => --count);
        const reset = () => setCount(0);

        useKeyPressEvent(']', increment);
        useKeyPressEvent('[', decrement);
        useKeyPressEvent('r', reset);

        return () => (
            <div className="markdown-body" onClick={increment}>
                <p>
                    Try pressing <code>[</code>, <code>]</code>, and <code>r</code> to
                    see the count incremented and decremented.</p>
                <p>Count: {count.value}</p>
            </div>
        )
    },

});





