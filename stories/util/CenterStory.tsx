export const CenterStory = {
    render({$slots}) {
        return (
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    maxWidth: '400px',
                    margin: '40px auto',
                }}>
                <div style={{width: '100%'}}>{$slots.default()}</div>
            </div>
        )
    }
};
