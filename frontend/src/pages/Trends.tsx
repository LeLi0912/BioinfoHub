import React from 'react';
import { Typography, Spin, Row, Col, Card, Segmented, Empty, Button, Alert } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import HotToolRanking from '../components/HotToolRanking';
import TrendChart, { createPieOption, createBarOption, createLineOption } from '../components/TrendChart';
import { useTrends } from '../hooks/useTrends';

const Trends: React.FC = () => {
  const { rising, categories, languages, timeline, loading, error, timelineDays, setTimelineDays, retry } = useTrends();

  if (loading) return <Spin tip="加载趋势数据..." style={{ display: 'block', margin: '100px auto' }} />;

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <Alert type="error" message="数据加载失败" description={error} style={{ marginBottom: 16 }} />
        <Button type="primary" icon={<ReloadOutlined />} onClick={retry}>重试</Button>
      </div>
    );
  }

  const pieData = categories.map((c) => ({ name: c.category_name, value: c.count }));
  const barData = languages.map((l) => ({ name: l.language || 'Unknown', value: l.count }));
  const lineData = timeline.map((t) => ({ date: t.date, count: t.count }));

  return (
    <div>
      <Typography.Title level={3}>趋势面板</Typography.Title>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12} lg={8}>
          <Card>
            {rising.length > 0 ? (
              <HotToolRanking data={rising.slice(0, 10)} />
            ) : (
              <Empty description="暂无数据，需要至少 2 天快照数据" />
            )}
          </Card>
        </Col>

        <Col xs={24} md={12} lg={8}>
          <Card>
            {pieData.length > 0 ? (
              <TrendChart option={createPieOption(pieData, '分类分布')} />
            ) : (
              <Empty description="暂无分类数据" />
            )}
          </Card>
        </Col>

        <Col xs={24} md={12} lg={8}>
          <Card>
            {barData.length > 0 ? (
              <TrendChart option={createBarOption(barData, '编程语言分布 (Top 20)')} />
            ) : (
              <Empty description="暂无语言数据" />
            )}
          </Card>
        </Col>

        <Col span={24}>
          <Card
            title="新增工具趋势"
            extra={
              <Segmented
                options={[
                  { label: '30 天', value: 30 },
                  { label: '90 天', value: 90 },
                ]}
                value={timelineDays}
                onChange={(v) => setTimelineDays(v as number)}
              />
            }
          >
            {lineData.length > 0 ? (
              <TrendChart option={createLineOption(lineData, '')} height={400} />
            ) : (
              <Empty description="暂无时间线数据" />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Trends;
