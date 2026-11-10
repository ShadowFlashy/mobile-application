import { AchievementCabinet } from '../../../src/components/progress/AchievementCabinet';
import { DashPlaque, plaqueRatio } from '../../../src/components/progress/DashPlaque';
import {
  SAMPLE_WEEK_ENDS_AT,
  sampleAchievements,
  sampleChallenges,
  sampleStreak,
} from '../../../src/components/progress/fixtures';
import { LevelRoundel } from '../../../src/components/progress/LevelRoundel';
import { PitBoard } from '../../../src/components/progress/PitBoard';
import { ledZone, litLeds, ShiftLights } from '../../../src/components/progress/ShiftLights';
import { StreakCounter, streakHint } from '../../../src/components/progress/StreakCounter';
import { XpSummary } from '../../../src/components/progress/XpSummary';
import { levelForXp } from '../../../src/utils/progression';

const [warmup, main, stretch] = sampleChallenges;
const [gold, bronze, silver, locked, , secret] = sampleAchievements;

function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error('fixture missing');
  return value;
}

describe('ShiftLights', () => {
  it('lights round(ratio × leds) LEDs and exposes the value', () => {
    [0, 0.03, 0.5, 0.68, 0.97, 1].forEach((ratio) => {
      cy.mount(<ShiftLights ratio={ratio} leds={15} label="Level progress" testID="lights" />);
      cy.get('[data-testid="lights-led-on"]').should('have.length', Math.round(ratio * 15));
      cy.get('[data-testid="lights-led-off"]').should('have.length', 15 - Math.round(ratio * 15));
      cy.get('[data-testid="lights"]')
        .should('have.attr', 'role', 'progressbar')
        .and('have.attr', 'aria-valuenow', String(Math.round(ratio * 15)))
        .and('have.attr', 'aria-valuemax', '15')
        .and('have.attr', 'aria-label', 'Level progress');
    });
  });

  it('has 5 LEDs for confidence and clamps out-of-range ratios', () => {
    cy.mount(<ShiftLights ratio={1.7} leds={5} label="Sure" testID="confidence" />);
    cy.get('[data-testid="confidence-led-on"]').should('have.length', 5);
    expect(litLeds(-1, 5)).to.equal(0);
    expect(litLeds(Number.NaN, 15)).to.equal(0);
    expect(litLeds(0.5, 5)).to.equal(3);
  });

  it('runs green → yellow → red', () => {
    expect(Array.from({ length: 5 }, (_, index) => ledZone(index, 5))).to.deep.equal([
      'green',
      'green',
      'yellow',
      'yellow',
      'red',
    ]);
    const fifteen = Array.from({ length: 15 }, (_, index) => ledZone(index, 15));
    expect(fifteen.filter((zone) => zone === 'green')).to.have.length(6);
    expect(fifteen.filter((zone) => zone === 'red')).to.have.length(3);
  });
});

describe('LevelRoundel', () => {
  it('shows the level with an accessible label in every size', () => {
    (['sm', 'md', 'lg'] as const).forEach((size) => {
      cy.mount(<LevelRoundel level={9} size={size} />);
      cy.get('[data-testid="level-roundel"]').should('have.attr', 'aria-label', 'Level 9').and('contain.text', '9');
    });
    cy.get('[data-testid="level-roundel"]').should('contain.text', 'LVL').invoke('outerWidth').should('equal', 88);
  });
});

describe('PitBoard', () => {
  beforeEach(() => {
    cy.clock(Date.UTC(2026, 10, 11, 10), ['Date']);
  });

  it('shows the task, progress, XP and a live countdown', () => {
    cy.mount(<PitBoard challenge={required(stretch)} endsAt={SAMPLE_WEEK_ENDS_AT} />);
    cy.get('[data-testid="pit-board-stretch"]')
      .should('contain.text', 'Stretch')
      .and('contain.text', 'Spot 1 epic or rarer car');
    cy.get('[data-testid="pit-board-stretch"]').should('contain.text', '+250 XP');
    cy.get('[data-testid="pit-board-stretch-progress"]').should('have.text', '0/1');
    cy.get('[data-testid="pit-board-stretch-countdown"]').should('have.text', 'Ends in 4d 13h');
    cy.get('[data-testid="pit-board-stretch-done"]').should('not.exist');
    cy.get('[data-testid="pit-board-stretch"]')
      .should('have.attr', 'aria-label')
      .and('contain', 'Spot 1 epic or rarer car. 0 of 1. 250 XP.');
  });

  it('names the Appendix E collection in a "2 cars from {set}" board', () => {
    cy.mount(<PitBoard challenge={required(main)} endsAt={SAMPLE_WEEK_ENDS_AT} />);
    cy.get('[data-testid="pit-board-main"]').should('contain.text', 'Spot 2 cars from Italian Exotics');
    cy.get('[data-testid="pit-board-main-progress"]').should('have.text', '1/2');
  });

  it('stamps a completed board with the chequered DONE stamp', () => {
    cy.mount(<PitBoard challenge={required(warmup)} endsAt={SAMPLE_WEEK_ENDS_AT} />);
    cy.get('[data-testid="pit-board-warmup-done"]').should('contain.text', 'Done');
    cy.get('[data-testid="pit-board-warmup"]').should('have.attr', 'aria-label').and('contain', 'Completed');
  });

  it('counts down in hours and minutes on the last day, and says when the week is over', () => {
    cy.mount(<PitBoard challenge={required(stretch)} endsAt="2026-11-11T15:04:00.000Z" />);
    cy.get('[data-testid="pit-board-stretch-countdown"]').should('have.text', 'Ends in 5h 04m');
    cy.mount(<PitBoard challenge={required(stretch)} endsAt="2026-11-11T09:00:00.000Z" />);
    cy.get('[data-testid="pit-board-stretch-countdown"]').should('have.text', 'Week over');
  });

  it('has a one-line compact variant', () => {
    cy.mount(<PitBoard challenge={required(main)} endsAt={SAMPLE_WEEK_ENDS_AT} compact />);
    cy.get('[data-testid="pit-board-main"]').should('contain.text', '1/2').and('contain.text', 'Main');
    cy.get('[data-testid="pit-board-main-countdown"]').should('not.exist');
  });
});

describe('DashPlaque', () => {
  it('shows the tier ring and writes the tier out', () => {
    cy.mount(<DashPlaque achievement={required(silver)} />);
    cy.get('[data-testid="plaque-collector-silver"]').should('exist');
    cy.get('[data-testid="plaque-collector"]').should('contain.text', 'Collector').and('contain.text', 'Silver');
    cy.get('[data-testid="plaque-collector-progress"]').should('have.text', '30/48');
    cy.get('[data-testid="plaque-collector"]').should('have.attr', 'aria-label', 'Collector, Silver, 30 of 48');
  });

  it('shows a locked plaque with a progress ring', () => {
    cy.mount(<DashPlaque achievement={required(locked)} />);
    cy.get('[data-testid="plaque-set_collector-locked"]').find('circle').should('have.length', 2);
    cy.get('[data-testid="plaque-set_collector"]').should('contain.text', 'Locked').and('contain.text', '0/1');
    expect(plaqueRatio({ ...required(locked), value: 3, nextThreshold: 4 })).to.equal(0.75);
    expect(plaqueRatio(required(gold))).to.equal(1);
  });

  it('hides a secret plaque and shows a gold one without a target', () => {
    cy.mount(<DashPlaque achievement={required(secret)} />);
    cy.get('[data-testid="plaque-redline"]').should('contain.text', '???').and('not.contain.text', 'Redline');
    cy.mount(<DashPlaque achievement={required(gold)} />);
    cy.get('[data-testid="plaque-ignition-gold"]').should('exist');
    cy.get('[data-testid="plaque-ignition"]').should('have.attr', 'aria-label', 'Ignition, Gold, 37');
  });

  it('marks a new tier with a dot and reports presses', () => {
    const onPress = cy.stub().as('press');
    cy.mount(<DashPlaque achievement={required(bronze)} isNew onPress={onPress} />);
    cy.get('[data-testid="plaque-spotter-new"]').should('exist');
    cy.get('[data-testid="plaque-spotter"]')
      .should('have.attr', 'role', 'button')
      .and('have.attr', 'aria-label')
      .and('contain', 'New');
    cy.get('[data-testid="plaque-spotter"]').click();
    cy.get('@press').should('have.been.calledOnce');
  });
});

describe('AchievementCabinet', () => {
  it('lays plaques out in 3 columns and opens details on tap', () => {
    const onOpen = cy.stub().as('open');
    cy.mount(
      <AchievementCabinet achievements={sampleAchievements} isNew={(a) => a.id === 'collector'} onOpen={onOpen} />,
    );
    cy.get('[data-testid^="plaque-"][role="button"]').should('have.length', sampleAchievements.length);
    cy.get('[data-testid="plaque-ignition"]').then(($first) => {
      cy.get('[data-testid="plaque-spotter"]').then(($second) => {
        cy.get('[data-testid="plaque-set_collector"]').then(($fourth) => {
          expect($second.offset()?.top).to.equal($first.offset()?.top);
          expect($fourth.offset()?.top ?? 0).to.be.greaterThan($first.offset()?.top ?? 0);
        });
      });
    });
    cy.get('[data-testid="plaque-collector-new"]').should('exist');
    cy.get('[data-testid="plaque-collector"]').click();
    cy.get('@open').should('have.been.calledOnce');
    cy.get('[data-testid="achievement-cabinet-details"]')
      .should('contain.text', 'Stickers collected.')
      .and('contain.text', 'Next plaque at 48')
      .and('contain.text', 'Unlocked on');
  });
});

describe('StreakCounter', () => {
  it('shows the run, the 8-week lap chart and the at-risk hint', () => {
    cy.mount(<StreakCounter streak={sampleStreak} />);
    cy.get('[data-testid="streak-counter-value"]').should('have.text', '6');
    cy.get('[data-testid="streak-counter-week-on"]').should('have.length', 5);
    cy.get('[data-testid="streak-counter-week-off"]').should('have.length', 3);
    cy.get('[data-testid="streak-counter-hint"]').should(
      'have.text',
      'Spot before Sunday 23:59 to keep your 6-week streak',
    );
    cy.get('[data-testid="streak-counter-chart"]').should(
      'have.attr',
      'aria-label',
      'Last 8 weeks: 5 of 8 with a spot',
    );
  });

  it('picks the right hint', () => {
    expect(streakHint(sampleStreak)).to.equal('at_risk');
    expect(streakHint({ ...sampleStreak, atRisk: false })).to.equal('alive');
    expect(
      streakHint({ ...sampleStreak, atRisk: false, lastWeeks: [...sampleStreak.lastWeeks.slice(0, 7), true] }),
    ).to.equal('this_week');
    expect(streakHint({ current: 0, best: 0, atRisk: false, lastWeeks: [] })).to.equal('start');
  });
});

describe('XpSummary', () => {
  it('shows level, title, 15 shift lights and the XP to the next level', () => {
    cy.mount(<XpSummary level={levelForXp(4210)} />);
    cy.get('[data-testid="xp-summary-title"]').should('have.text', 'Car-park Hunter');
    cy.get('[data-testid="xp-summary-xp"]').should('have.text', '4,210 XP · 290 to level 10');
    cy.get('[data-testid="xp-summary-lights-led-on"]').should('have.length', Math.round(((4210 - 3600) / 900) * 15));
    cy.get('[data-testid="level-roundel"]').should('have.attr', 'aria-label', 'Level 9');
  });

  it('keeps the 15-LED strip inside the card at 360 px', () => {
    cy.viewport(360, 740);
    cy.mount(<XpSummary level={levelForXp(4210)} />);
    cy.get('[data-testid="xp-summary"]').then(($card) => {
      const card = $card.get(0).getBoundingClientRect();
      cy.get('[data-testid="xp-summary-lights"]').should(($bezel) => {
        const bezel = $bezel.get(0).getBoundingClientRect();
        // Inside the card's 16 px padding.
        expect(bezel.right).to.be.at.most(card.right - 15.5);
      });
      cy.get('[data-testid="xp-summary-lights-led-off"]')
        .first()
        .should(($led) => {
          const led = $led.get(0).getBoundingClientRect();
          expect(Math.abs(led.width - led.height)).to.be.below(1);
        });
    });
  });
});
