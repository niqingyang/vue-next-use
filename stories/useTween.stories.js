import {computed} from "vue";
import {useTween, useCss, useList} from "../src/index";
import {ShowDemo, ShowDocs} from './util/index';

export default {
    title: 'Animation/useTween',
    argTypes: {
        easingName: {
            control: {
                type: 'select',
                options: [
                    'linear',
                    'quadratic',
                    'cubic',
                    'elastic',
                    'inQuad',
                    'outQuad',
                    'inOutQuad',
                    'inCubic',
                    'outCubic',
                    'inOutCubic',
                    'inQuart',
                    'outQuart',
                    'inOutQuart',
                    'inQuint',
                    'outQuint',
                    'inOutQuint',
                    'inSine',
                    'outSine',
                    'inOutSine',
                    'inExpo',
                    'outExpo',
                    'inOutExpo',
                    'inCirc',
                    'outCirc',
                    'inOutCirc',
                ],
            },
        },
    },
};

export const Docs = ShowDocs(require('../docs/useTween.md'));

export const Demo = ShowDemo({
    props: {
        easingName: {
            type: String,
            default: 'inCirc'
        },
        ms: {
            type: Number,
            default: 200
        },
        delay: {
            type: Number,
            default: 0
        },
    },
    setup(props) {
        const t = useTween(props.easingName, props.ms, props.delay);

        return () => (
            <div>
                Tween: {t.value * 100}
            </div>
        );
    }
}, {
    easingName: 'inCirc',
    ms: 200,
    delay: 0,
});

const Track = {
    props: {
        easingName: {
            type: String,
            default: 'inCirc'
        },
        ms: {
            type: Number,
            default: 200
        },
        delay: {
            type: Number,
            default: 0
        },
    },
    setup(props) {
        const target = 476;

        const value = useTween(props.easingName, props.ms, props.delay);

        const className = useCss(computed(() => {
            return {
                position: 'absolute',
                top: '20px',
                left: '0px',
                fontSize: '32px'
            }
        }));

        const [paths, {push}] = useList();

        const trackClassName = useCss(computed(() => {

            const left = Math.round(value.value * target) + "px";

            push(left);

            return {
                border: "2px solid #eee",
                padding: "8px 0",
                // height: "20px",
                margin: "5px 0",
                position: "relative",
                '& .box': {
                    padding: '5px',
                    left: left,
                    width: '10px',
                    height: '10px',
                    position: 'absolute',
                    background: 'red',
                    borderRadius: '50%',
                },
                '& .label': {
                    paddingLeft: '24px',
                    fontSize: '14px',
                    lineHeight: '20px',
                },
                '& .box-point': {
                    padding: '5px',
                    width: '5px',
                    height: '5px',
                    top: '10px',
                    position: 'absolute',
                    background: '#ff00001a',
                    borderRadius: '50%',
                }
            }
        }));

        return () => (
            <div>
                <div class={trackClassName}>
                    <div>
                        <span className="box"></span>
                        {paths.value.map((value) => (
                            <span className="box-point" style={{left: value}}></span>
                        ))}
                        <span className="label" style="left: 5px;">{props.easingName}</span>
                    </div>
                </div>
            </div>
        );
    }
}

export const EasingDemo = ShowDemo({
    props: {
        ms: {
            type: Number,
            default: 200
        },
        delay: {
            type: Number,
            default: 0
        },
    },
    setup(props) {

        const easingNames = [
            'linear',
            'quadratic',
            'cubic',
            'elastic',
            'inQuad',
            'outQuad',
            'inOutQuad',
            'inCubic',
            'outCubic',
            'inOutCubic',
            'inQuart',
            'outQuart',
            'inOutQuart',
            'inQuint',
            'outQuint',
            'inOutQuint',
            'inSine',
            'outSine',
            'inOutSine',
            'inExpo',
            'outExpo',
            'inOutExpo',
            'inCirc',
            'outCirc',
            'inOutCirc',
        ];

        return () => (
            <div>
                <div style="width: 500px; margin-left: 50px;">
                    {easingNames.map((name)=>(
                        <Track easingName={name} ms={props.ms} delay={props.delay}></Track>
                    ))}
                </div>
            </div>
        );
    }
}, {
    ms: 3000,
    delay: 1000,
});

