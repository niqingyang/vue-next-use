import {onMounted, watch} from "vue";
import {ShowDemo, ShowDocs} from './util/index';
import {useHash, useState} from "../src/index";

export default {
    title: 'Sensors/useHash',
    argTypes: {},
};

export const Docs = ShowDocs(require('../docs/useHash.md'));

export const Demo = ShowDemo({
    setup() {
        const [href, setHref] = useState(window.location.href);
        const [hash, setHash] = useHash();

        onMounted(() => {
            setHash('#/path/to/page?userId=123');
        });

        watch(hash, () => {
            setHref(window.location.href);
        });

        return () => (
            <div>
                <div>window.location.href:</div>
                <div>
                    <pre>{href.value}</pre>
                </div>
                <div>Edit hash:</div>
                <div>
                    <input style="width: 100%;" v-model={hash.value}/>
                </div>
            </div>
        )
    },
});




