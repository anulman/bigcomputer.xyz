import React, { ReactNode } from 'react';

import { Button } from '../components/Button';

export default function HomePage(): ReactNode {
  return <main>
    <h1>Welcome to Next.js!</h1>
    <Button type='button'>im a linaria-styled button</Button>
  </main>;
}
