import { useState } from 'react';
import { CandidateChips } from '../../../src/components/capture/CandidateChips';
import { IdentityCard } from '../../../src/components/capture/IdentityCard';
import { previewSpot } from '../../../src/utils/spotPreview';
import { StickerMatchRow } from '../../../src/components/capture/StickerMatchRow';
import { CarModelPicker } from '../../../src/components/CarModelPicker';
import type { CarModel } from '../../../src/types/CarModel';
import type { Spot } from '../../../src/types/Spot';
import type { CarCandidate, CarChoice } from '../../../src/utils/captureForm';

const MODELS: CarModel[] = [
  {
    id: 'porsche-911-gt3',
    stickerNumber: 7,
    make: 'Porsche',
    model: '911 GT3',
    category: 'sports',
    rarity: 'rare',
    bodyStyle: 'coupe',
    country: 'DE',
    season: 1,
  },
  {
    id: 'citroen-2cv',
    stickerNumber: 29,
    make: 'Citroën',
    model: '2CV',
    category: 'classic',
    rarity: 'common',
    bodyStyle: 'sedan',
    country: 'FR',
    season: 1,
  },
  {
    id: 'mazda-mx-5',
    stickerNumber: 34,
    make: 'Mazda',
    model: 'MX-5',
    category: 'jdm',
    rarity: 'common',
    bodyStyle: 'convertible',
    country: 'JP',
    season: 1,
  },
];

const GT3_FORM = {
  carModelId: 'porsche-911-gt3',
  make: 'Porsche',
  model: '911 GT3',
  generation: '992',
  yearFrom: 2021,
};
const EMPTY_FORM = { make: '', model: '', generation: '' };
const CANDIDATES: CarCandidate[] = [
  { key: 'text:porsche 911', make: 'Porsche', modelName: '911', confidence: 0.55 },
  { key: 'porsche-911-gt3', carModel: MODELS[0], make: 'Porsche', modelName: '911 GT3', confidence: 0.3 },
  { key: 'mazda-mx-5', carModel: MODELS[2], make: 'Mazda', modelName: 'MX-5', confidence: 0.1 },
];

/** IdentityCard with its own form state, like the review screen's reducer. */
function Stateful() {
  const [form, setForm] = useState<{ carModelId?: string; make: string; model: string; generation: string }>(
    EMPTY_FORM,
  );
  const choose = (choice: CarChoice) =>
    setForm(
      choice.kind === 'model'
        ? { carModelId: choice.model.id, make: choice.model.make, model: choice.model.model, generation: '' }
        : { make: choice.make, model: choice.model, generation: '' },
    );
  return <IdentityCard form={form} models={MODELS} onChooseCar={choose} />;
}

describe('IdentityCard', () => {
  it('sure: "94% match" in the heading, the car row with its generation, years and Change', () => {
    cy.mount(
      <IdentityCard
        form={GT3_FORM}
        models={MODELS}
        provenance="ai"
        tier="sure"
        confidence={0.94}
        funFact="Revs to 9,000 rpm."
        onChooseCar={cy.stub()}
      />,
    );
    cy.get('[data-testid="identity-car-name"]').should('have.text', 'Porsche 911 GT3');
    cy.get('[data-testid="identity-card-confidence"]').should('have.text', '94% match');
    cy.get('[data-testid="check-model-hint"]').should('not.exist');
    cy.get('[data-testid="fun-fact"]').should('contain.text', 'Auto-fill fact, may be wrong');
    cy.contains('992 generation · Since 2021').should('be.visible');
    cy.get('[data-testid="change-car"]').should('contain.text', 'Change');
  });

  it('likely: highlights "Check the model"', () => {
    cy.mount(
      <IdentityCard
        form={GT3_FORM}
        models={MODELS}
        provenance="ai"
        tier="likely"
        confidence={0.7}
        onChooseCar={cy.stub()}
      />,
    );
    cy.get('[data-testid="identity-card-confidence"]').should('have.text', '70% match');
    cy.get('[data-testid="check-model-hint"]').should('contain.text', 'Check the model');
  });

  it('guess: "Is it one of these?" with candidate rows, the search and "Not in the album"', () => {
    const onChooseCar = cy.stub().as('choose');
    cy.mount(
      <IdentityCard
        form={EMPTY_FORM}
        models={MODELS}
        tier="guess"
        confidence={0.55}
        candidates={CANDIDATES}
        onChooseCar={onChooseCar}
      />,
    );
    cy.get('[data-testid="guess-candidates"]').should('contain.text', 'Is it one of these?');
    cy.get('[data-testid="identity-card-confidence"]').should('have.text', '55% match');
    cy.get('[data-testid="car-model-search"]').should('be.visible');
    cy.get('[data-testid="not-in-album-button"]').should('be.visible');
    cy.get('[data-testid="candidate-porsche-911-gt3"]').click();
    cy.get('@choose').should('have.been.calledOnceWith', { kind: 'model', model: MODELS[0] });
    cy.get('[data-testid="candidate-text-0"]').click();
    cy.get('@choose').should('have.been.calledWith', { kind: 'text', make: 'Porsche', model: '911' });
  });

  it('analysing: a placeholder bar where the car will appear, and the search stays usable', () => {
    cy.mount(<IdentityCard form={EMPTY_FORM} models={MODELS} isAnalysing onChooseCar={cy.stub()} />);
    cy.get('[data-testid="identity-card-analysing"]').should('exist');
    cy.get('[data-testid="car-model-search"]').should('be.visible');
  });

  it('a manual car shows who filled it in as the heading meta', () => {
    cy.mount(<IdentityCard form={GT3_FORM} models={MODELS} provenance="user" onChooseCar={cy.stub()} />);
    cy.get('[data-testid="identity-card"]').should('contain.text', 'You');
    cy.get('[data-testid="identity-card-confidence"]').should('not.exist');
  });

  it('free text only after "Not in the album", and an alias hit suggests the sticker', () => {
    cy.mount(<Stateful />);
    cy.get('[data-testid="make-input"]').should('not.exist');
    cy.get('[data-testid="not-in-album-button"]').click();
    cy.get('[data-testid="make-input"]').type('Citroen');
    cy.get('[data-testid="model-input"]').type('eend');
    cy.get('[data-testid="alias-suggestion"]').should('contain.text', '#29 Citroën 2CV');
    cy.get('[data-testid="use-alias-sticker"]').click();
    cy.get('[data-testid="identity-car-name"]').should('have.text', 'Citroën 2CV');
    cy.get('[data-testid="change-car"]').click();
    cy.get('[data-testid="car-model-search"]').should('be.visible');
  });
});

describe('CandidateChips', () => {
  it('lists stickers and free-text guesses as rows with their match', () => {
    const onPick = cy.stub().as('pick');
    cy.mount(<CandidateChips candidates={CANDIDATES} onPick={onPick} />);
    cy.get('[data-testid="candidate-text-0"]')
      .should('contain.text', 'Porsche 911')
      .and('contain.text', 'Not in the album')
      .and('contain.text', '55%')
      .and('have.attr', 'aria-label', 'Porsche 911 (not in the album), 55 percent match');
    cy.get('[data-testid="candidate-mazda-mx-5"]')
      .should('contain.text', 'Mazda MX-5')
      .and('contain.text', '10%')
      .click();
    cy.get('@pick').should('have.been.calledOnceWith', CANDIDATES[2]);
  });

  it('renders nothing without candidates', () => {
    cy.mount(<CandidateChips candidates={[]} onPick={cy.stub()} />);
    cy.get('[data-testid="candidate-chips"]').should('not.exist');
  });
});

describe('CarModelPicker', () => {
  it('finds stickers by nickname and accent-free spelling', () => {
    const onSelect = cy.stub().as('select');
    cy.mount(<CarModelPicker models={MODELS} onSelect={onSelect} isOtherSelected={false} />);
    cy.get('[data-testid="car-model-search"]').type('citroen 2cv');
    cy.get('[data-testid="car-model-option-citroen-2cv"]').should('be.visible');
    cy.get('[data-testid="car-model-search"]').clear().type('miata');
    cy.get('[data-testid="car-model-option-mazda-mx-5"]').click();
    cy.get('@select').should('have.been.calledOnceWith', MODELS[2]);
  });

  it('says when nothing matches and offers "Not in the album"', () => {
    const onChooseOther = cy.stub().as('other');
    cy.mount(
      <CarModelPicker models={MODELS} onSelect={cy.stub()} isOtherSelected={false} onChooseOther={onChooseOther} />,
    );
    cy.get('[data-testid="car-model-search"]').type('delorean');
    cy.get('[data-testid="car-model-no-results"]').should('contain.text', 'delorean');
    cy.get('[data-testid="not-in-album-button"]').click();
    cy.get('@other').should('have.been.calledOnce');
  });

  it('shows the chosen sticker with a Change action', () => {
    const onSelect = cy.stub().as('select');
    cy.mount(
      <CarModelPicker models={MODELS} selectedId="porsche-911-gt3" onSelect={onSelect} isOtherSelected={false} />,
    );
    cy.get('[data-testid="selected-car-model"]').should('contain.text', 'Porsche 911 GT3');
    cy.get('[data-testid="change-car-model"]').click();
    cy.get('@select').should('have.been.calledOnceWith', undefined);
  });
});

describe('StickerMatchRow', () => {
  it('shows "#07 New sticker" with the page, the sets and the tier, or a wildcard', () => {
    cy.mount(
      <StickerMatchRow model={MODELS[0]} isWildcard={false} kind="new" setIds={['autobahn-heroes', 'not-a-set']} />,
    );
    cy.get('[data-testid="sticker-match-number"]').should('have.text', '#07');
    cy.get('[data-testid="sticker-match"]')
      .should('contain.text', 'New sticker')
      .and('contain.text', '02 Sports')
      .and('contain.text', 'Rare');
    cy.get('[data-testid="sticker-match-rarity"]').should('exist');
    cy.mount(<StickerMatchRow model={MODELS[0]} isWildcard={false} kind="duplicate" count={3} />);
    cy.get('[data-testid="sticker-match"]').should('contain.text', 'Spotted 3 times');
    cy.mount(<StickerMatchRow isWildcard />);
    cy.get('[data-testid="sticker-match-wildcard"]').should('contain.text', 'Wildcard');
  });
});

describe('previewSpot', () => {
  const FORM = {
    carModelId: 'porsche-911-gt3',
    make: 'Porsche',
    model: '911 GT3',
    paint: 'blue',
    bodyStyle: 'coupe',
    city: 'Leuven',
    spottedAt: '2026-11-10T13:00:00.000Z',
    notes: '',
  } as const;
  const OLD: Spot = {
    id: 'old',
    userId: 'u',
    carModelId: 'porsche-911-gt3',
    make: 'Porsche',
    model: '911 GT3',
    photoPath: 'p',
    spottedAt: '2026-11-01T10:00:00.000Z',
    createdAt: '2026-11-01T10:00:00.000Z',
    paint: 'blue',
    bodyStyle: 'coupe',
    platesHidden: 1,
    identifiedBy: 'manual',
    shareNameWithOwner: false,
  };
  const NOW = new Date('2026-11-10T13:05:00.000Z');

  it('says "new" for a first sticker and earns XP, "duplicate" for a repeat', () => {
    const first = previewSpot(FORM, MODELS, [], [], NOW);
    expect(first?.kind).to.equal('new');
    expect(first?.count).to.equal(1);
    expect(first?.xpGained ?? 0).to.be.greaterThan(0);
    const again = previewSpot(FORM, MODELS, [OLD], [], NOW);
    expect(again?.kind).to.equal('duplicate');
    expect(again?.count).to.equal(2);
  });

  it('is undefined without a car, and a named car outside the album is a wildcard', () => {
    expect(previewSpot({ ...FORM, carModelId: undefined, make: '', model: '' }, MODELS, [], [], NOW)).to.equal(
      undefined,
    );
    const wildcard = previewSpot(
      { ...FORM, carModelId: undefined, make: 'DeLorean', model: 'DMC-12' },
      MODELS,
      [],
      [],
      NOW,
    );
    expect(wildcard?.kind).to.equal('wildcard');
  });
});
