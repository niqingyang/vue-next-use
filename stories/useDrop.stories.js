import {ref as useRef} from 'vue';
import {useDrop} from "../src/index";
import {ShowDemo, ShowDocs} from './util/index';

export default {
    title: 'UI/useDrop',
    argTypes: {},
};

export const Docs = ShowDocs(require('../docs/useDrop.md'));

export const Demo = ShowDemo({
    setup(props) {

        const state = useDrop({
            onFiles: (...args) => console.log('onFiles', ...args),
            onUri: (...args) => console.log('onUri', ...args),
            onText: (...args) => console.log('onText', ...args),
        });

        return () => {

            const style = {
                width: '300px',
                height: '200px',
                margin: '50px auto',
                border: '1px dotted #000',
                textAlign: 'center',
                lineHeight: '200px',
                ...(state.over
                    ? {
                        border: '1px dotted green',
                        outline: '3px solid yellow',
                        background: '#f8f8f8',
                    }
                    : {}),
            };

            return (
                <div>
                    <div style={style}>Drop anywhere on page</div>
                    <div style={{maxWidth: '300px', margin: '0 auto'}}>
                        <ul style={{margin: '0', padding: '10px 18px'}}>
                            <li>
                                See logs in <code>Actions</code> tab.
                            </li>
                            <li>Drag in and drop files.</li>
                            <li>
                                <code>Cmd + V</code> paste text here.
                            </li>
                            <li>Drag in images from other tabs.</li>
                            <li>Drag in link from navigation bar.</li>
                            <li>Below is state returned by the hook:</li>
                        </ul>
                        <pre>{JSON.stringify(state, null, 4)}</pre>
                    </div>
                </div>
            )
        };
    }
});

