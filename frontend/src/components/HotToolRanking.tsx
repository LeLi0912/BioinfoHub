import React from 'react';
import { List, Typography } from 'antd';
import { CaretUpOutlined, CaretDownOutlined } from '@ant-design/icons';
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
      header={
        <Typography.Title
          level={5}
          style={{
            margin: 0,
            fontFamily: "'Noto Serif SC', 'STSong', 'SimSun', serif",
            fontWeight: 600,
            color: '#1a365d',
          }}
        >
          涨星最快 Top {data.length}
        </Typography.Title>
      }
      dataSource={data}
      renderItem={(item, idx) => (
        <List.Item
          style={{ cursor: 'pointer', padding: '10px 0', borderBottom: '1px solid #f0ede8' }}
          onClick={() => navigate(`/tool/${item.tool_slug}`)}
        >
          <List.Item.Meta
            title={
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 22,
                    height: 22,
                    borderRadius: 4,
                    fontSize: 12,
                    fontWeight: 700,
                    background: idx < 3 ? '#8b3a3a' : '#e8e4df',
                    color: idx < 3 ? '#ffffff' : '#9a9a9a',
                  }}
                >
                  {idx + 1}
                </span>
                <span style={{ fontWeight: 500, color: '#2c2c2c' }}>{item.tool_name}</span>
              </span>
            }
            description={
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 30 }}>
                <span style={{ color: '#6b6b6b', fontSize: 13 }}>
                  +{item.stars_gained.toLocaleString()} stars
                </span>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: item.growth_rate >= 0 ? '#2d6a4f' : '#8b3a3a',
                  }}
                >
                  {item.growth_rate >= 0 ? <CaretUpOutlined /> : <CaretDownOutlined />}
                  {' '}{Math.abs(item.growth_rate)}%
                </span>
              </span>
            }
          />
        </List.Item>
      )}
    />
  );
};

export default HotToolRanking;
