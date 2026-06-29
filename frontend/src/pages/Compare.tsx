import React from 'react';
import { Typography, AutoComplete, Tag } from 'antd';
import CompareTable from '../components/CompareTable';
import { useCompare, useCompareSearch } from '../hooks/useCompare';

const Compare: React.FC = () => {
  const { items, addSlug, removeSlug } = useCompare();
  const { results, searching, search } = useCompareSearch();

  const options = results.map((t) => ({
    value: t.slug,
    label: (
      <span>
        {t.name}
        <Tag style={{ marginLeft: 8, borderRadius: 3 }}>{t.github_stars} stars</Tag>
        {t.github_language && <Tag style={{ borderRadius: 3 }}>{t.github_language}</Tag>}
      </span>
    ),
  }));

  return (
    <div>
      <Typography.Title
        level={3}
        style={{
          fontFamily: "'Noto Serif SC', 'STSong', 'SimSun', serif",
          fontWeight: 700,
          color: '#1a365d',
          marginBottom: 8,
        }}
      >
        工具对比
      </Typography.Title>
      <Typography.Paragraph style={{ color: '#6b6b6b', marginBottom: 20 }}>
        最多对比 4 个工具。输入工具名称搜索并添加。
      </Typography.Paragraph>

      <AutoComplete
        style={{ width: 400, marginBottom: 20 }}
        options={options}
        onSearch={search}
        onSelect={(slug: string) => addSlug(slug)}
        placeholder="搜索工具名称以添加对比..."
        notFoundContent={searching ? '搜索中...' : '无匹配结果'}
      />

      <CompareTable items={items} onRemove={removeSlug} />
    </div>
  );
};

export default Compare;
