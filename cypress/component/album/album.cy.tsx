import { AlbumIndex } from '../../../src/components/album/AlbumIndex';
import { AlbumPage } from '../../../src/components/album/AlbumPage';
import { AlbumPager } from '../../../src/components/album/AlbumPager';
import {
  ferrari296,
  ferrari308,
  porsche,
  SAMPLE_COLLECTIONS,
  SAMPLE_MODELS,
  SAMPLE_PHOTO_URL,
  SAMPLE_SPOTS,
  sampleSpot,
} from '../../../src/components/album/albumFixtures';
import { CarSilhouette } from '../../../src/components/album/CarSilhouette';
import { CarThumb } from '../../../src/components/album/CarThumb';
import { PageTableRow } from '../../../src/components/album/PageTableRow';
import { StickerRow } from '../../../src/components/album/StickerRow';
import type { AlbumPageData } from '../../../src/types/Album';
import type { CarModel } from '../../../src/types/CarModel';
import { buildAlbumPages, buildCollectionPages } from '../../../src/utils/album';

function page(models: CarModel[], spotModelIds: string[]): AlbumPageData {
  const spots = spotModelIds.map((id, index) =>
    sampleSpot({ id: `spot-${index}`, carModelId: id, createdAt: `2026-11-0${(index % 9) + 1}T10:00:00.000Z` }),
  );
  const built = buildAlbumPages(models, spots).find((item) => item.total > 0);
  if (built === undefined) throw new Error('no page');
  return built;
}

const supercars: CarModel[] = [13, 14, 15, 16, 17, 18].map((n) => ({
  ...ferrari296,
  id: `supercar-${n}`,
  stickerNumber: n,
  model: `Model ${n}`,
}));

/** A page as long as the real Classics page (29 cars), to prove that a page scrolls on its own. */
const classics: CarModel[] = Array.from({ length: 29 }, (_, index) => ({
  ...ferrari308,
  id: `classic-${index + 1}`,
  stickerNumber: 40 + index,
  model: `Classic ${index + 1}`,
}));

describe('StickerRow', () => {
  it('shows a missing sticker in text-2 with the silhouette', () => {
    cy.mount(<StickerRow model={porsche} isCollected={false} spotCount={0} onPress={() => undefined} />);
    cy.get('[data-testid="sticker-porsche-911-gt3-locked"]').should('exist');
    cy.get('[data-testid="silhouette-coupe"]').should('exist');
    cy.get('[data-testid="sticker-porsche-911-gt3"]')
      .should('have.attr', 'aria-label')
      .and('contain', 'not collected yet');
    cy.get('[data-testid="sticker-porsche-911-gt3"]')
      .should('contain.text', '#07')
      .and('contain.text', 'Porsche 911 GT3');
  });

  it('shows a collected sticker with its photo crop and ×N', () => {
    cy.mount(
      <StickerRow
        model={porsche}
        isCollected
        cover={sampleSpot({ id: 'c', carModelId: porsche.id })}
        spotCount={3}
        onPress={() => undefined}
      />,
    );
    cy.get('[data-testid="sticker-porsche-911-gt3-collected"]').should('exist');
    cy.get('[data-testid="silhouette-coupe"]').should('not.exist');
    cy.get('[data-testid="sticker-porsche-911-gt3"]').should('contain.text', '×3');
  });

  it('is a 44 px button that opens the sticker', () => {
    const onPress = cy.stub().as('onPress');
    cy.mount(<StickerRow model={porsche} isCollected={false} spotCount={0} onPress={onPress} />);
    cy.get('[data-testid="sticker-porsche-911-gt3"]').should('have.attr', 'role', 'button');
    cy.get('[data-testid="sticker-porsche-911-gt3"]').invoke('outerHeight').should('be.at.least', 44);
    cy.get('[data-testid="sticker-porsche-911-gt3"]').click();
    cy.get('@onPress').should('have.been.calledOnce');
  });
});

describe('AlbumPage (sticker table)', () => {
  it('lists 6 rows in sticker-number order', () => {
    cy.mount(<AlbumPage page={page([...supercars].reverse(), [])} />);
    cy.get('[data-testid^="sticker-supercar-"][data-testid$="-locked"]').should('have.length', 6);
    cy.get('[data-testid="album-page-supercar-count"]').should('have.text', '0/6');
    cy.get('[role="button"][data-testid^="sticker-supercar-"]')
      .first()
      .should('have.attr', 'data-testid', 'sticker-supercar-13');
  });

  it('says "Complete · 6/6" in plain text when every sticker is in, with no stamp', () => {
    cy.mount(
      <AlbumPage
        page={page(
          supercars,
          supercars.map((model) => model.id),
        )}
      />,
    );
    cy.get('[data-testid="album-page-supercar-count"]').should('have.text', 'Complete · 6/6');
    cy.get('[data-testid^="stamp-"]').should('not.exist');
    cy.get('[role="progressbar"]').should('not.exist');
  });

  it('shows a 2 px progress line while a sticker is missing', () => {
    cy.mount(<AlbumPage page={page(supercars, ['supercar-13'])} />);
    cy.get('[data-testid="album-page-supercar-count"]').should('have.text', '1/6');
    cy.get('[role="progressbar"]').should('have.attr', 'aria-valuenow', '17').invoke('outerHeight').should('equal', 2);
  });

  it('reports the pressed row', () => {
    const onPressSlot = cy.stub().as('onPressSlot');
    cy.mount(<AlbumPage page={page(supercars, [])} onPressSlot={onPressSlot} />);
    cy.get('[data-testid="sticker-supercar-15"]').click();
    cy.get('@onPressSlot').should('have.been.calledWithMatch', { id: 'supercar-15' });
  });

  it('lists wildcards as rows that open the spot', () => {
    const wildcards = buildAlbumPages(SAMPLE_MODELS, SAMPLE_SPOTS).find((item) => item.id === 'wildcards');
    if (wildcards === undefined) throw new Error('no wildcards page');
    const onPressSpot = cy.stub().as('open');
    cy.mount(<AlbumPage page={wildcards} onPressSpot={onPressSpot} />);
    cy.get('[data-testid="wildcard-spot-wildcard"]').should('contain.text', 'Fiat Multipla').click();
    cy.get('@open').should('have.been.calledWithMatch', { id: 'spot-wildcard' });
    cy.get('[data-testid="album-page-wildcards-count"]').should('have.text', '1 wildcard');
  });

  it('shows a finished collection as plain text', () => {
    const sets = buildCollectionPages(SAMPLE_COLLECTIONS, SAMPLE_MODELS, SAMPLE_SPOTS);
    const jdm = sets.find((set) => set.collectionId === 'jdm-legends');
    const italian = sets.find((set) => set.collectionId === 'italian-exotics');
    if (jdm === undefined || italian === undefined) throw new Error('missing sets');
    cy.mount(<AlbumPage page={jdm} />);
    cy.get('[data-testid="collection-page-jdm-legends-count"]').should('have.text', 'Complete · 1/1');
    cy.get('[data-testid="stamp-set-complete"]').should('not.exist');
    cy.mount(<AlbumPage page={italian} showTitle />);
    cy.get('[data-testid="collection-page-italian-exotics-title"]').should('have.text', 'Italian Exotics');
    cy.get('[data-testid="collection-page-italian-exotics-count"]').should('have.text', '1/2');
  });
});

describe('AlbumPager', () => {
  it('opens at the URL page and steps between pages', () => {
    const onPageChange = cy.stub().as('change');
    cy.mount(
      <div style={{ width: 390, height: 700, display: 'flex' }}>
        <AlbumPager
          pages={buildAlbumPages(SAMPLE_MODELS, SAMPLE_SPOTS)}
          initialPageId="supercar"
          onPageChange={onPageChange}
        />
      </div>,
    );
    cy.get('[data-testid="pager-position"]').should('have.text', '03/09');
    cy.get('[data-testid="pager-next"]').click();
    cy.get('@change').should('have.been.calledWith', 'hypercar');
    cy.get('[data-testid="pager-position"]').should('have.text', '04/09');
    cy.get('[data-testid="pager-previous"]').click();
    cy.get('@change').should('have.been.calledWith', 'supercar');
  });

  // Regression: a page's own ScrollView had no height, so on the web the rows below the fold of a
  // long page (Classics, 29 cars) were clipped and could not be reached.
  it('scrolls a long page down to its last sticker, which can be pressed', () => {
    const onPressSlot = cy.stub().as('open');
    cy.mount(
      <div style={{ width: 390, height: 700, display: 'flex' }}>
        <AlbumPager pages={buildAlbumPages(classics, [])} initialPageId="classic" onPressSlot={onPressSlot} />
      </div>,
    );
    cy.get('[data-testid="pager-page-classic"]').invoke('outerHeight').should('be.lessThan', 700);
    cy.get('[data-testid="sticker-classic-29"]').should('not.be.visible');
    cy.get('[data-testid="pager-page-classic"]').scrollTo('bottom', { ensureScrollable: true });
    cy.get('[data-testid="sticker-classic-29"]').should('be.visible').click({ scrollBehavior: false });
    cy.get('@open').should('have.been.calledWithMatch', { id: 'classic-29' });
  });
});

describe('AlbumIndex', () => {
  const pages = buildAlbumPages(SAMPLE_MODELS, SAMPLE_SPOTS);
  const sets = buildCollectionPages(SAMPLE_COLLECTIONS, SAMPLE_MODELS, SAMPLE_SPOTS);

  it('lists the 9 pages in print order and opens one', () => {
    const onPressPage = cy.stub().as('page');
    cy.mount(
      <AlbumIndex pages={pages} collections={sets} onPressPage={onPressPage} onPressCollection={() => undefined} />,
    );
    cy.get('[data-testid="album-contents"] [role="button"]')
      .should('have.length', 9)
      .first()
      .should('have.attr', 'data-testid', 'page-card-icon');
    cy.get('[data-testid="page-card-sports-count"]').should('have.text', '2/2');
    cy.get('[data-testid="page-card-wildcards-count"]').should('have.text', '1');
    cy.get('[data-testid="page-card-supercar"]')
      .should('have.attr', 'aria-label', 'Page 3, Supercars: 0 of 1 collected')
      .click();
    cy.get('@page').should('have.been.calledWith', 'supercar');
  });

  it('switches to the collections with text tabs', () => {
    const onPressCollection = cy.stub().as('set');
    cy.mount(
      <AlbumIndex
        pages={pages}
        collections={sets}
        onPressPage={() => undefined}
        onPressCollection={onPressCollection}
      />,
    );
    cy.get('[data-testid="album-index-tab"]').should('have.attr', 'role', 'tablist');
    cy.get('[data-testid="album-index-tab-pages"]').should('have.attr', 'aria-selected', 'true');
    cy.get('[data-testid="album-index-tab-collections"]').click();
    cy.get('[data-testid="album-index-tab-collections"]').should('have.attr', 'aria-selected', 'true');
    cy.get('[data-testid="album-contents"]').should('not.exist');
    cy.get('[data-testid="album-collections"] [role="button"]').should('have.length', 3);
    cy.get('[data-testid="collection-card-italian-exotics-count"]').should('have.text', '1/2');
    cy.get('[data-testid="collection-card-italian-exotics"]').click();
    cy.get('@set').should('have.been.calledWith', 'italian-exotics');
  });

  it('shows only the pages without collections', () => {
    cy.mount(
      <AlbumIndex pages={pages} collections={[]} onPressPage={() => undefined} onPressCollection={() => undefined} />,
    );
    cy.get('[data-testid="album-index-tab"]').should('not.exist');
    cy.get('[data-testid="album-index"]').should('contain.text', 'Pages');
  });
});

describe('small pieces', () => {
  it('PageTableRow is one 44 px button with a 96 px progress line', () => {
    const onPress = cy.stub().as('row');
    cy.mount(
      <PageTableRow
        number="02"
        title="Sports"
        count="2/17"
        progress={2 / 17}
        accessibilityLabel="Page 2, Sports: 2 of 17 collected"
        onPress={onPress}
        testID="row"
      />,
    );
    cy.get('[data-testid="row"]').should('contain.text', '02').and('contain.text', 'Sports');
    cy.get('[data-testid="row-count"]').should('have.text', '2/17');
    cy.get('[data-testid="row"]').invoke('outerHeight').should('be.at.least', 44);
    cy.get('[data-testid="row"] [role="progressbar"]').invoke('outerWidth').should('equal', 96);
    cy.get('[data-testid="row"]').click();
    cy.get('@row').should('have.been.calledOnce');
  });

  it('CarThumb is a 72 × 30 crop, or the silhouette without a photo', () => {
    cy.mount(<CarThumb uri={SAMPLE_PHOTO_URL} bodyStyle="coupe" testID="thumb" />);
    cy.get('[data-testid="thumb"]').invoke('outerWidth').should('equal', 72);
    cy.get('[data-testid="thumb"]').invoke('outerHeight').should('be.closeTo', 30, 1);
    cy.get('[data-testid="silhouette-coupe"]').should('not.exist');
    cy.mount(<CarThumb bodyStyle="van" testID="thumb" />);
    cy.get('[data-testid="silhouette-van"]').should('exist');
  });

  it('CarSilhouette draws an SVG for each body style', () => {
    cy.mount(<CarSilhouette bodyStyle="van" size={120} tone="silhouette" />);
    cy.get('[data-testid="silhouette-van"]').find('path').should('have.length', 1);
  });
});
