import React from 'react';

import Layout from '../components/layout';
import { useUser } from '../lib/user';
import withAuth from '../components/with-auth';

export function ProtectedPage() {
  const { user, loading } = useUser();

  return (
    <Layout user={user} loading={loading}>
      <h1>Protected Page</h1>

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

export default withAuth(ProtectedPage);
