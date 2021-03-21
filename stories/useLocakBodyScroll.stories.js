import {useLockBodyScroll, useToggle, useRef, useState} from "../src/index";
import {Frame} from '../src/useFrame'
import {ShowDemo, ShowDocs} from './util/index';

export default {
    title: 'SideEffects/useLockBodyScroll',
    argTypes: {},
};

export const Docs = ShowDocs(require('../docs/useLockBodyScroll.md'));

export const Demo = ShowDemo({
    setup() {

        const [locked, toggleLocked] = useToggle(false);

        useLockBodyScroll(locked);

        return () => (
            <div style={{ height: '200vh' }}>
                <button onClick={() => toggleLocked()} style={{ position: 'fixed', left: '0' }}>
                    {locked.value ? 'Unlock' : 'Lock'}
                </button>
            </div>
        );
    }
});

export const AnotherComponent = ShowDemo({
    setup(){
        const [locked, toggleLocked] = useToggle(false);
        useLockBodyScroll(locked);

        return () => (
            <button onClick={() => toggleLocked()} style={{ position: 'fixed', left: '0', top: '40px' }}>
                {locked.value ? 'Unlock' : 'Lock'}
            </button>
        );
    }
});

export const IframeComponent = ShowDemo({
    setup(){
        const [mainLocked, toggleMainLocked] = useToggle(false);
        const [iframeLocked, toggleIframeLocked] = useToggle(false);
        const iframeElementRef = useRef<HTMLIFrameElement>(null);

        useLockBodyScroll(mainLocked);
        useLockBodyScroll(iframeLocked, iframeElementRef);

        return () => (
            <div style={{ height: '200vh' }}>
                <Frame style={{ height: '50vh', width: '50vw' }}>
                    <div style={{ height: '200vh' }} ref={iframeElementRef}>
                        <button onClick={() => toggleMainLocked()} style={{ position: 'fixed', left: '0', top: '0' }}>
                            {mainLocked.value ? 'Unlock' : 'Lock'} main window scroll
                        </button>
                        <button
                            onClick={() => toggleIframeLocked()}
                            style={{ position: 'fixed', left: '0', top:'64px' }}>
                            {iframeLocked.value ? 'Unlock' : 'Lock'} iframe window scroll
                        </button>
                    </div>
                </Frame>
            </div>
        );
    }
});

export const TwoHooksOnPage = ShowDemo({
    setup(){
        return () => (
            <>
                <AnotherComponent />
                <Demo />
                <IframeComponent />
            </>
        );
    }
});

export const FrameDemo = ShowDemo({
    setup(){

        const [count, set] = useState(1);

        const contentMounted = () => {
            console.log('contentMounted')
        }
        const contentUpdated = () => {
            console.log('contentUpdated')
        }

        const increame = () => {
            console.log('increame')
            set((c)=>c+1)
        }

        return () => (
            <>
                <button onClick={()=>set((c)=>c+1)}>increame</button>{count.value}
                <Frame style={{ height: '50vh', width: '50vw' }} contentMounted={contentMounted} contentUpdated={contentUpdated}>
                    <button onClick={increame}>{count.value}</button>
                </Frame>
            </>
        );
    }
});