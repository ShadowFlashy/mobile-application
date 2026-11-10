import { AlbumContents } from '../../../src/components/album/AlbumContents';
import { AlbumCover } from '../../../src/components/album/AlbumCover';
import {
  chiron,
  ferrari308,
  porsche,
  SAMPLE_MODELS,
  SAMPLE_SPOTS,
  sampleSpot,
} from '../../../src/components/album/albumFixtures';
import { AlbumSkeleton } from '../../../src/components/album/AlbumSkeleton';
import { DuplicatesStrip } from '../../../src/components/album/DuplicatesStrip';
import { StickerHero } from '../../../src/components/album/StickerHero';
import { buildAlbumCover, buildAlbumPages } from '../../../src/utils/album';

describe('AlbumCover', () => {
  it('shows the season, the catalogue size, the tacho and the latest catches', () => {
    const pages = buildAlbumPages(SAMPLE_MODELS, SAMPLE_SPOTS);
    const cover = buildAlbumCover(pages, SAMPLE_SPOTS);
    const onPressLatest = cy.stub().as('latest');
    cy.mount(<AlbumCover cover={cover} level={3} onPressLatest={onPressLatest} />);
    cy.get('[data-testid="album-cover"]').should('contain.text', 'Redline · Season 1 · 6 stickers');
    cy.get('[data-testid="album-cover-summary"]').should(
      'have.attr',
      'aria-label',
      'Album cover: 3 of 6 stickers collected',
    );
    cy.get('[data-testid="album-tacho"]').should('have.attr', 'aria-valuenow', '50');
    cy.get('[data-testid^="latest-"]').should('have.length', 6);
    cy.get('[data-testid="latest-spot-porsche-3"]').click();
    cy.get('@latest').should('have.been.calledWithMatch', { id: 'spot-porsche-3' });
  });

  it('hides the latest strip and level on a fresh album', () => {
    cy.mount(<AlbumCover cover={{ collected: 0, total: 118, ratio: 0, latest: [] }} />);
    cy.get('[data-testid="album-latest"]').should('not.exist');
    cy.get('[data-testid="album-cover"]').should('contain.text', '118 stickers');
  });
});

describe('AlbumContents', () => {
  it('lists the 9 pages in print order and opens one', () => {
    const onPressPage = cy.stub().as('open');
    cy.mount(<AlbumContents pages={buildAlbumPages(SAMPLE_MODELS, SAMPLE_SPOTS)} onPressPage={onPressPage} />);
    cy.get('[data-testid="album-contents"] [data-testid^="page-card-"]:not([data-testid$="-count"])')
      .should('have.length', 9)
      .first()
      .should('have.attr', 'data-testid', 'page-card-icon');
    cy.get('[data-testid="page-card-wildcards-count"]').should('contain.text', '1 wildcard');
    cy.get('[data-testid="page-card-supercar"]').click();
    cy.get('@open').should('have.been.calledWith', 'supercar');
  });
});

describe('StickerHero', () => {
  it('shows the hero foil sticker, the title line and the chips when collected', () => {
    cy.mount(
      <StickerHero
        model={ferrari308}
        isCollected
        cover={sampleSpot({ id: 'h', carModelId: ferrari308.id })}
        spotCount={1}
      />,
    );
    cy.get('[data-testid="sticker-hero-foil"]').should('exist');
    cy.get('[data-testid="foil-finish-holo"]').should('exist');
    cy.get('[data-testid="stamp-co_driver"]').should('exist');
    cy.get('[data-testid="sticker-title"]').should('contain.text', '#60 · Ferrari 308 GTSi');
    cy.get('[data-testid="sticker-hero"]').should('contain.text', 'Italy').and('contain.text', '1980–1982');
  });

  it('shows the silhouette slot with a chase edge when a legendary sticker is locked', () => {
    cy.mount(<StickerHero model={chiron} isCollected={false} spotCount={0} />);
    cy.get('[data-testid="sticker-hero-locked"]').should('exist');
    cy.get('[data-testid="silhouette-supercar"]').should('exist');
    cy.get('[data-testid="sticker-hero"]').should('contain.text', 'France');
  });
});

describe('DuplicatesStrip', () => {
  it('lists every spot oldest first, marks the first and opens a spot', () => {
    const onPressSpot = cy.stub().as('open');
    const spots = SAMPLE_SPOTS.filter((spot) => spot.carModelId === porsche.id).reverse();
    cy.mount(<DuplicatesStrip spots={spots} onPressSpot={onPressSpot} />);
    cy.get('[data-testid^="duplicate-"]').should('have.length', 3).first().should('contain.text', 'First');
    cy.get('[data-testid^="duplicate-"]').first().should('have.attr', 'data-testid', 'duplicate-spot-porsche-1');
    cy.get('[data-testid="duplicate-spot-porsche-2"]').should('contain.text', 'Leuven').click();
    cy.get('@open').should('have.been.calledWithMatch', { id: 'spot-porsche-2' });
  });
});

describe('AlbumSkeleton', () => {
  it('renders slot-shaped placeholders hidden from screen readers', () => {
    cy.mount(<AlbumSkeleton variant="cover" />);
    cy.get('[data-testid="collection-loading"]').should('exist');
  });
});
