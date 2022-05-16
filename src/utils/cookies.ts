type Cookies = Record<string, unknown> & {
  AnonymousId: string;
  LastLoadedAt: number;
};

export const getLatest = (): Cookies => Object.fromEntries(
  document.cookie.split(';')
    .map((val) => val.trim().split('='))
);
