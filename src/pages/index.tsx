import * as React from 'react';
import { styled } from 'linaria/react';
import * as windups from '@anulman/windups';
// todo - LineBreaker?, CharacterWrappers...

import { Avatar } from '@src/components/Avatar';
import * as Footnote from '@src/components/Footnote';

const BEAT_MS = 300;
const Page = styled.main`
  @apply min-h-screen min-w-full;
  @apply relative z-0;
  @apply mx-auto;

  font-size: 1rem;
  padding: 3rem 0.5rem;
  line-height: 1.3;

  > canvas {
    @apply absolute bottom-0 right-0;

    z-index: -1;
  }

  > p {
    @apply w-full mx-auto;
    max-width: 72ch;

    + p {
      margin-top: 1rem;
    }
  }

  a {
    @apply underline;

    &:hover {
      @apply text-white;
    }
  }
`;

const MIN_AVATAR_SIZE = 300;

export default function HomePage(): JSX.Element {
  const [avatarSize, setAvatarSize] = React.useState(MIN_AVATAR_SIZE);
  const [isShowingFootnote, setIsShowingFootnote] = React.useState(false);

  const onShowFootnote = React.useCallback(() => setIsShowingFootnote(true), [setIsShowingFootnote]);
  const onHideFootnote = React.useCallback(() => setIsShowingFootnote(false), [setIsShowingFootnote]);

  React.useEffect(() => {
    const observer = new ResizeObserver(() => {
      const maxWindowSize = Math.min(window.innerWidth, window.innerHeight * 0.9);

      setAvatarSize(Math.max(300, maxWindowSize));
    });

    observer.observe(document.body);

    return () => observer.disconnect();
  }, []);

  return <Page>
    <Avatar size={avatarSize} />
    <Footnote.Container onShow={onShowFootnote} onHide={onHideFootnote}>
      <windups.WindupChildren isPaused={isShowingFootnote}>
        <p>
        In 1966, <windups.Pause ms={BEAT_MS} />
        three years before the ARPAnet delivered its first packet <Footnote.Reference value="1" /> <windups.Pause ms={2 * BEAT_MS} />
        and two years before engelbart&apos;s mother of all demos <Footnote.Reference value="another" />, <windups.Pause ms={2 * BEAT_MS} />
        a father/daughter duo <Footnote.Reference value={<><p>im a full paragraph ladedeada</p><ul><li>list item one</li><li>list item two</li><li>list item three</li></ul></>} /> published a history of the internet in a Swedish sci-fi novel.
        </p>
        <windups.Pause ms={3 * BEAT_MS} />

        <p>
        Tale of the Big Computer was first translated, published, and widely panned in 1968 <Footnote.Reference value="Third footnote" />.
        It has built a small following over the last 50-odd years for its uncanny prescience;
        the authors describe in vivid detail not just how we interface with a global system of interconnected computers,
        but also how that system acts on us <Footnote.Reference value="Third footnote" />.
        </p>
        <windups.Pause ms={3 * BEAT_MS} />

        <p>
        We are publishing a new English edition of this Swedish cult classic.
        The original books have become quite rare and expensive <Footnote.Reference value="Third footnote" />,
        and the 1968 translation is both unnecessarily and inaccurately gendered <Footnote.Reference value="Third footnote" />.
        </p>
        <windups.Pause ms={3 * BEAT_MS} />

        <p>
          <a href="https://discord.gg/Dmr833sdS5" target="_blank" rel="noreferrer">Click here to join our community</a>
          {' '}and help us make the Big Computer&apos;s heart beat once more <Footnote.Reference value="Third footnote" />.
        </p>
      </windups.WindupChildren>
    </Footnote.Container>
  </Page>;
}
