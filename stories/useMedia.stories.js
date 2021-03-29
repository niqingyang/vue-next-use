import {useMedia,} from "../src/index";
import {ShowDemo, ShowDocs} from './util/index';

export default {
    title: 'Sensors/useMedia',
    argTypes: {},
};

export const Docs = ShowDocs(require('../docs/useMedia.md'));

export const Demo = ShowDemo({
    setup() {
        const isWide = useMedia('(min-width: 480px)');

        return () => (
            <div>
                Screen is wide: {isWide.value ? 'Yes' : 'No'}
            </div>
        );
    }
});





