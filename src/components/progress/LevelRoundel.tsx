import { useTranslation } from 'react-i18next';
import { Text as RNText, View } from 'react-native';
import { createThemedStyles } from '../../theme';

export type LevelRoundelSize = 'sm' | 'md' | 'lg';

export interface LevelRoundelProps {
  level: number;
  size: LevelRoundelSize;
}

const NUMBER_STYLE = { sm: 'smNumber', md: 'mdNumber', lg: 'lgNumber' } as const;

/**
 * The driver level as a racing-number roundel: a white decal disc with a black ring and the number
 * in condensed italic (identical in both schemes, like a real door number).
 */
export function LevelRoundel({ level, size }: LevelRoundelProps) {
  const { t } = useTranslation();
  const styles = useStyles();
  return (
    <View
      style={[styles.disc, styles[size]]}
      accessible
      accessibilityRole="image"
      accessibilityLabel={t('progress.level_label', { level })}
      testID="level-roundel"
    >
      {size === 'lg' && (
        <RNText style={styles.caption} maxFontSizeMultiplier={1.2}>
          {t('progress.level_short')}
        </RNText>
      )}
      <RNText style={[styles.number, styles[NUMBER_STYLE[size]]]} maxFontSizeMultiplier={1.2} numberOfLines={1}>
        {String(level)}
      </RNText>
    </View>
  );
}

const useStyles = createThemedStyles(({ instruments, text, radii }) => ({
  disc: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
    backgroundColor: instruments.roundel,
    borderColor: instruments.roundelInk,
  },
  sm: { width: 32, height: 32, borderWidth: 2 },
  md: { width: 48, height: 48, borderWidth: 3 },
  lg: { width: 88, height: 88, borderWidth: 4 },
  number: { ...text.hero, color: instruments.roundelInk, textAlign: 'center' },
  smNumber: { fontSize: 16, lineHeight: 18 },
  mdNumber: { fontSize: 24, lineHeight: 26 },
  lgNumber: { fontSize: 40, lineHeight: 42 },
  caption: { ...text.label, fontSize: 10, lineHeight: 12, color: instruments.roundelInk },
}));
