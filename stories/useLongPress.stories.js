import {ref} from "vue";
import {useLongPress} from "../src/index";
import {ShowDemo, ShowDocs} from './util/index';

export default {
    title: 'Sensors/useLongPress',
    argTypes: {},
};

export const Docs = ShowDocs(require('../docs/useLocation.md'));

export const Demo = ShowDemo({
    props: {
        delay: {
            default: 300
        },
        isPreventDefault: {
            default: true
        }
    },
    setup(props) {

        const {isPreventDefault, delay} = props;

        const count = ref(0)

        const onLongPress = () => {
            count.value += 1;
            console.log(`calls callback after long pressing ${delay}ms`);
        };

        const defaultOptions = {
            isPreventDefault,
            delay,
        };

        const longPressEvent = useLongPress(onLongPress, defaultOptions);

        return () => (
            <div>
                <button {...longPressEvent}>useLongPress</button>
                <span style={{marginLeft: '10px'}}>count: {count.value}</span>
            </div>
        );
    },
}, {
    isPreventDefault: true,
    delay: 300
});




