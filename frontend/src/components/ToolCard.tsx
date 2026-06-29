import React from 'react';
import { Card, Tag, Typography, Space, Statistic } from 'antd';
import { StarOutlined, GithubOutlined, ClockCircleOutlined } from '@ant-design/icons';
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
    <Card
      hoverable
      onClick={() => navigate(`/tool/${tool.slug}`)}
      style={{ marginBottom: 12 }}
    >
      <Typography.Title level={5} style={{ marginBottom: 4 }}>
        {tool.name}
      </Typography.Title>
      <Typography.Paragraph type="secondary" style={{ marginBottom: 8 }}>
        {shortDesc}
      </Typography.Paragraph>
      <Space wrap size={[8, 4]}>
        <Tag icon={<StarOutlined />} color="gold">
          {tool.github_stars.toLocaleString()}
        </Tag>
        {tool.github_language && <Tag>{tool.github_language}</Tag>}
        {tool.github_license && <Tag color="green">{tool.github_license}</Tag>}
        {tool.categories?.map((c) => (
          <Tag key={c.id} color="blue">{c.name}</Tag>
        ))}
        {updated && (
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            <ClockCircleOutlined /> {updated}
          </Typography.Text>
        )}
      </Space>
    </Card>
  );
};

export default ToolCard;
