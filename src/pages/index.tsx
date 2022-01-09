import * as React from 'react';
import { styled } from 'linaria/react';
import * as windups from 'windups';
// todo - LineBreaker?, CharacterWrappers...

import { Avatar } from '@src/components/Avatar';

const BEAT_MS = 300;
const Page = styled.main`
  @apply mx-auto;

  font-size: 1rem;
  max-width: 72ch;
  width: 100%;
  padding: 3rem 0;
  line-height: 1.3;

  > p + p {
    margin-top: 1rem;
  }
`;

export default function HomePage(): JSX.Element {
  // todo - enum?
  const [currentParagraph, setCurrentParagraph] = React.useState(-1);
  const pauseThenMoveToNextParagraph = React.useCallback(
    () => setTimeout(() => setCurrentParagraph(currentParagraph + 1), 3 * BEAT_MS),
    [currentParagraph],
  );

  React.useEffect(() => { pauseThenMoveToNextParagraph(); }, []);

  return <Page>
    <Avatar size={25} />

    {currentParagraph >= 0 && <Paragraph onFinished={pauseThenMoveToNextParagraph}>
      In 1966, <windups.Pause ms={BEAT_MS} />
      three years before the ARPAnet delivered its first packet [1] <windups.Pause ms={2 * BEAT_MS} />
      and two years before engelbart&apos;s mother of all demos [2], <windups.Pause ms={2 * BEAT_MS} />
      a father/daughter duo [3] published a history of the internet in a Swedish sci-fi novel.
    </Paragraph>}

    {currentParagraph >= 1 && <Paragraph onFinished={pauseThenMoveToNextParagraph}>
      Tale of the Big Computer was first translated, published, and widely panned in 1968 [4].
      It has built a small following over the last 50-odd years for its uncanny prescience;
      the authors describe in vivid detail not just how we interface with a global system of interconnected computers,
      but also how that system acts on us [5].
    </Paragraph>}

    {currentParagraph >= 2 && <Paragraph onFinished={pauseThenMoveToNextParagraph}>
      We are publishing a new English edition of this Swedish cult classic.
      The original books have become quite rare and expensive [6],
      and the 1968 translation is both unnecessarily and inaccurately gendered [7].
    </Paragraph>}

    {currentParagraph >= 3 && <Paragraph onFinished={pauseThenMoveToNextParagraph}>
      Pledge $15 or 15 DAI to join our community,
      receive a limited &quot;first edition&quot; ebook at release, and more [8].
    </Paragraph>}
  </Page>;
}

const Paragraph = ({ children, onFinished }: React.PropsWithChildren<{onFinished: () => unknown}>): JSX.Element => (
  <p>
    <windups.WindupChildren onFinished={onFinished}>
      {children}
    </windups.WindupChildren>
  </p>
);
