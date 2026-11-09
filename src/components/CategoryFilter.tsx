import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet } from 'react-native';
import { spacing } from '../theme';
import { CAR_CATEGORIES, type CarCategory } from '../types/CarModel';
import { Tag } from './primitives/Tag';

interface CategoryFilterProps {
  selected?: CarCategory;
  onSelect: (category?: CarCategory) => void;
}

/** Horizontal, swipeable filter chips: "All" plus one chip per category. */
export function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  const { t } = useTranslation();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
      accessibilityLabel={t('ui.category_filter_a11y')}
    >
      <Tag
        label={t('ui.category_all')}
        selected={selected === undefined}
        onPress={() => onSelect(undefined)}
        testID="filter-all"
      />
      {CAR_CATEGORIES.map((category) => (
        <Tag
          key={category}
          label={t(`categories.${category}`)}
          selected={selected === category}
          onPress={() => onSelect(category)}
          testID={`filter-${category}`}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.sm, paddingVertical: spacing.xs },
});
