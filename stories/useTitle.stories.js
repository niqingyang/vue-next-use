import {useTitle} from "../src/index";
import {ShowDemo, ShowDocs} from './util/index';
import NewTabStory from './util/NewTabStory';

export default {
    title: 'SideEffects/useTitle',
    argTypes: {},
};

export const Docs = ShowDocs(require('../docs/useTitle.md'));

export const Demo = ShowDemo({
    setup() {

        useTitle('Hello world!');

        return () => (
            <NewTabStory>Title should be "Hello world!"</NewTabStory>
        );
    }
});

