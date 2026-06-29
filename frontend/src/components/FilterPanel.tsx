import React from 'react';
import { Select, Space } from 'antd';

interface Category {
  id: number;
  name: string;
  slug: string;
  count: number;
}

interface Props {
  categories: Category[];
  selectedCategory: string;
  selectedLanguage: string;
  onCategoryChange: (slug: string) => void;
  onLanguageChange: (lang: string) => void;
}

const LANGUAGES = ['Python', 'R', 'Java', 'C++', 'JavaScript', 'Perl', 'Rust', 'Go', 'MATLAB'];

const FilterPanel: React.FC<Props> = ({
  categories,
  selectedCategory,
  selectedLanguage,
  onCategoryChange,
  onLanguageChange,
}) => {
  return (
    <Space wrap style={{ marginBottom: 16 }}>
      <Select
        allowClear
        placeholder="选择分类"
        value={selectedCategory || undefined}
        onChange={(v) => onCategoryChange(v || '')}
        style={{ width: 180 }}
        options={categories.map((c) => ({
          value: c.slug,
          label: `${c.name} (${c.count})`,
        }))}
      />
      <Select
        allowClear
        placeholder="编程语言"
        value={selectedLanguage || undefined}
        onChange={(v) => onLanguageChange(v || '')}
        style={{ width: 140 }}
        options={LANGUAGES.map((l) => ({ value: l, label: l }))}
      />
    </Space>
  );
};

export default FilterPanel;
