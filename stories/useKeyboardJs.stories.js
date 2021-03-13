import {computed, reactive, unref} from "vue";
import {useKeyPressEvent, useKeyboardJs, useState} from '../src/index'
import {ShowDemo, ShowDocs} from './util/index';
import {CenterStory} from './util/CenterStory';
import './util/github-markdown.css';

export default {
    title: 'Sensors/useKeyboardJs',
    argTypes: {},
};

export const Docs = ShowDocs(require('../docs/useKeyPressEvent.md'));

export const Demo = ShowDemo({
    props: {
        combo: {
            type: String,
            required: true
        }
    },
    components: {
        CenterStory
    },
    setup(props) {
        const {combo} = props;
        const [pressed] = useKeyboardJs(combo);

        return () => (
            <CenterStory>
                <div style={{textAlign: 'center'}}>
                    Press{' '}
                    <code
                        style={{color: 'red', background: '#f6f6f6', padding: '3px 6px', borderRadius: '3px'}}>
                        {combo}
                    </code>{' '}
                    combo
                    <br/>
                    <br/>
                    <div style={{fontSize: '4em'}}>{pressed.value ? '💋' : ''}</div>
                </div>
            </CenterStory>
        );
    },
}, {
    combo: 'i + l + u'
});




