import {useBreakpoint} from "../src/index";
import {ShowDemo, ShowDocs} from './util/index';

export default {
    title: 'Sensors/useBreakpoint',
    argTypes: {},
};

export const Docs = ShowDocs(require('../docs/useBreakpoint.md'));

export const Demo = ShowDemo({
    setup() {
        const breakpointA = useBreakpoint();
        const breakpointB = useBreakpoint({mobileM: 350, laptop: 1024, tablet: 768});
        return () => (
            <div>
                <p>{'try resize your window'}</p>
                <p>{'createBreakpoint() #default : { laptopL: 1440, laptop: 1024, tablet: 768 }'}</p>
                <p>{breakpointA.value}</p>
                <p>{'createBreakpoint({ mobileM: 350, laptop: 1024, tablet: 768 })'}</p>
                <p>{breakpointB.value}</p>
            </div>
        );
    }
});





