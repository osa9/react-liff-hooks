import React, { useState, useEffect } from 'react';
import useLiff, { LiffData, Liff, LineProfile } from 'react-use-liff';

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
      <p>react-use-liff</p>
      {loading && ('loading')}
      {error && `Error: ${error.message}`}
      {liff && data && (
        <div>
          <LiffInfo data={data} liff={liff} />
        </div>)}
    </div>
  );
}

export default App;
