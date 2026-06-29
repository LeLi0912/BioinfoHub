import React from 'react';
import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<Props> = ({ value, onChange, placeholder = '搜索工具名称或描述...' }) => {
  return (
    <Input
      allowClear
      size="large"
      placeholder={placeholder}
      prefix={<SearchOutlined style={{ color: '#9a9a9a' }} />}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{ maxWidth: 520 }}
    />
  );
};

export default SearchBar;
