import React from 'react';
import { Tag, Typography, Space } from 'antd';
import { StarFilled, ClockCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ToolSummary } from '../types';

interface Props {
  tool: ToolSummary;
}

const ToolCard: React.FC<Props> = ({ tool }) => {
  const navigate = useNavigate();
  const desc = tool.description || tool.description_en || '暂无描述';
  const shortDesc = desc.length > 150 ? desc.slice(0, 150) + '...' : desc;
  const updated = tool.github_updated_at
    ? new Date(tool.github_updated_at).toLocaleDateString('zh-CN')
    : null;

  return (
    <div
      onClick={() => navigate(`/tool/${tool.slug}`)}
      style={{
        background: '#ffffff',
        border: '1px solid #e8e4df',
        borderLeft: '3px solid transparent',
        borderRadius: 6,
        padding: '16px 20px',
        marginBottom: 10,
        cursor: 'pointer',
        transition: 'all 0.2s',
        boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderLeftColor = '#1a365d';
        e.currentTarget.style.borderLeft = '3px solid #1a365d';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderLeftColor = 'transparent';
        e.currentTarget.style.borderLeft = '3px solid transparent';
        e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.03)';
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <Typography.Title
          level={5}
          style={{
            margin: 0,
            fontFamily: "'Noto Serif SC', 'STSong', 'SimSun', serif",
            fontWeight: 600,
            color: '#1a365d',
            fontSize: 16,
          }}
        >
          {tool.name}
        </Typography.Title>
        <span style={{ color: '#6b6b6b', fontSize: 13, whiteSpace: 'nowrap', marginLeft: 12 }}>
          <StarFilled style={{ color: '#b8860b', marginRight: 4 }} />
          {tool.github_stars.toLocaleString()}
        </span>
      </div>

      <Typography.Paragraph
        style={{ color: '#6b6b6b', marginBottom: 10, fontSize: 14, lineHeight: 1.5 }}
      >
        {shortDesc}
      </Typography.Paragraph>

      <Space wrap size={[6, 4]}>
        {tool.github_language && (
          <Tag style={{ borderRadius: 3, border: '1px solid #e8e4df', background: '#faf9f6', color: '#4a4a4a', fontSize: 12 }}>
            {tool.github_language}
          </Tag>
        )}
        {tool.github_license && (
          <Tag style={{ borderRadius: 3, border: '1px solid #dce4ec', background: '#edf2f7', color: '#1a365d', fontSize: 12 }}>
            {tool.github_license}
          </Tag>
        )}
        {tool.categories?.map((c) => (
          <Tag key={c.id} style={{ borderRadius: 3, border: '1px solid #e8e4df', background: '#ffffff', color: '#6b6b6b', fontSize: 12 }}>
            {c.name}
          </Tag>
        ))}
        {updated && (
          <span style={{ color: '#9a9a9a', fontSize: 12 }}>
            <ClockCircleOutlined style={{ marginRight: 3 }} />
            {updated}
          </span>
        )}
      </Space>
    </div>
  );
};

export default ToolCard;
