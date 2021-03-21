import {useFavicon} from "../src/index";
import {ShowDemo, ShowDocs} from './util/index';

export default {
    title: 'SideEffects/useFavicon',
    argTypes: {},
};

export const Docs = ShowDocs(require('../docs/useFavicon.md'));

export const Demo = ShowDemo({
    setup() {
        useFavicon('https://cdn.sstatic.net/Sites/stackoverflow/img/favicon.ico');
        return () => {

            if (window != top.window) {
                return (
                    <div>
                        This story should be
                        <a
                            target="_blank"
                            href="/iframe.html?id=sideeffects-usefavicon--demo&viewMode=story"
                        >
                            opened in a new tab
                        </a>.
                    </div>
                )
            }

            return (
                <div>Favicon should be the Stack Overflow logo</div>
            )
        }
    }
});

