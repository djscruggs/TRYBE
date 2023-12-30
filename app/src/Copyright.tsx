import * as React from 'react';
import { Link } from '@remix-run/react';
export default function Copyright() {
  return (
    <h1>
      {'Copyright © '}
      <Link color="inherit" to="https://www.jointhetrybe.com/">
        Trybe
      </Link>{' '}
      2023-{new Date().getFullYear()}.
    </h1>
  );
}
