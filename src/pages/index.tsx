import { useEffect, useRef, useState } from 'react';
import { styled } from 'linaria/react';
import * as windups from 'windups';
// todo - LineBreakers, CharacterWrappers...

import Home from '../components/Home';

const BEAT_MS = 200;
const Page = styled.main`
  @apply mx-auto text-justify;

  font-family: Helvetica Neue;
  font-size: 16px;
  width: 72ch;

  > :first-child > p + p {
    margin-top: 1rem;
  }
`;

export default function HomePage(): JSX.Element {
  const pageRef = useRef<HTMLDivElement>(null);
  const [pageWidth, setPageWidth] = useState(300);

  useEffect(() => {
    if (pageRef.current) {
      const { width } = pageRef.current.getBoundingClientRect();

      setPageWidth(width);
    }
  }, [pageRef.current]);

  return <Page ref={pageRef}>
    <WoundUpText width={pageWidth}>
      <p>
        In 1966, <windups.Pause ms={BEAT_MS} />
        three years before the ARPAnet delivered its first packet [1] <windups.Pause ms={BEAT_MS} />
        and two years before engelbart's mother of all demos [2], <windups.Pause ms={2*BEAT_MS} />
        a father/daughter duo [3] published a history of the internet in a Swedish sci-fi novel.
      </p>
      <windups.Pause ms={2*BEAT_MS} />

      <p>
        Tale of the Big Computer was first translated, published, and widely panned in 1968 [4].
        It has built a small following over the last 50-odd years for its uncanny prescience;
        the authors describe in vivid detail not just how we interface with a global system of interconnected computers,
        but also how that system acts on us [5].
      </p>

      <p>
        We are publishing a new English edition of this Swedish cult classic.
        The original books have become quite rare and expensive [6],
        and the 1968 translation is both unnecessarily and inaccurately gendered [7].
      </p>

      <p>
        Pledge $15 or 15 DAI to join our community,
        receive a limited "first edition" ebook at release, and more [8].
      </p>
    </WoundUpText>
  </Page>;
}

const WoundUpText = ({ children, width }) => (
  typeof window === 'undefined'
    ? <windups.WindupChildren children={children} />
    : <windups.Linebreaker fontStyle={'16px Helvetica Neue'} width={width}>
      <windups.WindupChildren children={children} />
    </windups.Linebreaker>
);
