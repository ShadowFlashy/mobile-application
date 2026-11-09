import { CategoryFilter } from '../../src/components/CategoryFilter';
import { CollectionProgress } from '../../src/components/CollectionProgress';
import { StepIndicator } from '../../src/components/StepIndicator';
import { StickerCard } from '../../src/components/StickerCard';
import { VanityPlate } from '../../src/components/VanityPlate';
import type { CarModel } from '../../src/types/CarModel';

const porsche: CarModel = {
  id: 'porsche-911-gt3',
  stickerNumber: 7,
  make: 'Porsche',
  model: '911 GT3',
  category: 'sports',
  rarity: 'rare',
};

describe('CollectionProgress', () => {
  it('shows how many stickers are collected', () => {
    cy.mount(<CollectionProgress collected={12} total={48} label="All stickers" />);
    cy.get('[data-testid="collection-progress-count"]').should('contain.text', '12').and('contain.text', '48');
  });
});

describe('StickerCard', () => {
  it('describes a locked sticker for screen readers', () => {
    cy.mount(<StickerCard model={porsche} isCollected={false} spotCount={0} onPress={() => undefined} />);
    cy.get('[data-testid="sticker-porsche-911-gt3"]').invoke('attr', 'aria-label').should('contain', 'Porsche 911 GT3');
  });

  it('opens the sticker when pressed', () => {
    const onPress = cy.stub().as('onPress');
    cy.mount(<StickerCard model={porsche} isCollected spotCount={2} onPress={onPress} />);
    cy.get('[data-testid="sticker-porsche-911-gt3"]').click();
    cy.get('@onPress').should('have.been.calledOnce');
  });

  it('shows the rarity of the car', () => {
    cy.mount(<StickerCard model={porsche} isCollected={false} spotCount={0} onPress={() => undefined} />);
    cy.get('[data-testid="rarity-rare"]').should('be.visible');
  });
});

describe('CategoryFilter', () => {
  it('reports the chosen category', () => {
    const onSelect = cy.stub().as('onSelect');
    cy.mount(<CategoryFilter onSelect={onSelect} />);
    cy.get('[data-testid="filter-jdm"]').click();
    cy.get('@onSelect').should('have.been.calledWith', 'jdm');
  });

  it('marks "All" as selected when no category is chosen', () => {
    cy.mount(<CategoryFilter onSelect={() => undefined} />);
    cy.get('[data-testid="filter-all"]').should('have.attr', 'aria-selected', 'true');
  });
});

describe('StepIndicator', () => {
  it('shows the current step', () => {
    cy.mount(<StepIndicator steps={['Photo', 'Hide plates', 'Details']} currentIndex={1} />);
    cy.get('[data-testid="step-indicator-label"]').should('contain.text', 'Hide plates');
  });
});

describe('VanityPlate', () => {
  it('shows the plate the owner chose to show', () => {
    cy.mount(<VanityPlate plate="SPEEDY" />);
    cy.contains('SPEEDY').should('be.visible');
  });
});
