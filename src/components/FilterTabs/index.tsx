import React from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';
import type { FilterOption } from '@/types';

interface FilterTabsProps {
  options: FilterOption[];
  activeValue: string;
  onChange: (value: string) => void;
}

const FilterTabs: React.FC<FilterTabsProps> = ({ options, activeValue, onChange }) => {
  return (
    <ScrollView scrollX className={styles.scrollContainer} enable-flex>
      <View className={styles.tabsContainer}>
        {options.map((option) => (
          <View
            key={option.value}
            className={classnames(
              styles.tabItem,
              activeValue === option.value && styles.tabActive
            )}
            onClick={() => onChange(option.value)}
          >
            <Text className={classnames(
              styles.tabText,
              activeValue === option.value && styles.tabTextActive
            )}>
              {option.label}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default FilterTabs;
