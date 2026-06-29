import React from 'react';
import { Table, Tag, Space, Button } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import type { ToolCompareItem } from '../types';

interface Props {
  items: ToolCompareItem[];
  onRemove: (slug: string) => void;
}

const CompareTable: React.FC<Props> = ({ items, onRemove }) => {
  if (items.length === 0) {
    return (
      <div style={{ color: '#9a9a9a', textAlign: 'center', padding: 60, fontSize: 15 }}>
        暂无对比工具，请从详情页添加或搜索添加
      </div>
    );
  }

  const columns = [
    {
      title: '指标',
      dataIndex: 'label',
      key: 'label',
      fixed: 'left' as const,
      width: 100,
      render: (text: string) => (
        <span style={{ fontWeight: 600, color: '#1a365d', fontFamily: "'Noto Serif SC', serif" }}>
          {text}
        </span>
      ),
    },
    ...items.map((tool) => ({
      title: (
        <Space>
          <span style={{ fontWeight: 600, color: '#1a365d' }}>{tool.name}</span>
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => onRemove(tool.slug)}
            style={{ color: '#8b3a3a' }}
          />
        </Space>
      ),
      dataIndex: tool.slug,
      key: tool.slug,
      render: (value: React.ReactNode) => value,
    })),
  ];

  const maxStars = Math.max(...items.map((t) => t.github_stars), 0);
  const data = [
    { label: 'Stars', ...Object.fromEntries(items.map((t) => [t.slug, _highlight(t.github_stars, maxStars)])) },
    { label: 'Forks', ...Object.fromEntries(items.map((t) => [t.slug, t.github_forks.toLocaleString()])) },
    { label: 'Issues', ...Object.fromEntries(items.map((t) => [t.slug, t.github_open_issues.toLocaleString()])) },
    { label: '语言', ...Object.fromEntries(items.map((t) => [t.slug, t.github_language || '-'])) },
    { label: '协议', ...Object.fromEntries(items.map((t) => [t.slug, t.github_license || '-'])) },
    {
      label: '活跃度',
      ...Object.fromEntries(
        items.map((t) => [
          t.slug,
          t.is_active ? (
            <Tag style={{ borderRadius: 3, background: '#e8f5e9', color: '#2d6a4f', border: 'none' }}>活跃</Tag>
          ) : (
            <Tag style={{ borderRadius: 3, background: '#fce4e4', color: '#8b3a3a', border: 'none' }}>停更</Tag>
          ),
        ])
      ),
    },
    {
      label: '创建时间',
      ...Object.fromEntries(
        items.map((t) => [
          t.slug,
          t.github_created_at ? new Date(t.github_created_at).toLocaleDateString('zh-CN') : '-',
        ])
      ),
    },
    {
      label: '最近更新',
      ...Object.fromEntries(
        items.map((t) => [
          t.slug,
          t.github_updated_at ? new Date(t.github_updated_at).toLocaleDateString('zh-CN') : '-',
        ])
      ),
    },
    {
      label: '分类',
      ...Object.fromEntries(
        items.map((t) => [
          t.slug,
          <Space wrap>
            {t.categories.map((c) => (
              <Tag key={c.id} style={{ borderRadius: 3, border: '1px solid #e8e4df', background: '#ffffff', color: '#6b6b6b' }}>
                {c.name}
              </Tag>
            ))}
          </Space>,
        ])
      ),
    },
  ];

  return (
    <Table
      dataSource={data}
      columns={columns}
      pagination={false}
      bordered
      size="middle"
      scroll={{ x: 'max-content' }}
    />
  );
};

function _highlight(value: number, max: number): React.ReactNode {
  if (value === max && max > 0) {
    return (
      <span style={{ color: '#2d6a4f', fontWeight: 700 }}>
        {value.toLocaleString()} ★
      </span>
    );
  }
  return value.toLocaleString();
}

export default CompareTable;
