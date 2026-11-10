import { fakePosition } from '../../support/geoFakes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement, useState } from 'react';
import sure from '../../fixtures/identify/sure.json';
import { useAutoLocation, type AutoLocationInput } from '../../../src/hooks/useAutoLocation';
import { useIdentifyCar } from '../../../src/hooks/useIdentifyCar';
import { DEFAULT_SETTINGS } from '../../../src/services/settingsService';
import { useSettingsStore } from '../../../src/state/useSettingsStore';
import type { AiImage } from '../../../src/types/Identification';
import type { AppSettings } from '../../../src/types/Settings';

// W3 hooks: Co-Driver off → zero identify-car calls (SPEC §0.1); city pre-fill order (P0-02).
const FUNCTION_URL = 'https://example.supabase.co/functions/v1/identify-car';
const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': 'authorization, x-client-info, apikey, content-type',
  'access-control-allow-methods': 'POST, OPTIONS',
};

function setSettings(patch: Partial<AppSettings>) {
  useSettingsStore.setState({ ...DEFAULT_SETTINGS, ...patch, isLoaded: true });
}

function image(): AiImage {
  return {
    blob: new Blob([new Uint8Array([0xff, 0xd8, 0xff, 0xd9])], { type: 'image/jpeg' }),
    width: 4,
    height: 4,
    dHash: '0000000000000000',
  };
}

function IdentifyProbe() {
  const { identify } = useIdentifyCar();
  const [result, setResult] = useState('idle');
  return createElement(
    'button',
    {
      type: 'button',
      'data-testid': 'identify',
      onClick: () => {
        void identify(image()).then((outcome) =>
          setResult(outcome.status === 'unavailable' ? `unavailable:${outcome.reason}` : outcome.status),
        );
      },
    },
    result,
  );
}

function LocationProbe({ input }: { input: AutoLocationInput }) {
  const { suggest } = useAutoLocation();
  const [result, setResult] = useState('idle');
  return createElement(
    'button',
    {
      type: 'button',
      'data-testid': 'suggest',
      onClick: () => {
        void suggest(input).then((suggestion) =>
          setResult(
            suggestion === undefined ? 'none' : `${suggestion.place.id}|${suggestion.label}|${suggestion.source}`,
          ),
        );
      },
    },
    result,
  );
}

function mountWithQuery(element: ReturnType<typeof createElement>) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  cy.mount(createElement(QueryClientProvider, { client }, element));
}

describe('useIdentifyCar', () => {
  beforeEach(() => {
    cy.intercept('OPTIONS', FUNCTION_URL, { statusCode: 204, headers: CORS });
    cy.intercept('POST', FUNCTION_URL, { statusCode: 200, headers: CORS, body: sure }).as('identify');
  });

  it('returns disabled and makes zero identify-car calls with Co-Driver off', () => {
    setSettings({ aiEnabled: false });
    mountWithQuery(createElement(IdentifyProbe));
    cy.get('[data-testid="identify"]').click();
    cy.get('[data-testid="identify"]').should('have.text', 'unavailable:disabled');
    cy.get('@identify.all').should('have.length', 0);
  });

  it('calls identify-car once with Co-Driver on', () => {
    setSettings({ aiEnabled: true });
    mountWithQuery(createElement(IdentifyProbe));
    cy.get('[data-testid="identify"]').click();
    cy.get('[data-testid="identify"]').should('have.text', 'identified');
    cy.get('@identify.all').should('have.length', 1);
  });
});

describe('useAutoLocation', () => {
  const spaGps = { latitude: 50.4921, longitude: 5.8638 };

  it('uses EXIF GPS first and never asks the device', () => {
    setSettings({ autoLocation: true });
    const geolocation = cy.stub(navigator.geolocation, 'getCurrentPosition');
    mountWithQuery(createElement(LocationProbe, { input: { exifGps: spaGps, isFresh: true } }));
    cy.get('[data-testid="suggest"]').click();
    cy.get('[data-testid="suggest"]').should('have.text', 'spa|Spa|exif');
    cy.then(() => expect(geolocation).not.to.have.been.called);
  });

  it('uses the coarse device position for a fresh photo without GPS', () => {
    setSettings({ autoLocation: true });
    cy.stub(navigator.geolocation, 'getCurrentPosition').callsFake((success: PositionCallback) => {
      success(fakePosition(51.2194, 4.4025, 50));
    });
    mountWithQuery(createElement(LocationProbe, { input: { isFresh: true } }));
    cy.get('[data-testid="suggest"]').click();
    cy.get('[data-testid="suggest"]').should('have.text', 'antwerpen|Antwerp|device');
  });

  it('suggests nothing for an old photo without GPS, without asking the device', () => {
    setSettings({ autoLocation: true });
    const geolocation = cy.stub(navigator.geolocation, 'getCurrentPosition');
    mountWithQuery(createElement(LocationProbe, { input: { isFresh: false } }));
    cy.get('[data-testid="suggest"]').click();
    cy.get('[data-testid="suggest"]').should('have.text', 'none');
    cy.then(() => expect(geolocation).not.to.have.been.called);
  });

  it('reads nothing at all with auto-city switched off', () => {
    setSettings({ autoLocation: false });
    const geolocation = cy.stub(navigator.geolocation, 'getCurrentPosition');
    mountWithQuery(createElement(LocationProbe, { input: { exifGps: spaGps, isFresh: true } }));
    cy.get('[data-testid="suggest"]').click();
    cy.get('[data-testid="suggest"]').should('have.text', 'none');
    cy.then(() => expect(geolocation).not.to.have.been.called);
  });
});
