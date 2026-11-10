import { Redirect, router } from 'expo-router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AiConsentSheet } from '../../src/components/capture/AiConsentSheet';
import { AiStatusBanner } from '../../src/components/capture/AiStatusBanner';
import { AnalysingChip } from '../../src/components/capture/AnalysingChip';
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
import { PlateShield } from '../../src/components/capture/PlateShield';
import { StickerMatchRow } from '../../src/components/capture/StickerMatchRow';
import { IconButton, PhotoFrame, Row, Screen, Section, Stack, Text } from '../../src/components/primitives';
import { routes } from '../../src/constants/routes';
import { useCapture } from '../../src/hooks/useCapture';
import { hasCar, visibleProvenance } from '../../src/utils/captureForm';

/**
 * The Pit Stop review (SPEC §5, §6.1, P0-03…P0-06): one scrolling screen, plates first, then the
 * car, sticker, paint, city, date, owner ping and notes, with COLLECT in a sticky bar. It opens
 * while Co-Driver is still analysing and never blocks. Without a draft (refresh or deep link) it
 * goes back to the Spot tab. All logic lives in useCapture; this screen only composes components.
 */
export default function CaptureScreen() {
  const { t } = useTranslation();
  const capture = useCapture({ withPreview: true });
  const { draft, dispatch, discard } = capture;

  // Leaving the screen (COLLECT → reveal, close, retake, back) drops the photo and plate from memory.
  useEffect(() => discard, [discard]);

  if (draft === undefined) return <Redirect href={routes.spot} />;

  const outcome = draft.outcome;
  const identified = outcome?.status === 'identified' ? outcome : undefined;
  const isNotACar = outcome?.status === 'not_a_car' && !draft.manual;
  const selectedModel = capture.models.find((model) => model.id === draft.form.carModelId);
  const isSaving = draft.status === 'collecting' || draft.status === 'collected';

  const leave = () => (router.canGoBack() ? router.back() : router.replace(routes.spot));
  const onCollect = async () => {
    const spotId = await capture.collect();
    if (spotId !== undefined) router.replace(routes.reveal(spotId));
  };

  return (
    <Screen
      testID="capture-screen"
      footer={
        isNotACar ? undefined : (
          <CollectBar
            gate={capture.gate}
            onCollect={() => void onCollect()}
            isSaving={draft.status === 'collecting'}
            saveError={draft.saveError}
          />
        )
      }
    >
      <Stack gap="lg">
        <Row justify="space-between" align="center">
          <Text variant="title" heading>
            {t('capture.title')}
          </Text>
          <IconButton icon="close" label={t('capture.close')} onPress={leave} testID="capture-close" />
        </Row>

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

        {isNotACar ? (
          <Stack gap="md">
            <PhotoFrame uri={draft.photo.uri} accessibilityLabel={t('redactor.accessibility_label')} radius="md" />
            <NotACarCard onRetake={() => router.replace(routes.spot)} onFillManually={capture.fillManually} />
          </Stack>
        ) : (
          <Stack gap="lg">
            <Section title={t('capture.section_plates')} testID="plates-section">
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
                overlay={<PlateShield count={draft.regions.length} confirmation={draft.plateConfirmation} />}
                disabled={isSaving}
              />
              <PlateConfirm
                regionCount={draft.regions.length}
                confirmation={draft.plateConfirmation}
                needsSecondTap={capture.needsSecondTap}
                ignoredCount={capture.ignoredSuggestionCount}
                onConfirm={(confirmation) => dispatch({ type: 'confirm_plates', confirmation })}
                onConfirmIgnored={() => dispatch({ type: 'confirm_ignored_suggestions' })}
              />
            </Section>

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
            />
            <StickerMatchRow
              model={selectedModel}
              isWildcard={selectedModel === undefined && hasCar(draft.form)}
              provenance={visibleProvenance(draft, 'car')}
            />
            <PaintPicker
              value={draft.form.paint}
              onChange={(paint) => dispatch({ type: 'edit', field: 'paint', patch: { paint } })}
              provenance={visibleProvenance(draft, 'paint')}
              isAnalysing={capture.isAnalysing && !draft.touched.includes('paint')}
            />
            <Section title={t('capture.section_details')}>
              <CityField
                value={draft.form.city}
                onChange={(city) => dispatch({ type: 'edit', field: 'city', patch: { city } })}
                provenance={visibleProvenance(draft, 'city')}
              />
              <DateField
                value={draft.form.spottedAt}
                onChange={(spottedAt) => dispatch({ type: 'edit', field: 'date', patch: { spottedAt } })}
                provenance={visibleProvenance(draft, 'date')}
              />
            </Section>
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
