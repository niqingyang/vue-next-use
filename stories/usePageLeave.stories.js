import {usePageLeave} from "../src/index";
import {ShowDemo, ShowDocs} from './util/index';
import { action } from '@storybook/addon-actions';

export default {
    title: 'Sensors/usePageLeave',
    argTypes: {},
};

export const Docs = ShowDocs(require('../docs/usePageLeave.md'));

export const Demo = ShowDemo({
    setup() {
        usePageLeave(action("onPageLeave"));

        return () => (
            <div>
                Try leaving the page and see logs in <code>Actions</code> tab.
            </div>
        );
    }
});





