import * as React from 'react';
import { styled } from 'linaria/react';
import * as windups from '@anulman/windups';
import * as Fathom from 'fathom-client';
// todo - LineBreaker?, CharacterWrappers...

import { Avatar } from '@src/components/Avatar';
import * as Footnote from '@src/components/Footnote';

const BEAT_MS = 300;
const Page = styled.main<{ isShowingFootnote: boolean } & React.HTMLAttributes<HTMLDivElement>>`
  @apply min-h-screen min-w-full;
  @apply relative z-0;
  @apply mx-auto;

  font-size: 1rem;
  padding: 3rem 0.5rem;
  line-height: 1.3;
  color: ${({ isShowingFootnote = false }) => isShowingFootnote ? 'rgba(255, 255, 255, 0.25)' : 'inherit'};

  > canvas {
    @apply fixed bottom-0 right-0;

    z-index: -1;
  }

  > ${Footnote.Display} {
    @apply fixed;

    --width: min(100%, 72ch);
    background: #ffffff33
    backdrop-filter: blur(4px);
    color: rgba(255, 255, 255, 0.8);
    border-radius: 4px;
    padding: 1rem;

    width: var(--width);
    left: calc((100% - var(--width)) / 2);
    max-height: 85vh;
    overflow-y: scroll;
  }

  p {
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

  const onHideFootnote = React.useCallback(() => setIsShowingFootnote(false), [setIsShowingFootnote]);
  const onShowFootnote = React.useCallback(() => setIsShowingFootnote(true), [setIsShowingFootnote]);
  const onClickedJoinDiscord = React.useCallback(() => Fathom.trackGoal('VCJ8PHAD', 0), []);

  React.useEffect(() => {
    const observer = new ResizeObserver(() => {
      const maxWindowSize = Math.min(window.innerWidth, window.innerHeight * 0.9);

      setAvatarSize(Math.max(300, maxWindowSize));
    });

    observer.observe(document.body);

    return () => observer.disconnect();
  }, []);

  return <Page isShowingFootnote={isShowingFootnote}>
    <Avatar size={avatarSize} />
    <Footnote.Container onShow={onShowFootnote} onHide={onHideFootnote}>
      <windups.WindupChildren isPaused={isShowingFootnote}>
        <p>
          In 1966,{Beat()} three years before the ARPAnet delivered its first packet <Footnote.Reference value={Footnotes.arpanet} />{Beat(2)}
          {' '}and two years before Engelbart&apos;s mother of all demos <Footnote.Reference value={Footnotes.engelbart} />,{Beat(2)}
          {' '}a father/daughter duo <Footnote.Reference value={Footnotes.alfvens} /> published a history of the internet in a Swedish sci-fi novel.
        </p>
        {Beat(3)}

        <p>
          Tale of the Big Computer was first translated,{Beat()} published,{Beat()} and widely panned in 1968 <Footnote.Reference value={Footnotes.reviews} />.{Beat(2)}
          {' '}It has built a small following over the last 50-odd years for its uncanny prescience;{Beat(2)}
          {' '}the authors describe in vivid detail not just how we interface with a global system of interconnected computers,{Beat()}
          {' '}but also how that system acts on us <Footnote.Reference value={Footnotes.prescience} />.
        </p>
        {Beat(3)}

        <p>
          We are publishing a new English edition of this Swedish cult classic.{Beat(2)}
          {' '}The original books have become quite rare and expensive <Footnote.Reference value={Footnotes.rare} />,{Beat()}
          {' '}and the 1968 translation is both unnecessarily and inaccurately gendered.
        </p>
        {Beat(3)}

        <p>
          <a href="https://discord.gg/Dmr833sdS5" target="_blank" rel="noreferrer" onClick={onClickedJoinDiscord}>Please join our Discord community</a>
          {' '}to help us make the Big Computer&apos;s heart beat once more <Footnote.Reference value={Footnotes.community} />.
        </p>
      </windups.WindupChildren>
    </Footnote.Container>
  </Page>;
}

const Beat = (numBeats = 1) => <windups.Pause ms={numBeats * BEAT_MS} />;
const Footnotes = {
  arpanet: <>
    <p>The ARPAnet was the military research project that preceded web1 (aka &quot;the internet&quot;).</p>
    <p>A team of defense contractors at Bolt Beranek & Newman designed and deployed the first long-distance multi-node packet-switching network to connect research teams at various universities with each other and the Department of Defense.</p>
    <p>The first sites came online in 1969; in the ensuing years the networked researchers slowly converged on many governance structures and standards—including RFCs, email and FTP—that continue to power the global internet to this day.</p>
  </>,
  engelbart: <>
    <p>Douglas Engelbart was a pioneering computer researcher focused on human-computer interaction.</p>
    <p>In 1968 he demoed his new &quot;oN-Line System&quot; (NLS), featuring several fundamental innovations we now consider table stakes for computing devices: windows; hypertext (links); the computer mouse; word processors; revision control; real-time document collaboration over a network; and much more.</p>
    <p>We will soon embed the video here; for now you can <a href="https://www.youtube.com/watch?v=yJDv-zdhzMY" target="_blank" rel="noreferrer">watch it on YouTube</a> (1h40m).</p>
  </>,
  alfvens: <>
    <p>The father is Hannes Alfvén who, four years after publication (in 1970) will win the Nobel Prize in Physics for his work on magnetohydrodynamics; specifically his discovery of &quot;Alfvén waves&quot;, which explain why stars&apos; outer atmospheres are several orders of magnitude hotter than their surfaces.</p>
    <p>His daughter Inger is an acclaimed author and playwright; she had recently published <em>Vinbergssnäcka</em>, &quot;a refreshing and joyful personal portrait of a girl from the sixties&quot;. She will publish her breakthrough novel, <em>S/Y Glädjen</em>, in 1979.</p>
  </>,
  reviews: <>
    <p>The book is <em>dry</em>: there are no characters or &quot;plot&quot;; it&apos;s more of a history tome. Also, the back half is mostly tropey space malarkey.</p>
    <p>&gt; &quot;This deadpan book-length extrapolation [...] chronicles in matter-of-fact detail the stages through which the Computers had to pass before they attained their [...] rightful domination of the world. [...] if you look around you, you can see the first chapters of the Big Computer’s tale taking form.&quot;<br />&mdash;P Schuyler Miller, Analog Science Fiction/Science Fact, May 1969</p>
    <p>&gt; &quot;<em>The Tale of the Big Computer</em> [...]  may be full of telling points; I wouldn’t know; it was too dull to read.&quot;<br />&mdash;Judith Merril, The Magazine of Fantasy and Science Fiction, June 1968</p>
  </>,
  prescience: <>
    <p>For example, the authors not only describe humans watching videos on computers we wear on our wrists; they accurately describe the ramifications we&apos;re living through:</p>
    <p>How we will produce more user-generated content than any one human can watch; how we will relinquish agency and let distributed computers decide which videos we want to watch; and how these recommendations will be personalized to each individual, of course.</p>
  </>,
  rare: <>
    <p>There seems to be only one English copy currently for sale online: an American first edition in near-fine condition selling for $1200 <a href="https://www.amazon.com/Tale-Big-Computer-Olaf-Johannesson/dp/B000GQU38W" target="_blank" rel="noreferrer">on Amazon</a>.</p>
  </>,
  community: <>
    <p>We are especially looking for 3D / motion artists; book designers; software engineers; and sculptural artists to help us make uniquely beautiful digital and physical editions of this special book.</p>
    <p>If this describes you, please do get in touch!</p>
  </>
};
