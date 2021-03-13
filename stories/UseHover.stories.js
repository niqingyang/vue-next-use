import {h, unref} from "vue";
import {ShowDemo, ShowDocs} from './util/index';
import {useHover} from "../src/index";

export default {
    title: 'Sensors/useHover',
    argTypes: {},
};

export const Docs = ShowDocs(require('../docs/useHover.md'));

export const Demo = ShowDemo({
    setup() {
        const element = (hovered) => h({
            render() {
                return (
                    <div>Hover me! {unref(hovered) ? "Thanks" : ""}</div>
                );
            }
        }, {
            onMouseEnter: () => {
                console.log('onMouseEnter')
            },
            onMouseLeave: () => {
                console.log('onMouseLeave')
            }
        });

        const [Hoverable, hovered] = useHover(element);

        const mouseenter = () => {
            console.log("mouseenter");
        };

        const mouseleave = () => {
            console.log("mouseleave");
        }

        return () => (
            <div>
                <Hoverable onMouseenter={mouseenter} onMouseleave={mouseleave}/>
                <div>{hovered.value ? "HOVERED" : ""}</div>
            </div>
        )
    },
});




