import {
  CANVAS,
  fitsCanvas,
  fitsSafeZone,
  paintedReach,
  stickerReach,
  stickerTransform,
} from '../../../scripts/lib/iconLayout.mjs';

interface ManifestFixture {
  background_color: string;
  theme_color: string;
  icons: { src: string; purpose: string; type: string }[];
  shortcuts: { url: string }[];
}

// Layout maths behind scripts/generate-icons.mjs (SPEC P0-23): maskable icons keep their content
// inside the 40 % safe circle, Android adaptive icons inside 33/108.
describe('icon layout', () => {
  it('measures the rounded sticker corner from its centre', () => {
    // (30 − 14) × √2 + 14 on the 64 grid
    expect(stickerReach()).to.be.closeTo(36.627, 0.001);
  });

  it('keeps the maskable placement inside the 40 % safe circle, shadow included', () => {
    const maskable = { cx: 512, cy: 512, scale: 9.4, tilt: -6 };
    expect(fitsSafeZone(maskable, 0.4)).to.equal(true);
    expect(paintedReach(maskable)).to.be.lessThan(0.4 * CANVAS);
    expect(fitsSafeZone({ ...maskable, scale: 11 }, 0.4)).to.equal(false);
  });

  it('keeps the adaptive-icon foreground inside the 66 dp safe zone', () => {
    expect(fitsSafeZone({ cx: 512, cy: 512, scale: 7.4, tilt: -6 }, 33 / 108)).to.equal(true);
    expect(fitsSafeZone({ cx: 512, cy: 512, scale: 9.4, tilt: -6 }, 33 / 108)).to.equal(false);
  });

  it('notices a sticker that would leave the canvas', () => {
    expect(fitsCanvas({ cx: 512, cy: 512, scale: 12.4, tilt: -6 })).to.equal(true);
    expect(fitsCanvas({ cx: 512, cy: 512, scale: 16, tilt: 0 })).to.equal(false);
    expect(fitsCanvas({ cx: 100, cy: 512, scale: 10, tilt: 0 })).to.equal(false);
  });

  it('places the 64 grid around its centre', () => {
    expect(stickerTransform({ cx: 512, cy: 506, scale: 10, tilt: -6 })).to.equal(
      'translate(512 506) rotate(-6) scale(10) translate(-32 -32)',
    );
  });
});

describe('brand assets on disk', () => {
  it('has one SVG master with the three parts the generator reads', () => {
    cy.readFile('assets/brand/icon-master.svg').then((svg: string) => {
      expect(svg).to.contain('<!-- defs:start -->');
      expect(svg).to.contain('<g id="asphalt">');
      expect(svg).to.contain('<g id="sticker"');
      expect(svg).to.contain('#E10600');
      expect(svg).to.contain('#0D0E11');
    });
  });

  it('lists PNG icons (any and maskable), the dark A background colour and the three shortcuts', () => {
    cy.readFile('public/manifest.json').then((manifest: ManifestFixture) => {
      expect(manifest.background_color).to.equal('#0B0B0C');
      expect(manifest.theme_color).to.equal('#0B0B0C');
      expect(manifest.icons.map((icon) => icon.purpose)).to.include.members(['any', 'maskable']);
      manifest.icons.forEach((icon) => expect(icon.type).to.equal('image/png'));
      expect(manifest.shortcuts.map((shortcut) => shortcut.url)).to.deep.equal(['/spot', '/', '/owners']);
    });
  });
});
