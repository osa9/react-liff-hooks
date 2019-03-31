# react-liff-hooks

A React hook to handle [LINE Front-end Framework (LIFF)](https://developers.line.biz/ja/docs/liff/)

# Installation
`npm install --save react-liff-hooks`

# Usage
See example folder for full example


Currently you have to manually import LIFF library in HTML file before using useLiff.
```html
<script src="https://d.line-scdn.net/liff/1.0/sdk.js"></script>
```

```tsx
import React, { useState, useEffect } from 'react';
import useLiff, { LiffData, Liff, LineProfile } from 'react-liff-hooks';

const LiffInfo: React.FC<{ data: LiffData, liff: Liff }> = ({ data, liff }) => {
  const [profile, setProfile] = React.useState<LineProfile>();
  const [error, setError] = React.useState<string>();

  React.useEffect(() => {
    new Promise(async (resolve) => {
      try {
        const profile = await liff.getProfile();
        setProfile(profile);
      } catch (err) {
        setError(err);
      }
      resolve();
    });
  });

  if (profile) {
    return <table>
      <tr><td>language</td><td>{data.language}</td></tr>
      <tr><td>type</td><td>{data.context.type}</td></tr>
      <tr><td>utouId</td><td>{data.context.utouId}</td></tr>
      <tr><td>roomId</td><td>{data.context.roomId}</td></tr>
      <tr><td>groupId</td><td>{data.context.groupId}</td></tr>
      <tr><td>userId</td><td>{profile.userId}</td></tr>
      <tr><td>displayName</td><td>{profile.displayName}</td></tr>
      <tr><td>picture</td><td><img src={profile.pictureUrl} style={{ width: '96px' }} /></td></tr>
      <tr><td>statusMessage</td><td><img src={profile.statusMessage} /></td></tr>
    </table>
  } else if (error) {
    return <p>ERROR: {error}</p>
  } else {
    return <p>Fetching profile...</p>
  }
}

const App: React.FC = () => {
  const [loading, error, liff, data] = useLiff();

  return (
    <div>
      <p>react-liff-hooks</p>
      {loading && 'loading'}
      {error && `Error: ${error.message}`}
      {liff && data && (
        <LiffInfo data={data} liff={liff} />
      )}
    </div>
  );
}

export default App;
```

# API
```tsx
const [loading, error, liff, data] = useLiff();
```

Returns:
- `loading`: A `boolean` to indicate if the liff.init is not finished
- `error`: An optional `Error`
- `liff`: A `liff` instance. (See https://developers.line.biz/ja/reference/liff/ )
- `data`: A data object returned from `liff.init`

# Warning
**NEVER** use raw userId for authentication or quering user's private data;
all values(e.g. userId) may be altered by users.

Use liff.getAccessToken() to get access token and verify channelId/userId in server side.

An example to authenticate with firebase functions:
```ts
const verifyLineParameter = async (userId: string, channelId: string, accessToken: string): Promise<boolean> => {
    try {
        const verify_url = `https://api.line.me/oauth2/v2.1/verify?access_token=${accessToken}`;
        const profile_url = 'https://api.line.me/v2/profile';
        const [verify_res, profile_res] = await Promise.all([
            fetch(verify_url),
            fetch(profile_url, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            })
        ]);

        if (verify_res.status !== 200 || profile_res.status !== 200) {
            return false;
        }

        const verify = await verify_res.json();
        if (verify.client_id !== channelId) {
            return false;
        }

        const profile = await profile_res.json();
        if (profile.userId !== userId) {
            return false;
        }

        return true;
    } catch (err) {
        console.log(err.message);
        return false;
    }
}

export const authenticate = functions.https.onCall(async (data, context) => {
    const { userId, accessToken } = data;
    const channelId = '<YOUR CHANNEL ID>'; 

    if (!userId || !accessToken) {
        throw new functions.https.HttpsError("invalid-argument", "userId/accessToken is undefined");
    }

    try {
        const res = await verifyLineParameter(userId, channelId, accessToken);
        if (!res) {
            return { status: 'error', message: 'Invalid userId/accessToken' };
        }

        const customToken = await admin.auth().createCustomToken(userId);
        return { status: 'success', customToken: customToken };
    } catch (err) {
        throw new functions.https.HttpsError("invalid-argument", err.message);
    }
});
```

# License
MIT