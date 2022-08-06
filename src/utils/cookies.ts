type Cookies = Record<string, unknown> & {
  LastLoadedAt: number;
  LastUnloadedAt: number;
};

const MAX_COOKIE_AGE_IN_SECONDS = 60 /* secs */ * 60 /* mins */ * 24 /* hrs */ * 365;

export const getLatest = (): Cookies => Object.fromEntries(
  document.cookie.split(';')
    .map((val) => val.trim().split('='))
);

export const setCookie = <Key extends keyof Cookies>(name: Key, value: Cookies[Key], expiresAt?: Date) => {
  document.cookie = `${name}=${
    typeof value === 'string' ? encodeURIComponent(value) : value
  }; ${expiresAt
    ? `expires=${expiresAt.toUTCString()}`
    : `max-age=${MAX_COOKIE_AGE_IN_SECONDS}`
  }; secure;`;
};