import {
  chiron,
  ferrari308,
  porsche,
  SAMPLE_CHALLENGES,
  SAMPLE_COLLECTIONS,
  SAMPLE_LEVEL,
  SAMPLE_MODELS,
  SAMPLE_SPOTS,
  SAMPLE_WEEK_ENDS_AT,
  sampleSpot,
} from '../../../src/components/album/albumFixtures';
import { AlbumSkeleton } from '../../../src/components/album/AlbumSkeleton';
import { AlbumTotals } from '../../../src/components/album/AlbumTotals';
import { DuplicatesStrip } from '../../../src/components/album/DuplicatesStrip';
import { LatestCatches } from '../../../src/components/album/LatestCatches';
import { PaintValue } from '../../../src/components/album/PaintValue';
import { SectionText } from '../../../src/components/album/SectionText';
import { ShowcaseRows } from '../../../src/components/album/ShowcaseRows';
import { StickerHero } from '../../../src/components/album/StickerHero';
import { WeekChallenges } from '../../../src/components/album/WeekChallenges';
import { Text } from '../../../src/components/primitives/Text';
import type { Spot } from '../../../src/types/Spot';
import { buildAlbumCover, buildAlbumPages, buildCollectionPages } from '../../../src/utils/album';

const pages = buildAlbumPages(SAMPLE_MODELS, SAMPLE_SPOTS);
const cover = buildAlbumCover(pages, SAMPLE_SPOTS);
const sets = buildCollectionPages(SAMPLE_COLLECTIONS, SAMPLE_MODELS, SAMPLE_SPOTS);
const modelOf = (spot: Spot) => SAMPLE_MODELS.find((model) => model.id === spot.carModelId);
const countOf = (modelId: string) => SAMPLE_SPOTS.filter((spot) => spot.carModelId === modelId).length;

describe('AlbumTotals', () => {
  it('shows the stickers and level readouts with their 2 px lines', () => {
    cy.mount(<AlbumTotals cover={cover} level={SAMPLE_LEVEL} />);
    cy.get('[data-testid="album-cover-summary-value"]')
      .should('have.text', '3/6')
      .and('have.attr', 'aria-label', '3 of 6 stickers collected');
    cy.get('[data-testid="album-cover"]').should('contain.text', 'Stickers · 50% of Season 1');
    cy.get('[data-testid="album-cover-level-value"]').should('have.text', 'LVL 8');
    cy.get('[data-testid="album-cover"]').should('contain.text', '585 XP to level 9');
    cy.get('[data-testid="album-cover"] [role="progressbar"]').should('have.length', 2);
    cy.get('[data-testid="album-cover-summary"] [role="progressbar"]')
      .should('have.attr', 'aria-valuenow', '50')
      .invoke('outerHeight')
      .should('equal', 2);
  });

  it('hides the level while it is unknown', () => {
    cy.mount(<AlbumTotals cover={{ collected: 0, total: 118, ratio: 0, latest: [] }} />);
    cy.get('[data-testid="album-cover-summary-value"]').should('have.text', '0/118');
    cy.get('[data-testid="album-cover-level"]').should('not.exist');
  });
});

describe('LatestCatches', () => {
  it('is a timing tower of 3 rows that unfolds with See all and opens a spot', () => {
    const onPressSpot = cy.stub().as('latest');
    cy.mount(
      <LatestCatches
        spots={cover.latest}
        modelOf={modelOf}
        collections={sets}
        countOf={countOf}
        onPressSpot={onPressSpot}
      />,
    );
    cy.get('[data-testid="album-latest"]').should('contain.text', 'Latest');
    cy.get('[data-testid^="latest-spot-"]').should('have.length', 3);
    cy.get('[data-testid="latest-spot-porsche-3"]')
      .should('contain.text', '#07')
      .and('contain.text', 'Porsche 911 GT3')
      .and('contain.text', '×3')
      .and('contain.text', 'German Autobahn Heroes');
    cy.get('[data-testid="album-latest-see-all"]').should('contain.text', 'See all').click();
    cy.get('[data-testid^="latest-spot-"]').should('have.length', 6);
    cy.get('[data-testid="latest-spot-wildcard"]').should('contain.text', 'Wildcards');
    cy.get('[data-testid="album-latest-see-all"]').should('contain.text', 'Show less');
    cy.get('[data-testid="latest-spot-porsche-3"]').click();
    cy.get('@latest').should('have.been.calledWithMatch', { id: 'spot-porsche-3' });
  });

  it('says Today and Yesterday for recent catches', () => {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    cy.mount(
      <LatestCatches
        spots={[
          sampleSpot({ id: 'a', carModelId: porsche.id, spottedAt: now.toISOString() }),
          sampleSpot({ id: 'b', carModelId: porsche.id, spottedAt: yesterday.toISOString() }),
        ]}
        modelOf={modelOf}
        collections={sets}
        onPressSpot={() => undefined}
      />,
    );
    cy.get('[data-testid="latest-a"]').should('contain.text', 'Today');
    cy.get('[data-testid="latest-b"]').should('contain.text', 'Yesterday');
    cy.get('[data-testid="album-latest-see-all"]').should('not.exist');
  });
});

describe('WeekChallenges', () => {
  it('lists the challenges with count and XP; a done one shows a check and recedes', () => {
    cy.mount(
      <WeekChallenges
        challenges={SAMPLE_CHALLENGES}
        endsAt={SAMPLE_WEEK_ENDS_AT}
        now={new Date('2026-11-10T12:50:00.000Z')}
      />,
    );
    cy.get('[data-testid="album-week"]').should('contain.text', 'This week').and('contain.text', 'Ends in 5d 10h');
    cy.get('[data-testid="challenge-warmup"]').should('contain.text', '2/3').and('contain.text', '+75 XP');
    cy.get('[data-testid="challenge-main"]').should('contain.text', '0/1').and('contain.text', '+125 XP');
    cy.get('[data-testid="challenge-stretch-done"]').should('exist');
    cy.get('[data-testid="challenge-stretch"]')
      .should('have.attr', 'aria-label')
      .and('contain', 'done')
      .and('contain', '+250 XP');
  });

  it('says the week is over after its end', () => {
    cy.mount(
      <WeekChallenges
        challenges={SAMPLE_CHALLENGES}
        endsAt={SAMPLE_WEEK_ENDS_AT}
        now={new Date('2026-11-16T10:00:00.000Z')}
      />,
    );
    cy.get('[data-testid="album-week"]').should('contain.text', 'Week over');
  });
});

describe('StickerHero', () => {
  it('shows the photo, the big number and name, and the facts when collected', () => {
    cy.mount(
      <StickerHero
        model={ferrari308}
        isCollected
        cover={sampleSpot({ id: 'h', carModelId: ferrari308.id })}
        spotCount={1}
      />,
    );
    cy.get('[data-testid="sticker-hero-photo"]').should('exist');
    cy.get('[data-testid="sticker-title"]')
      .should('have.text', '#60 Ferrari 308 GTSi')
      .and('have.attr', 'aria-label', 'Sticker 60, Ferrari 308 GTSi');
    cy.get('[data-testid="sticker-hero"]')
      .should('contain.text', 'Epic')
      .and('contain.text', 'Italy')
      .and('contain.text', '1980–1982');
    cy.get('[data-testid^="foil-"]').should('not.exist');
  });

  it('shows the silhouette while a sticker is missing', () => {
    cy.mount(<StickerHero model={chiron} isCollected={false} spotCount={0} />);
    cy.get('[data-testid="sticker-hero-locked"]').should('have.attr', 'aria-label').and('contain', 'not collected yet');
    cy.get('[data-testid="silhouette-supercar"]').should('exist');
    cy.get('[data-testid="sticker-hero"]').should('contain.text', 'France');
  });
});

describe('DuplicatesStrip', () => {
  it('lists every spot oldest first as rows, marks the first and opens a spot', () => {
    const onPressSpot = cy.stub().as('open');
    const spots = SAMPLE_SPOTS.filter((spot) => spot.carModelId === porsche.id).reverse();
    cy.mount(<DuplicatesStrip spots={spots} onPressSpot={onPressSpot} />);
    cy.get('[data-testid^="duplicate-"]').should('have.length', 3).first().should('contain.text', 'First');
    cy.get('[data-testid^="duplicate-"]').first().should('have.attr', 'data-testid', 'duplicate-spot-porsche-1');
    cy.get('[data-testid="duplicate-spot-porsche-2"]').should('contain.text', 'Leuven').click();
    cy.get('@open').should('have.been.calledWithMatch', { id: 'spot-porsche-2' });
  });
});

describe('ShowcaseRows and PaintValue', () => {
  it('shows the verified owner, the shout-out and a vanity plate as plain rows', () => {
    cy.mount(
      <ShowcaseRows showcase={{ visibility: 'vanity', shoutout: 'Thanks for the spot', vanityPlate: 'GTSI 80' }} />,
    );
    cy.get('[data-testid="owner-showcase"]').should('contain.text', 'Verified owner');
    cy.get('[data-testid="owner-showcase-shoutout"]').should('contain.text', 'Thanks for the spot');
    cy.get('[data-testid="owner-showcase-plate"]').should('contain.text', 'GTSI 80');
  });

  it('never shows a plate for a badge-only owner (privacy)', () => {
    cy.mount(<ShowcaseRows showcase={{ visibility: 'badge', shoutout: 'Say hi at Spa' }} />);
    cy.get('[data-testid="owner-showcase"]').should('contain.text', 'Verified owner');
    cy.get('[data-testid="owner-showcase-shoutout"]').should('contain.text', 'Say hi at Spa');
    cy.get('[data-testid="owner-showcase-plate"]').should('not.exist');
  });

  it('names the paint next to its swatch', () => {
    cy.mount(<PaintValue paint="orange" />);
    cy.get('[data-testid="paint-orange"]').should('have.text', 'Orange');
  });
});

describe('SectionText', () => {
  it('spaces paragraphs vertically only, so the text keeps the 20 px left edge', () => {
    cy.mount(
      <SectionText testID="body">
        <Text>First</Text>
        <Text>Second</Text>
      </SectionText>,
    );
    cy.get('[data-testid="body"]').should('have.css', 'padding-left', '0px').and('have.css', 'padding-top', '12px');
  });
});

describe('AlbumSkeleton', () => {
  it('renders placeholders hidden from screen readers', () => {
    cy.mount(<AlbumSkeleton variant="cover" />);
    cy.get('[data-testid="collection-loading"]').should('have.attr', 'aria-hidden', 'true');
  });
});
