import { useEffect, useState } from 'react';

// For more info see https://developers.line.biz/ja/reference/liff/
export interface LiffData {
    language: string
    context: {
        type: 'utou' | 'room' | 'group' | 'none'
        viewType: 'full' | 'tall' | 'compact'
        userId: string | null
        utouId: string | null
        roomId: string | null
        groupId: string | null
    }
}

export interface LineProfile {
    userId: string
    displayName: string
    pictureUrl?: string
    statusMessage?: string
}

export interface Liff {
    init: (successCallback: (onData: LiffData) => void, errorCallback: (error: Error) => void) => void
    openWindow: (params: { url: string, external: boolean }) => void
    getAccessToken: () => string
    getProfile: () => Promise<LineProfile>
    sendMessages: (messages: object[]) => Promise<{}>
    closeWindow: () => void
}

const useLiff: () => [boolean, Error?, Liff?, LiffData?] = () => {
    const [error, setError] = useState<Error>();
    const [loading, setLoading] = useState(false);
    const [liffObj, setLiffObj] = useState<Liff>();
    const [data, setData] = useState<LiffData>();

    useEffect(() => {
        const liff = Function("return window.liff")() as Liff;
        if (!liff) {
            setError(new Error('Unable to get liff object. Check you have inserted <script src="https://d.line-scdn.net/liff/1.0/sdk.js"></script> in pubclic/index.html'));
        } else {
            liff.init((data) => {
                setData(data);
                setLiffObj(liff);
                setLoading(false);
            }, err => {
                setError(err);
            });
        }
    });

    return [loading, error, liffObj, data];
}

export default useLiff;