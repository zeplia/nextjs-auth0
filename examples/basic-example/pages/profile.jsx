import React from 'react';

import Layout from '../components/layout';
import { useUser } from '../lib/user';

export default function Profile() {
  const { user, loading } = useUser();

  return (
    <Layout>
      <h1>Profile</h1>

      {loading && <p>Loading profile...</p>}

      {!loading && user && (
        <>
          <p>Profile:</p>
          <pre>{JSON.stringify(user, null, 2)}</pre>
        </>
      )}
    </Layout>
  );
}
