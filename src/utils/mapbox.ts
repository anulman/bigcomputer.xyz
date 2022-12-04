import _ from 'lodash';
import * as mapbox from '@mapbox/search-js-core';

export type Address = mapbox.AutofillSuggestion & {
  // idk why these aren't in the official typings, but we get them from the api!
  place: string;
  region_code: string;
};

type AbortableSearchResults = Promise<Address[]> & { abort: () => void };

const autofill = new mapbox.MapboxAutofill({ accessToken: process.env.NEXT_PUBLIC_MAPBOX_PUBLIC_TOKEN });
const getSessionToken = _.memoize(() => new mapbox.SessionToken());

export const search = (query: string, limit = 4): AbortableSearchResults => {
  const controller = new AbortController();
  const results = autofill.suggest(query, {
    sessionToken: getSessionToken(),
    signal: controller.signal,
    limit,
  })
    .then(({ suggestions }) => suggestions);

  (results as AbortableSearchResults).abort = controller.abort.bind(controller);

  return results as AbortableSearchResults;
};
