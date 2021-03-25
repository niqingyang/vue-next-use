import {useFavicon} from "../src/index";
import {ShowDemo, ShowDocs} from './util/index';
import NewTabStory from './util/NewTabStory';

export default {
    title: 'SideEffects/useFavicon',
    argTypes: {},
};

export const Docs = ShowDocs(require('../docs/useFavicon.md'));

export const Demo = ShowDemo({
    setup() {
        useFavicon('https://cdn.sstatic.net/Sites/stackoverflow/img/favicon.ico');
        return () => {
            return (
                <NewTabStory>Favicon should be the Stack Overflow logo</NewTabStory>
            )
        }
    }
});

