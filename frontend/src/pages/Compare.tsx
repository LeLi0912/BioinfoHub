import React from 'react';
import { Typography, AutoComplete, Space, Tag, Empty } from 'antd';
import CompareTable from '../components/CompareTable';
import { useCompare, useCompareSearch } from '../hooks/useCompare';

const Compare: React.FC = () => {
  const { items, loading, addSlug, removeSlug } = useCompare();
  const { results, searching, search } = useCompareSearch();

  const options = results.map((t) => ({
    value: t.slug,
    label: (
      <span>
        {t.name}
        <Tag style={{ marginLeft: 8 }}>{t.github_stars} stars</Tag>
        {t.github_language && <Tag>{t.github_language}</Tag>}
      </span>
    ),
  }));

  return (
    <div>
      <Typography.Title level={3}>工具对比</Typography.Title>
      <Typography.Paragraph type="secondary">
        最多对比 4 个工具。输入工具名称搜索并添加。
      </Typography.Paragraph>

      <AutoComplete
        style={{ width: 400, marginBottom: 16 }}
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
