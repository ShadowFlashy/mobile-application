import { Redirect, router } from 'expo-router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AiConsentSheet } from '../../src/components/capture/AiConsentSheet';
import { AiStatusBanner } from '../../src/components/capture/AiStatusBanner';
import { AnalysingChip } from '../../src/components/capture/AnalysingChip';
import { ChallengeRow } from '../../src/components/capture/ChallengeRow';
import { CityField } from '../../src/components/capture/CityField';
import { CollectBar } from '../../src/components/capture/CollectBar';
import { DateField } from '../../src/components/capture/DateField';
import { DuplicateBanner } from '../../src/components/capture/DuplicateBanner';
import { IdentityCard } from '../../src/components/capture/IdentityCard';
import { NotACarCard } from '../../src/components/capture/NotACarCard';
import { NotesField } from '../../src/components/capture/NotesField';
import { OwnerPingRow } from '../../src/components/capture/OwnerPingRow';
import { PaintPicker } from '../../src/components/capture/PaintPicker';
import { PlateConfirm } from '../../src/components/capture/PlateConfirm';
import { PlateEditor } from '../../src/components/capture/PlateEditor';
import { StickerMatchRow } from '../../src/components/capture/StickerMatchRow';
import { useSpotPreview } from '../../src/hooks/useSpotPreview';
import { IconButton, PhotoFrame, Screen, Section, Stack } from '../../src/components/primitives';
import { useChallengeText } from '../../src/components/progress/challengeText';
import { routes } from '../../src/constants/routes';
import { useCapture } from '../../src/hooks/useCapture';
import { hasCar, visibleProvenance } from '../../src/utils/captureForm';

/**
 * The New spot review (SPEC §5, §6.1, P0-03…P0-06): one scrolling screen with the photo and its
 * plate boxes, then Plates, Car, Details, the owner ping and notes, and "Add to album" in a compact
 * sticky footer. It opens while auto-fill is still analysing and never blocks. Without a draft
 * (refresh or deep link) it goes back to the Spot tab. All logic lives in useCapture; this screen
 * only composes components.
 */
export default function CaptureScreen() {
  const { t } = useTranslation();
  const capture = useCapture({ withPreview: true });
  const { draft, dispatch, discard } = capture;
  const preview = useSpotPreview(draft?.form, capture.models);
  const { describe } = useChallengeText();

  // Leaving the screen (save → reveal, close, retake, back) drops the photo and plate from memory.
  useEffect(() => discard, [discard]);

  if (draft === undefined) return <Redirect href={routes.spot} />;

  const outcome = draft.outcome;
  const identified = outcome?.status === 'identified' ? outcome : undefined;
  const isNotACar = outcome?.status === 'not_a_car' && !draft.manual;
  const selectedModel = capture.models.find((model) => model.id === draft.form.carModelId);
  const isSaving = draft.status === 'collecting' || draft.status === 'collected';
  const result =
    preview !== undefined && preview.xpGained > 0
      ? [
          selectedModel !== undefined
            ? t('capture.sticker_result', { number: String(selectedModel.stickerNumber).padStart(2, '0') })
            : undefined,
          t('capture.xp_value', { xp: preview.xpGained }),
        ]
          .filter((part): part is string => part !== undefined)
          .join(' · ')
      : undefined;

  const leave = () => (router.canGoBack() ? router.back() : router.replace(routes.spot));
  const onCollect = async () => {
    const spotId = await capture.collect();
    if (spotId !== undefined) router.replace(routes.reveal(spotId));
  };

  return (
    <Screen
      testID="capture-screen"
      title={t('capture.title')}
      headerAction={<IconButton icon="close" label={t('capture.close')} onPress={leave} testID="capture-close" />}
      footer={
        isNotACar ? undefined : (
          <CollectBar
            gate={capture.gate}
            onCollect={() => void onCollect()}
            isSaving={draft.status === 'collecting'}
            saveError={draft.saveError}
            result={result}
          />
        )
      }
    >
      <Stack gap="lg">
        {isNotACar ? (
          <Stack gap="lg">
            <PhotoFrame uri={draft.photo.uri} accessibilityLabel={t('redactor.accessibility_label')} radius="md" />
            <NotACarCard onRetake={() => router.replace(routes.spot)} onFillManually={capture.fillManually} />
          </Stack>
        ) : (
          <PlateEditor
            photo={draft.photo}
            previewUri={capture.previewUri}
            regions={draft.regions}
            suggestions={draft.suggestions}
            acceptedSuggestions={draft.acceptedSuggestions}
            onAddRegion={(region) => dispatch({ type: 'add_region', region })}
            onUpdateRegion={(index, region) => dispatch({ type: 'update_region', index, region })}
            onRemoveRegion={(index) => dispatch({ type: 'remove_region', index })}
            onAcceptSuggestion={(index) => dispatch({ type: 'accept_suggestion', index })}
            disabled={isSaving}
          />
        )}

        {(capture.isAnalysing && !draft.awaitingConsent) ||
        outcome?.status === 'unavailable' ||
        capture.duplicateSpot !== undefined ? (
          <Stack gap="none">
            {capture.isAnalysing && !draft.awaitingConsent && <AnalysingChip onFillManually={capture.fillManually} />}
            {outcome?.status === 'unavailable' && <AiStatusBanner reason={outcome.reason} />}
            {capture.duplicateSpot !== undefined && (
              <DuplicateBanner
                spottedAt={capture.duplicateSpot.spottedAt}
                onView={() => {
                  if (capture.duplicateSpot !== undefined) router.push(routes.spotDetail(capture.duplicateSpot.id));
                }}
                onSaveAnyway={() => dispatch({ type: 'dismiss_duplicate' })}
              />
            )}
          </Stack>
        ) : null}

        {!isNotACar && (
          <>
            <PlateConfirm
              regionCount={draft.regions.length}
              confirmation={draft.plateConfirmation}
              needsSecondTap={capture.needsSecondTap}
              ignoredCount={capture.ignoredSuggestionCount}
              onConfirm={(confirmation) => dispatch({ type: 'confirm_plates', confirmation })}
              onConfirmIgnored={() => dispatch({ type: 'confirm_ignored_suggestions' })}
              sectionTestID="plates-section"
            />

            <IdentityCard
              form={draft.form}
              models={capture.models}
              provenance={visibleProvenance(draft, 'car')}
              tier={capture.tier}
              confidence={identified?.car.confidence}
              candidates={capture.candidates}
              isAnalysing={capture.isAnalysing}
              funFact={identified?.car.funFact}
              onChooseCar={(choice) => dispatch({ type: 'choose_car', choice })}
            >
              {hasCar(draft.form) && (
                <StickerMatchRow
                  model={selectedModel}
                  isWildcard={selectedModel === undefined}
                  kind={preview?.kind}
                  count={preview?.count}
                  setIds={preview?.setIds}
                />
              )}
              {preview?.challenges.map((challenge) => (
                <ChallengeRow
                  key={challenge.id}
                  challenge={describe(challenge)}
                  xp={challenge.xp}
                  testID={`challenge-row-${challenge.slot}`}
                />
              ))}
            </IdentityCard>

            <Section title={t('capture.section_details')}>
              <DateField
                value={draft.form.spottedAt}
                onChange={(spottedAt) => dispatch({ type: 'edit', field: 'date', patch: { spottedAt } })}
                provenance={visibleProvenance(draft, 'date')}
              />
              <CityField
                value={draft.form.city}
                onChange={(city) => dispatch({ type: 'edit', field: 'city', patch: { city } })}
                provenance={visibleProvenance(draft, 'city')}
              />
              <PaintPicker
                value={draft.form.paint}
                onChange={(paint) => dispatch({ type: 'edit', field: 'paint', patch: { paint } })}
                provenance={visibleProvenance(draft, 'paint')}
                isAnalysing={capture.isAnalysing && !draft.touched.includes('paint')}
              />
            </Section>
            <Stack gap="sm">
              <OwnerPingRow
                value={draft.form}
                onChange={capture.setOwnerPing}
                provenance={visibleProvenance(draft, 'plate')}
              />
              <NotesField
                value={draft.form.notes}
                onChange={(notes) => dispatch({ type: 'set_options', patch: { notes } })}
              />
            </Stack>
          </>
        )}
      </Stack>

      <AiConsentSheet
        visible={draft.awaitingConsent}
        onAccept={capture.acceptConsent}
        onDecline={capture.declineConsent}
      />
    </Screen>
  );
}
