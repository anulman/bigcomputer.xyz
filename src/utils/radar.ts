// decided not to use `radar-sdk-js` because:
//
// - it does not include ts typings
// - it does not support tree-shaking and is 15kb minified + gzipped
//
// since we only need the autocomplete api, let's just call it via plain ol' https

const AUTOCOMPLETE_URL = 'https://api.radar.io/v1/search/autocomplete';

export type Address = {
  addressLabel: string;
  borough: string;
  city: string;
  country: string;
  countryCode: string;
  countryFlag: string;
  distance: number;
  formattedAddress: string;
  geometry: {
    coordinates: [number, number];
    type: 'Point';
  };
  latitude: number;
  layer: string;
  longitude: number;
  neighborhood: string;
  number: string;
  postalCode: string;
  state: string;
  stateCode: string;
  street: string;
};

type AbortableSearchResults = Promise<Address[]> & { abort: () => void };

export const search = (query: string, limit = 4): AbortableSearchResults => {
  const url = new URL(AUTOCOMPLETE_URL);
  const controller = new AbortController();

  url.searchParams.set('query', query);
  url.searchParams.set('layers', 'address');
  url.searchParams.set('limit', `${limit}`);

  const results = fetch(url, {
    signal: controller.signal,
    headers: {
      Authorization: process.env.NEXT_PUBLIC_RADAR_PUBLISHABLE_KEY,
    },
  })
    .then((res) => res.json())
    .then((json) => json.addresses ?? []);

  (results as AbortableSearchResults).abort = controller.abort.bind(controller);

  return results as AbortableSearchResults;
};
