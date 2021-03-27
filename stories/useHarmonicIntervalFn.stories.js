import {useHarmonicIntervalFn, useInterval, useTimeoutFn, useState} from "../src/index";
import {ShowDemo, ShowDocs} from './util/index';
import {computed, watch} from "vue";

export default {
    title: 'Animation/useHarmonicIntervalFn',
    argTypes: {},
};

export const Docs = ShowDocs(require('../docs/useHarmonicIntervalFn.md'));

const Clock = {
    props: {
        useInt: {}
    },
    setup({useInt}) {
        const [count, setCount] = useState(0);

        useInt(() => {
            setCount((cnt) => cnt + 1);
        }, 1000);

        let m = computed(() => {
            let m = Math.floor(count.value / 60);
            return m < 10 ? '0' + m : String(m);
        });

        let s = computed(() => {
            let s = count.value % 60;
            return s < 10 ? '0' + s : String(s);
        });

        const style = {
            padding: '20px 5px',
            border: '1px solid #fafafa',
            float: 'left',
            fontFamily: 'monospace',
        };

        return () => (
            <div style={style}>{m.value + ':' + s.value}</div>
        );
    }
};

const Example = {
    props: {
        useInt: {}
    },
    setup(props) {

        const useInt = props.useInt;

        const [showSecondClock, setShowSecondClock] = useState(false);

        useTimeoutFn(() => {
            setShowSecondClock(true);
        }, 500);

        const headingStyle = {
            fontFamily: 'sans',
            fontSize: '20px',
            padding: '0',
            lineHeight: '1.5em',
        };

        const rowStyle = {
            width: '100%',
            clear: 'both',
        };

        return () => (
            <>
                <div style={rowStyle}>
                    <h2 style={headingStyle}>{useInt.name}</h2>
                    <Clock useInt={useInt}/>
                    {showSecondClock ? <Clock useInt={useInt}/> : null}
                </div>
            </>
        );
    }
}

export const Demo = ShowDemo({
    setup() {
        return () => (
            <>
                <Example useInt={useInterval}/>
                <br/>
                <br/>
                <br/>
                <br/>
                <br/>
                <Example useInt={useHarmonicIntervalFn}/>
            </>
        );
    }
});

