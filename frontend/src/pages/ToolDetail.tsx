import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Descriptions, Typography, Tag, Space, Button, Spin, Empty, Breadcrumb } from 'antd';
import { GithubOutlined, HomeOutlined, FileTextOutlined, SwapOutlined } from '@ant-design/icons';
import { useToolDetail } from '../hooks/useTools';
import { logger } from '../api/logger';

const ToolDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { tool, loading, error } = useToolDetail(slug);

  const addToCompare = () => {
    if (!tool) return;
    const raw = localStorage.getItem('bioinfohub_compare_slugs');
    const slugs: string[] = raw ? JSON.parse(raw) : [];
    if (slugs.includes(tool.slug)) {
      logger.warn(`工具已在对比列表中`);
      return;
    }
    if (slugs.length >= 4) {
      logger.warn(`对比列表已满`);
      return;
    }
    slugs.push(tool.slug);
    localStorage.setItem('bioinfohub_compare_slugs', JSON.stringify(slugs));
    logger.action(`加入对比: slug=${tool.slug}, 当前对比列表=${JSON.stringify(slugs)}`);
  };

  if (loading) return <Spin style={{ display: 'block', margin: '100px auto' }} />;
  if (error || !tool) {
    return (
      <Empty description={error || '工具不存在'} style={{ marginTop: 100 }}>
        <Button onClick={() => navigate('/')}>返回列表</Button>
      </Empty>
    );
  }

  const desc = tool.description || tool.description_en || tool.github_description || '暂无描述';

  return (
    <div>
      <Breadcrumb items={[{ title: '首页', onClick: () => navigate('/') }, { title: tool.name }]} style={{ marginBottom: 16 }} />

      <Typography.Title level={3}>{tool.name}</Typography.Title>
      <Typography.Paragraph type="secondary" style={{ fontSize: 15, marginBottom: 24 }}>
        {desc}
      </Typography.Paragraph>

      <Space style={{ marginBottom: 24 }}>
        {tool.github_url && (
          <Button icon={<GithubOutlined />} href={tool.github_url} target="_blank">GitHub</Button>
        )}
        {tool.homepage_url && (
          <Button icon={<HomeOutlined />} href={tool.homepage_url} target="_blank">官网</Button>
        )}
        {tool.publication_doi && (
          <Button icon={<FileTextOutlined />} href={`https://doi.org/${tool.publication_doi}`} target="_blank">
            论文
          </Button>
        )}
        <Button type="primary" icon={<SwapOutlined />} onClick={addToCompare}>
          加入对比
        </Button>
      </Space>

      <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }}>
        <Descriptions.Item label="Stars">{tool.github_stars.toLocaleString()}</Descriptions.Item>
        <Descriptions.Item label="Forks">{tool.github_forks.toLocaleString()}</Descriptions.Item>
        <Descriptions.Item label="Open Issues">{tool.github_open_issues.toLocaleString()}</Descriptions.Item>
        <Descriptions.Item label="编程语言">
          {tool.github_language ? <Tag>{tool.github_language}</Tag> : '-'}
        </Descriptions.Item>
        <Descriptions.Item label="开源协议">{tool.github_license || '-'}</Descriptions.Item>
        <Descriptions.Item label="状态">
          {tool.is_active ? <Tag color="green">活跃</Tag> : <Tag color="red">停更</Tag>}
        </Descriptions.Item>
        <Descriptions.Item label="GitHub 创建">
          {tool.github_created_at ? new Date(tool.github_created_at).toLocaleDateString('zh-CN') : '-'}
        </Descriptions.Item>
        <Descriptions.Item label="最近更新">
          {tool.github_updated_at ? new Date(tool.github_updated_at).toLocaleDateString('zh-CN') : '-'}
        </Descriptions.Item>
        <Descriptions.Item label="收录时间">
          {new Date(tool.created_at).toLocaleDateString('zh-CN')}
        </Descriptions.Item>
        <Descriptions.Item label="分类">
          <Space wrap>{tool.categories?.map((c) => <Tag key={c.id} color="blue">{c.name}</Tag>)}</Space>
        </Descriptions.Item>
        {tool.publication_title && (
          <Descriptions.Item label="相关论文" span={3}>
            {tool.publication_title}
            {tool.publication_year && ` (${tool.publication_year})`}
            {tool.citation_count > 0 && ` — 引用 ${tool.citation_count}`}
          </Descriptions.Item>
        )}
        {tool.github_topics && tool.github_topics.length > 0 && (
          <Descriptions.Item label="Topics" span={3}>
            <Space wrap>{(tool.github_topics as string[]).map((t: string) => <Tag key={t}>{t}</Tag>)}</Space>
          </Descriptions.Item>
        )}
      </Descriptions>
    </div>
  );
};

export default ToolDetail;
