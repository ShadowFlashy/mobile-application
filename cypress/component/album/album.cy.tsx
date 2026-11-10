import { AlbumPage } from '../../../src/components/album/AlbumPage';
import { AlbumPager } from '../../../src/components/album/AlbumPager';
import {
  chiron,
  ferrari296,
  golf,
  porsche,
  SAMPLE_COLLECTIONS,
  SAMPLE_MODELS,
  SAMPLE_PHOTO_URL,
  SAMPLE_SPOTS,
  sampleSpot,
} from '../../../src/components/album/albumFixtures';
import { CarSilhouette } from '../../../src/components/album/CarSilhouette';
import { CollectionShelf } from '../../../src/components/album/CollectionShelf';
import { FoilSticker } from '../../../src/components/album/FoilSticker';
import { PageIndexCard } from '../../../src/components/album/PageIndexCard';
import { RarityPips } from '../../../src/components/album/RarityPips';
import { SetCompleteStamp } from '../../../src/components/album/SetCompleteStamp';
import { StickerSlot } from '../../../src/components/album/StickerSlot';
import { TachoGauge } from '../../../src/components/album/TachoGauge';
import { ThemeProvider } from '../../../src/theme';
import type { AlbumPageData } from '../../../src/types/Album';
import type { CarModel } from '../../../src/types/CarModel';
import { buildAlbumPages, buildCollectionPages } from '../../../src/utils/album';

function page(models: CarModel[], spotModelIds: string[]): AlbumPageData {
  const spots = spotModelIds.map((id, index) =>
    sampleSpot({ id: `spot-${index}`, carModelId: id, createdAt: `2026-11-0${index + 1}T10:00:00.000Z` }),
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

describe('FoilSticker', () => {
  it('uses the finish of its rarity', () => {
    const cases: [CarModel, string][] = [
      [golf, 'matte'],
      [porsche, 'chrome'],
      [ferrari296, 'holo'],
      [chiron, 'gold'],
    ];
    for (const [model, finish] of cases) {
      cy.mount(
        <FoilSticker
          model={model}
          photoUrl={SAMPLE_PHOTO_URL}
          size="md"
          pageId={model.category}
          tiltSeed={model.id}
          sheen="none"
        />,
      );
      cy.get(`[data-testid="foil-finish-${finish}"]`).should('exist');
    }
  });

  it('reads like a sticker for screen readers', () => {
    cy.mount(
      <FoilSticker
        model={porsche}
        size="md"
        count={3}
        pageId="sports"
        tiltSeed={porsche.id}
        testID="sticker"
        sheen="none"
      />,
    );
    cy.get('[data-testid="sticker"]')
      .invoke('attr', 'aria-label')
      .should('equal', 'Sticker 7, Porsche 911 GT3, Rare, spotted 3 times');
  });

  it('shows its stamp and number tab', () => {
    cy.mount(<FoilSticker model={porsche} size="md" stamp="new" pageId="sports" tiltSeed={porsche.id} sheen="none" />);
    cy.get('[data-testid="stamp-new"]').should('contain.text', 'New');
    cy.contains('#07').should('be.visible');
  });

  it('is a matte WILDCARD sticker without a model', () => {
    const wildcard = sampleSpot({ id: 'wild', make: 'Fiat', model: 'Multipla' });
    cy.mount(<FoilSticker spot={wildcard} size="md" stamp="wildcard" pageId="wildcards" tiltSeed="wild" testID="wc" />);
    cy.get('[data-testid="foil-finish-matte"]').should('exist');
    cy.get('[data-testid="stamp-wildcard"]').should('exist');
    cy.get('[data-testid="wc"]').invoke('attr', 'aria-label').should('equal', 'Wildcard, Fiat Multipla');
  });

  it('does not play the sheen with reduced motion off-switched to none', () => {
    cy.mount(<FoilSticker model={chiron} size="hero" pageId="hypercar" tiltSeed={chiron.id} sheen="none" />);
    cy.get('[data-testid="foil-sheen"]').should('not.exist');
  });

  it('plays a sheen once by default', () => {
    cy.mount(<FoilSticker model={porsche} size="md" pageId="sports" tiltSeed={porsche.id} />);
    cy.get('[data-testid="foil-sheen"]').should('exist');
  });

  it('is pressable when it has an onPress', () => {
    const onPress = cy.stub().as('onPress');
    cy.mount(
      <FoilSticker
        model={porsche}
        size="md"
        pageId="sports"
        tiltSeed={porsche.id}
        onPress={onPress}
        testID="sticker"
      />,
    );
    cy.get('[data-testid="sticker"]').click();
    cy.get('@onPress').should('have.been.calledOnce');
  });
});

describe('StickerSlot', () => {
  it('shows a locked silhouette well when not collected', () => {
    cy.mount(<StickerSlot model={porsche} isCollected={false} spotCount={0} onPress={() => undefined} />);
    cy.get('[data-testid="sticker-porsche-911-gt3-locked"]').should('exist');
    cy.get('[data-testid="silhouette-coupe"]').should('exist');
    cy.get('[data-testid="sticker-porsche-911-gt3"]')
      .invoke('attr', 'aria-label')
      .should('contain', 'not collected yet');
  });

  it('shows the foil sticker with a ×N stamp when collected more than once', () => {
    cy.mount(
      <StickerSlot
        model={porsche}
        isCollected
        cover={sampleSpot({ id: 'c', carModelId: porsche.id })}
        spotCount={3}
        onPress={() => undefined}
      />,
    );
    cy.get('[data-testid="sticker-porsche-911-gt3-collected"]').should('exist');
    cy.get('[data-testid="stamp-count"]').should('contain.text', '×3');
  });

  it('gives an empty legendary slot the gold chase edge', () => {
    cy.mount(<StickerSlot model={chiron} isCollected={false} spotCount={0} onPress={() => undefined} />);
    cy.get('[data-testid="sticker-bugatti-chiron-chase"]').should('exist');
    cy.get('[data-testid="sticker-bugatti-chiron"]').invoke('attr', 'aria-label').should('contain', 'chase');
  });

  it('has no chase edge on a common slot', () => {
    cy.mount(<StickerSlot model={golf} isCollected={false} spotCount={0} onPress={() => undefined} />);
    cy.get('[data-testid="sticker-volkswagen-golf-gti-chase"]').should('not.exist');
  });

  it('opens the sticker when pressed', () => {
    const onPress = cy.stub().as('onPress');
    cy.mount(<StickerSlot model={porsche} isCollected={false} spotCount={0} onPress={onPress} />);
    cy.get('[data-testid="sticker-porsche-911-gt3"]').click();
    cy.get('@onPress').should('have.been.calledOnce');
  });
});

describe('AlbumPage', () => {
  it('renders 6 slots in sticker-number order', () => {
    cy.mount(<AlbumPage page={page([...supercars].reverse(), [])} />);
    cy.get('[data-testid^="sticker-supercar-"][data-testid$="-locked"]').should('have.length', 6);
    cy.get('[data-testid="album-page-supercar-count"]').should('contain.text', '0/6');
    cy.get('[data-testid^="sticker-supercar-"]').first().should('have.attr', 'data-testid', 'sticker-supercar-13');
  });

  it('gets a FULL PAGE stamp when every slot is collected', () => {
    cy.mount(
      <AlbumPage
        page={page(
          supercars,
          supercars.map((model) => model.id),
        )}
      />,
    );
    cy.get('[data-testid="album-page-supercar-count"]').should('contain.text', '6/6');
    cy.get('[data-testid="stamp-full_page"]').should('exist');
  });

  it('has no FULL PAGE stamp while a slot is empty', () => {
    cy.mount(<AlbumPage page={page(supercars, ['supercar-13'])} />);
    cy.get('[data-testid="stamp-full_page"]').should('not.exist');
  });

  it('reports the pressed slot', () => {
    const onPressSlot = cy.stub().as('onPressSlot');
    cy.mount(<AlbumPage page={page(supercars, [])} onPressSlot={onPressSlot} />);
    cy.get('[data-testid="sticker-supercar-15"]').click();
    cy.get('@onPressSlot').should('have.been.calledWithMatch', { id: 'supercar-15' });
  });

  it('lists wildcards as WILDCARD stickers', () => {
    const wildcards = buildAlbumPages(SAMPLE_MODELS, SAMPLE_SPOTS).find((item) => item.id === 'wildcards');
    if (wildcards === undefined) throw new Error('no wildcards page');
    cy.mount(<AlbumPage page={wildcards} />);
    cy.get('[data-testid="wildcard-spot-wildcard"]').should('exist');
    cy.get('[data-testid="stamp-wildcard"]').should('exist');
  });

  it('shows SET COMPLETE on a completed collection', () => {
    const sets = buildCollectionPages(SAMPLE_COLLECTIONS, SAMPLE_MODELS, SAMPLE_SPOTS);
    const jdm = sets.find((set) => set.collectionId === 'jdm-legends');
    const italian = sets.find((set) => set.collectionId === 'italian-exotics');
    if (jdm === undefined || italian === undefined) throw new Error('missing sets');
    cy.mount(<AlbumPage page={jdm} />);
    cy.get('[data-testid="stamp-set-complete"]').should('exist');
    cy.get('[data-testid="livery-jdm-legends"]').should('contain.text', 'Japanese JDM Legends');
    cy.mount(<AlbumPage page={italian} />);
    cy.get('[data-testid="stamp-set-complete"]').should('not.exist');
    cy.get('[data-testid="collection-page-italian-exotics-count"]').should('contain.text', '1/2');
  });
});

describe('TachoGauge', () => {
  it('draws the red zone and reports its value', () => {
    cy.mount(<TachoGauge ratio={0.5} label="Album completion" valueLabel="50 %" size="lg" testID="tacho" />);
    cy.get('[data-testid="tacho-red-zone"]').should('exist');
    cy.get('[data-testid="tacho"]').should('have.attr', 'aria-valuenow', '50');
    cy.get('[data-testid="tacho-value"]').should('contain.text', '50 %');
  });

  it('draws no fill at 0 % and clamps above 100 %', () => {
    cy.mount(<TachoGauge ratio={0} label="Album completion" valueLabel="0 %" size="md" testID="tacho" />);
    cy.get('[data-testid="tacho-fill"]').should('not.exist');
    cy.mount(<TachoGauge ratio={1.4} label="Album completion" valueLabel="100 %" size="md" testID="tacho" />);
    cy.get('[data-testid="tacho"]').should('have.attr', 'aria-valuenow', '100');
  });
});

describe('PageIndexCard', () => {
  it('shows progress, pips and ONE TO GO', () => {
    const onPress = cy.stub().as('onPress');
    cy.mount(
      <PageIndexCard
        title="Supercars"
        number={3}
        collected={5}
        total={6}
        pageId="supercar"
        slots={[true, true, true, true, true, false]}
        onPress={onPress}
      />,
    );
    cy.get('[data-testid="page-card-supercar-count"]').should('contain.text', '5/6');
    cy.get('[data-testid="stamp-one_to_go"]').should('exist');
    cy.get('[data-testid="page-card-supercar"]')
      .invoke('attr', 'aria-label')
      .should('equal', 'Page 3, Supercars: 5 of 6 collected');
    cy.get('[data-testid="page-card-supercar"]').click();
    cy.get('@onPress').should('have.been.calledOnce');
  });

  it('shows FULL PAGE on a complete page', () => {
    cy.mount(
      <PageIndexCard
        title="Supercars"
        number={3}
        collected={6}
        total={6}
        pageId="supercar"
        onPress={() => undefined}
      />,
    );
    cy.get('[data-testid="stamp-full_page"]').should('exist');
  });

  it('shows SET COMPLETE on a complete set', () => {
    cy.mount(
      <PageIndexCard
        title="Italian Exotics"
        number={4}
        collected={12}
        total={12}
        collectionId="italian-exotics"
        variant="shelf"
        onPress={() => undefined}
      />,
    );
    cy.get('[data-testid="collection-card-italian-exotics"]').should('exist');
    cy.get('[data-testid="stamp-set-complete"]').should('exist');
  });

  it('counts wildcards instead of slots', () => {
    cy.mount(
      <PageIndexCard
        title="Wildcards"
        number={9}
        collected={0}
        total={0}
        pageId="wildcards"
        wildcardCount={2}
        onPress={() => undefined}
      />,
    );
    cy.get('[data-testid="page-card-wildcards-count"]').should('contain.text', '2 wildcards');
  });
});

describe('CollectionShelf', () => {
  it('lists every set with its translated title and opens it', () => {
    const onPressCollection = cy.stub().as('open');
    cy.mount(
      <CollectionShelf
        collections={buildCollectionPages(SAMPLE_COLLECTIONS, SAMPLE_MODELS, SAMPLE_SPOTS)}
        onPressCollection={onPressCollection}
      />,
    );
    cy.get('[data-testid^="collection-card-"]:not([data-testid$="-count"])').should('have.length', 3);
    cy.contains('Italian Exotics').should('exist');
    cy.get('[data-testid="collection-card-italian-exotics"]').click();
    cy.get('@open').should('have.been.calledWith', 'italian-exotics');
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
    cy.get('[data-testid="pager-position"]').should('contain.text', '03/09');
    cy.get('[data-testid="pager-next"]').click();
    cy.get('@change').should('have.been.calledWith', 'hypercar');
    cy.get('[data-testid="pager-position"]').should('contain.text', '04/09');
    cy.get('[data-testid="pager-previous"]').click();
    cy.get('@change').should('have.been.calledWith', 'supercar');
  });
});

describe('small pieces', () => {
  it('RarityPips fills one pip per rarity step', () => {
    cy.mount(<RarityPips rarity="epic" size="md" />);
    cy.get('[data-testid="rarity-pips-epic"] [data-testid="rarity-pip-filled"]').should('have.length', 3);
    cy.get('[data-testid="rarity-pips-epic"] [data-testid="rarity-pip-empty"]').should('have.length', 1);
    cy.get('[data-testid="rarity-pips-epic"]').should('have.attr', 'aria-label', 'Epic');
  });

  it('CarSilhouette draws an SVG for each body style', () => {
    cy.mount(<CarSilhouette bodyStyle="van" size={120} tone="silhouette" />);
    cy.get('[data-testid="silhouette-van"]').find('path').should('have.length', 1);
  });

  it('SetCompleteStamp names the set for screen readers, in both schemes', () => {
    cy.mount(
      <ThemeProvider scheme="dark">
        <SetCompleteStamp collectionId="hypercar-hall-of-fame" />
      </ThemeProvider>,
    );
    cy.get('[data-testid="stamp-set-complete"]')
      .should('have.attr', 'aria-label')
      .and('contain', 'Hypercar Hall of Fame');
  });
});
