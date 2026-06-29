import React from 'react';
import { List, Typography, Tag } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { TrendRisingItem } from '../types';

interface Props {
  data: TrendRisingItem[];
}

const HotToolRanking: React.FC<Props> = ({ data }) => {
  const navigate = useNavigate();

  return (
    <List
      size="small"
      header={<Typography.Title level={5} style={{ margin: 0 }}>涨星最快 Top {data.length}</Typography.Title>}
      dataSource={data}
      renderItem={(item, idx) => (
        <List.Item
          style={{ cursor: 'pointer' }}
          onClick={() => navigate(`/tool/${item.tool_slug}`)}
        >
          <List.Item.Meta
            title={
              <span>
                <Tag color={idx < 3 ? 'gold' : 'default'}>{idx + 1}</Tag>
                {item.tool_name}
              </span>
            }
            description={
              <span>
                +{item.stars_gained.toLocaleString()} stars
                <Tag
                  color={item.growth_rate >= 0 ? 'green' : 'red'}
                  style={{ marginLeft: 8 }}
                >
                  {item.growth_rate >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                  {Math.abs(item.growth_rate)}%
                </Tag>
              </span>
            }
          />
        </List.Item>
      )}
    />
  );
};

export default HotToolRanking;
