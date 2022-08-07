import * as React from 'react';
import { styled } from 'linaria/react';

import { Avatar } from '@src/components/Avatar';
import * as Footnote from '@src/components/Footnote';
import * as TypeyText from '@src/components/TypeyText';
import * as BuyNow from '@src/components/BuyNow';

import * as analytics from '@src/utils/analytics';

const BuyButtonPosition = {
  NextToContent: 'is-next-to-content',
  UnderContent: 'is-below-content',
} as const;

const Page = styled.main<{ isShowingFootnote: boolean } & React.HTMLAttributes<HTMLDivElement>>`
  @apply min-h-screen min-w-full;
  @apply relative z-0;
  @apply mx-auto;

  --text-color: ${({ isShowingFootnote = false }) => `rgba(255, 255, 255, ${isShowingFootnote ? '0.25' : '0.8'})`};
  --width: min(100%, 72ch);

  font-size: 1rem;
  padding: 3rem 0.5rem;
  line-height: 1.3;
  color: var(--text-color, inherit);

  > canvas {
    @apply fixed bottom-0 right-0;

    z-index: -1;
  }

  > ${Footnote.Display} {
    @apply fixed;

    background: #ffffff33
    backdrop-filter: blur(4px);
    color: rgba(255, 255, 255, 0.8);
    border-radius: 4px;
    padding: 1rem;

    width: var(--width);
    left: calc((100% - var(--width)) / 2);
    max-height: 85vh;
    overflow-y: scroll;
    z-index: 1;
  }

  > ${BuyNow.Button} {
    @apply absolute;

    &.${BuyButtonPosition.NextToContent} {
      top: 3.25rem;
      left: calc(50% + (var(--width) / 2) + 2rem);
    }

    &.${BuyButtonPosition.UnderContent} {
      margin-top: -1.75rem;
      right: max(0.5rem, calc(50% - (var(--width) / 2)));
    }

    &:hover {
      opacity: 1;
    }
  }

  > ${TypeyText.Content},
  p,
  blockquote {
    @apply w-full mx-auto;
    max-width: 72ch;
  }

  div, p, blockquote {
    + p, + blockquote {
      margin-top: 1rem;
    }
  }

  blockquote {
    --indent: 1.5rem;

    padding-left: var(--indent);

    &::before {
      content: '>';
      margin-left: calc(var(--indent) * -1);
      margin-right: calc(var(--indent) - 1ch);
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
  const typeyTextRef = React.useRef<HTMLDivElement>(null);

  const [avatarSize, setAvatarSize] = React.useState(MIN_AVATAR_SIZE);
  const [isShowingFootnote, setIsShowingFootnote] = React.useState(false);
  const [isShowingBuyNowButton, setIsShowingBuyNowButton] = React.useState(false);
  const [isShowingBuyNowModal, setIsShowingBuyNowModal] = React.useState(false);

  const onHideFootnote = React.useCallback(() => setIsShowingFootnote(false), [setIsShowingFootnote]);
  const onShowFootnote = React.useCallback(() => setIsShowingFootnote(true), [setIsShowingFootnote]);
  const onClickedJoinDiscord = React.useCallback(() => analytics.track('Clicked CTA', { which: 'Join Discord' }), []);

  const onChildWindupWillPlay = React.useCallback(() => {
    //    if (buttonRef.current.classList.contains(BuyButtonPosition.UnderContent)) {
    //      setIsShowingBuyNowButton(false);
    //    }
  }, [isShowingBuyNowButton]);

  const onChildWindupCompleted = React.useCallback((childNum: number) => {
    setIsShowingBuyNowButton(true);

    if (childNum === 0) {
      return new Promise((resolve) => setTimeout(resolve, 1250));
    }
  }, []);

  const onBuyButtonClick = React.useCallback<React.MouseEventHandler>((event) => {
    analytics.track('Clicked CTA', { which: 'Buy Now' });
    setIsShowingBuyNowModal(true);
    requestAnimationFrame(() => (event.target as HTMLElement).blur());
  }, []);

  // React.useEffect(() => {
  //   const buttonRect = buttonRef.current.getBoundingClientRect();
  //   const listener = () => {
  //     const typeyTextRect = typeyTextRef.current.getBoundingClientRect();
  //     const rightestMostestEdgeOfButton = typeyTextRect.right + 32 /* px; 2rem */ + buttonRect.width + 16 /* px; 1rem */;
  //     const classList = buttonRef.current.classList;

  //     if (rightestMostestEdgeOfButton >= document.documentElement.clientWidth) {
  //       if (!classList.contains(BuyButtonPosition.UnderContent)) {
  //         classList.add(BuyButtonPosition.UnderContent);
  //         classList.remove(BuyButtonPosition.NextToContent);
  //       }
  //     } else if (!classList.contains(BuyButtonPosition.NextToContent)) {
  //       classList.add(BuyButtonPosition.NextToContent);
  //       classList.remove(BuyButtonPosition.UnderContent);
  //     }
  //   };

  //   const observer = new ResizeObserver(listener);

  //   listener();
  //   observer.observe(document.body);

  //   return () => observer.disconnect();
  // }, []);

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
      <TypeyText.Content isPaused={isShowingFootnote}
        onChildWindupCompleted={onChildWindupCompleted}
        onChildWindupWillPlay={onChildWindupWillPlay}
        innerRef={typeyTextRef}>
        <p>
          In 1966,{TypeyText.Beat()} three years before the ARPAnet delivered its first packet <Footnote.Reference value={Footnotes.arpanet} />{TypeyText.Beat(2)}
          {' '}and two years before Engelbart&apos;s mother of all demos <Footnote.Reference value={Footnotes.engelbart} />,{TypeyText.Beat(2)}
          {' '}a father/daughter duo <Footnote.Reference value={Footnotes.alfvens} /> published a history of the internet in a Swedish sci-fi novel.
        </p>

        <p>
          <em>Tale of the Big Computer</em> was first translated,{TypeyText.Beat()} published,{TypeyText.Beat()} and widely panned in 1968 <Footnote.Reference value={Footnotes.reviews} />.{TypeyText.Beat(2)}
          {' '}It has since built a small following for its uncanny prescience;{TypeyText.Beat(1.5)}
          {' '}the authors describe in vivid detail not just how we will interact with a global system of interconnected computers,{TypeyText.Beat()}
          {' '}but also how that system will act on us <Footnote.Reference value={Footnotes.prescience} />.
        </p>

        <p>
          We are publishing a new English edition of this Swedish cult classic.{TypeyText.Beat(2)}
          {' '}The original books have become quite rare and expensive <Footnote.Reference value={Footnotes.rare} />,{TypeyText.Beat()}
          {' '}and the 1968 translation is both unnecessarily and inaccurately gendered.
        </p>

        <p>
          We are a group of engineers,{TypeyText.Beat(0.75)} publishers,{TypeyText.Beat(0.75)} translators,{TypeyText.Beat(0.75)} and above all:{TypeyText.Beat()} readers.{TypeyText.Beat(2)}
          {' '}<a href="https://discord.gg/Dmr833sdS5" target="_blank" rel="noreferrer" onClick={onClickedJoinDiscord}>Please join our Discord community</a>
          {' '}and help us make the Big Computer&apos;s heart beat once more <Footnote.Reference value={Footnotes.community} />.
        </p>
      </TypeyText.Content>
    </Footnote.Container>
    <BuyNow.Button onClick={onBuyButtonClick} isShowing={isShowingBuyNowButton} />
    <BuyNow.Modal isOpen={isShowingBuyNowModal} onDismiss={() => setIsShowingBuyNowModal(false)} anchorRect={typeyTextRef.current?.getBoundingClientRect()} />
  </Page>;
}

// todo - override footnote <Display> with buy now content when in buy now mode!!
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
    <blockquote>&quot;This deadpan book-length extrapolation [...] chronicles in matter-of-fact detail the stages through which the Computers had to pass before they attained their [...] rightful domination of the world. [...] if you look around you, you can see the first chapters of the Big Computer’s tale taking form.&quot;<br />&mdash;P Schuyler Miller, <em>Analog Science Fiction/Science Fact</em>, May 1969</blockquote>
    <blockquote>&quot;<em>The Tale of the Big Computer</em> [...]  may be full of telling points; I wouldn’t know; it was too dull to read.&quot;<br />&mdash;Judith Merril, <em>The Magazine of Fantasy and Science Fiction</em>, June 1968</blockquote>
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
