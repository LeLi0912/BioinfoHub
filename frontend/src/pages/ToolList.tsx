import React, { useEffect, useState } from 'react';
import { List, Pagination, Select, Typography, Space, Empty, Spin, Radio } from 'antd';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';
import ToolCard from '../components/ToolCard';
import { useToolList } from '../hooks/useTools';
import { fetchCategories } from '../api/compare';

interface CategoryItem {
  id: number;
  name: string;
  slug: string;
  count: number;
}

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const ToolList: React.FC = () => {
  const { items, total, loading, params, setParams } = useToolList();
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setParams((p) => ({ ...p, q: searchText, page: 1 }));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchText, setParams]);

  return (
    <div>
      <Typography.Title level={3}>生物信息工具</Typography.Title>

      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <SearchBar value={searchText} onChange={setSearchText} />

        <Space wrap>
          <FilterPanel
            categories={categories}
            selectedCategory={params.category}
            selectedLanguage={params.language}
            onCategoryChange={(v) => setParams((p) => ({ ...p, category: v, page: 1 }))}
            onLanguageChange={(v) => setParams((p) => ({ ...p, language: v, page: 1 }))}
          />
          <Radio.Group
            value={`${params.sort}_${params.order}`}
            onChange={(e) => {
              const [sort, order] = e.target.value.split('_');
              setParams((p) => ({ ...p, sort, order, page: 1 }));
            }}
            optionType="button"
            buttonStyle="solid"
            size="small"
          >
            <Radio.Button value="stars_desc">最热</Radio.Button>
            <Radio.Button value="updated_desc">最近更新</Radio.Button>
            <Radio.Button value="created_desc">最新入库</Radio.Button>
          </Radio.Group>
        </Space>

        <Spin spinning={loading}>
          {items.length === 0 && !loading ? (
            <Empty description="暂无工具数据，请先触发数据同步" />
          ) : (
            <List
              dataSource={items}
              renderItem={(tool) => <ToolCard tool={tool} />}
            />
          )}
        </Spin>

        {total > 0 && (
          <Pagination
            current={params.page}
            pageSize={params.page_size}
            total={total}
            onChange={(page, page_size) => setParams((p) => ({ ...p, page, page_size }))}
            showSizeChanger
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            showTotal={(t) => `共 ${t} 个工具`}
          />
        )}
      </Space>
    </div>
  );
};

export default ToolList;
