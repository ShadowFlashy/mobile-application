import { AchievementList } from '../../../src/components/progress/AchievementList';
import { AchievementRow, tierRatio } from '../../../src/components/progress/AchievementRow';
import { ChallengeList } from '../../../src/components/progress/ChallengeList';
import { ChallengeRow } from '../../../src/components/progress/ChallengeRow';
import {
  SAMPLE_WEEK_ENDS_AT,
  sampleAchievements,
  sampleChallenges,
  sampleStreak,
} from '../../../src/components/progress/fixtures';
import { LevelReadout } from '../../../src/components/progress/LevelReadout';
import { StatsReadouts } from '../../../src/components/progress/StatsReadouts';
import { StreakReadout, streakHint } from '../../../src/components/progress/StreakReadout';
import { levelForXp } from '../../../src/utils/progression';

const [warmup, main, stretch] = sampleChallenges;
const [gold, bronze, silver, locked, , secret] = sampleAchievements;

function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error('fixture missing');
  return value;
}

/** The computed colour of an element. */
function colorOf(selector: string): Cypress.Chainable<string> {
  return cy.get(selector).then(($el) => getComputedStyle($el.get(0)).color);
}

describe('LevelReadout', () => {
  it('reads "LVL 9 · 290 XP to level 10" with a 2 px progress line', () => {
    cy.mount(<LevelReadout level={levelForXp(4210)} />);
    cy.get('[data-testid="level-readout-value"]').should('have.attr', 'aria-label', 'Level 9').and('contain.text', '9');
    cy.get('[data-testid="level-readout"]').should('contain.text', 'LVL').and('contain.text', '290 XP to level 10');
    cy.get('[data-testid="level-readout"] [role="progressbar"]')
      .should('have.attr', 'aria-valuenow', String(Math.round(((4210 - 3600) / 900) * 100)))
      .and('have.attr', 'aria-label', '68% of the way to level 10')
      .invoke('outerHeight')
      .should('equal', 2);
  });
});

describe('StreakReadout', () => {
  it('shows "6 weeks", the at-risk hint and the 8-week history as a 2 px timeline', () => {
    cy.mount(<StreakReadout streak={sampleStreak} />);
    cy.get('[data-testid="streak-readout-figure-value"]')
      .should('contain.text', '6')
      .and('contain.text', 'weeks')
      .and('have.attr', 'aria-label', '6-week streak');
    cy.get('[data-testid="streak-readout"]').should(
      'contain.text',
      'Spot before Sunday 23:59 to keep your 6-week streak',
    );
    cy.get('[data-testid="streak-readout-week-on"]').should('have.length', 5);
    cy.get('[data-testid="streak-readout-week-off"]').should('have.length', 3);
    cy.get('[data-testid="streak-readout-week-on"]').first().invoke('outerHeight').should('equal', 2);
    cy.get('[data-testid="streak-readout-week-off"]').first().invoke('outerHeight').should('equal', 1);
    cy.get('[data-testid="streak-readout-chart"]').should(
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

describe('StatsReadouts', () => {
  it('shows level, stickers, spots and streak on a two-column grid', () => {
    cy.viewport(390, 844);
    cy.mount(
      <StatsReadouts
        level={levelForXp(4210)}
        stickers={{ collected: 10, total: 118 }}
        spots={14}
        streak={sampleStreak}
      />,
    );
    cy.get('[data-testid="stickers-readout-value"]').should('contain.text', '10').and('contain.text', '/118');
    cy.get('[data-testid="stickers-readout"]').should('contain.text', 'Stickers · 8% collected');
    cy.get('[data-testid="spots-readout-value"]').should('have.text', '14');
    cy.get('[data-testid="spots-readout"]').should('contain.text', 'Spots logged');
    cy.get('[data-testid="level-readout"]').then(($level) => {
      cy.get('[data-testid="stickers-readout"]').should(($stickers) => {
        expect($stickers.offset()?.top).to.equal($level.offset()?.top);
        expect($stickers.offset()?.left ?? 0).to.be.greaterThan($level.offset()?.left ?? 0);
      });
    });
    cy.get('[data-testid="streak-readout"]').should('be.visible');
  });
});

describe('ChallengeRow and ChallengeList', () => {
  beforeEach(() => {
    cy.clock(Date.UTC(2026, 10, 11, 10), ['Date']);
  });

  it('is a 40 px hairline row with the task, the count and the XP', () => {
    cy.mount(<ChallengeRow challenge={required(stretch)} />);
    cy.get('[data-testid="challenge-stretch"]')
      .should('contain.text', 'Spot 1 epic or rarer car')
      .and('contain.text', '+250 XP')
      .and('have.attr', 'aria-label')
      .and('contain', 'Spot 1 epic or rarer car. 0 of 1. 250 XP.');
    cy.get('[data-testid="challenge-stretch"]').invoke('outerHeight').should('be.gte', 40);
    cy.get('[data-testid="challenge-stretch-progress"]').should('have.text', '0/1');
    cy.get('[data-testid="challenge-stretch-done"]').should('not.exist');
  });

  it('names the Appendix E collection in a "2 cars from {set}" challenge', () => {
    cy.mount(<ChallengeRow challenge={required(main)} />);
    cy.get('[data-testid="challenge-main"]').should('contain.text', 'Spot 2 cars from Italian Exotics');
    cy.get('[data-testid="challenge-main-progress"]').should('have.text', '1/2');
  });

  it('shows a check for a finished challenge and lets it recede', () => {
    cy.mount(<ChallengeRow challenge={required(warmup)} />);
    cy.get('[data-testid="challenge-warmup-done"]').should('exist');
    cy.get('[data-testid="challenge-warmup-progress"]').should('not.exist');
    cy.get('[data-testid="challenge-warmup"]').should('have.attr', 'aria-label').and('contain', 'Completed');
    cy.mount(<ChallengeRow challenge={required(main)} />);
    colorOf('[data-testid="challenge-main"] [dir="auto"]').then((active) => {
      cy.mount(<ChallengeRow challenge={required(warmup)} />);
      colorOf('[data-testid="challenge-warmup"] [dir="auto"]').should('not.equal', active);
    });
  });

  it('lists this week under one heading with a live countdown', () => {
    cy.mount(<ChallengeList challenges={sampleChallenges} endsAt={SAMPLE_WEEK_ENDS_AT} />);
    cy.get('[data-testid="challenges"]').should('contain.text', 'This week');
    cy.get('[data-testid="challenges-countdown"]').should('have.text', 'Ends in 4d 13h');
    cy.get('[data-testid^="challenge-"][aria-label]').should('have.length', 3);
    cy.mount(<ChallengeList challenges={sampleChallenges} endsAt="2026-11-11T15:04:00.000Z" />);
    cy.get('[data-testid="challenges-countdown"]').should('have.text', 'Ends in 5h 04m');
    cy.mount(<ChallengeList challenges={sampleChallenges} endsAt="2026-11-11T09:00:00.000Z" />);
    cy.get('[data-testid="challenges-countdown"]').should('have.text', 'Week over');
  });
});

describe('AchievementRow', () => {
  it('shows the name, the description and the tier as a word with the date it was earned', () => {
    cy.mount(<AchievementRow achievement={required(silver)} />);
    cy.get('[data-testid="achievement-collector"]')
      .should('contain.text', 'Collector')
      .and('contain.text', 'Stickers collected')
      .and('have.attr', 'aria-label', 'Collector, Silver, 30 of 48');
    cy.get('[data-testid="achievement-collector-silver"]').should('have.text', 'Silver');
    cy.get('[data-testid="achievement-collector-date"]').invoke('text').should('match', /2026/);
  });

  it('shows a locked row in text-2 with its progress', () => {
    cy.mount(<AchievementRow achievement={required(locked)} />);
    cy.get('[data-testid="achievement-set_collector-locked"]').should('have.text', 'Locked');
    cy.get('[data-testid="achievement-set_collector-progress"]').should('have.text', '0/1');
    expect(tierRatio({ ...required(locked), value: 3, nextThreshold: 4 })).to.equal(0.75);
    expect(tierRatio(required(gold))).to.equal(1);
    colorOf('[data-testid="achievement-set_collector-locked"]').then((lockedColor) => {
      cy.mount(<AchievementRow achievement={required(gold)} />);
      colorOf('[data-testid="achievement-ignition-gold"]').should('not.equal', lockedColor);
    });
  });

  it('hides a secret achievement and shows a gold one without a target', () => {
    cy.mount(<AchievementRow achievement={required(secret)} />);
    cy.get('[data-testid="achievement-redline"]')
      .should('contain.text', 'Secret achievement')
      .and('not.contain.text', 'Complete album');
    cy.get('[data-testid="achievement-redline-progress"]').should('not.exist');
    cy.mount(<AchievementRow achievement={required(gold)} />);
    cy.get('[data-testid="achievement-ignition-gold"]').should('have.text', 'Gold');
    cy.get('[data-testid="achievement-ignition"]').should('have.attr', 'aria-label', 'First spot, Gold, 37');
  });

  it('says "New" for an unseen tier and reports presses', () => {
    const onPress = cy.stub().as('press');
    cy.mount(<AchievementRow achievement={required(bronze)} isNew onPress={onPress} />);
    cy.get('[data-testid="achievement-spotter-new"]').should('have.text', 'New');
    cy.get('[data-testid="achievement-spotter"]')
      .should('have.attr', 'role', 'button')
      .and('have.attr', 'aria-label')
      .and('contain', 'New');
    cy.get('[data-testid="achievement-spotter"]').invoke('outerHeight').should('be.gte', 44);
    cy.get('[data-testid="achievement-spotter"]').click();
    cy.get('@press').should('have.been.calledOnce');
  });
});

describe('AchievementList', () => {
  it('lists every achievement as a row and opens the progress to the next tier on tap', () => {
    const onOpen = cy.stub().as('open');
    cy.mount(<AchievementList achievements={sampleAchievements} isNew={(a) => a.id === 'collector'} onOpen={onOpen} />);
    cy.get('[data-testid="achievements"]').should('contain.text', 'Achievements').and('contain.text', '4 of 6 earned');
    cy.get('[data-testid^="achievement-"][role="button"]').should('have.length', sampleAchievements.length);
    cy.get('[data-testid="achievement-ignition"]').then(($first) => {
      cy.get('[data-testid="achievement-spotter"]').should(($second) => {
        expect($second.offset()?.top ?? 0).to.be.greaterThan($first.offset()?.top ?? 0);
      });
    });
    cy.get('[data-testid="achievement-collector-new"]').should('exist');
    cy.get('[data-testid="achievement-collector"]').click();
    cy.get('@open').should('have.been.calledOnce');
    cy.get('[data-testid="achievement-collector-details"]')
      .should('contain.text', '30/48 · Next tier at 48')
      .and('contain.text', 'Earned');
    cy.get('[data-testid="achievement-collector-details"] [role="progressbar"]').should(
      'have.attr',
      'aria-valuenow',
      '63',
    );
    cy.get('[data-testid="achievement-collector"]').click();
    cy.get('[data-testid="achievement-collector-details"]').should('not.exist');
  });
});
