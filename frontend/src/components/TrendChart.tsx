import React from 'react';
import ReactECharts from 'echarts-for-react';

interface Props {
  option: Record<string, unknown>;
  height?: number;
}

const TrendChart: React.FC<Props> = ({ option, height = 350 }) => {
  return (
    <ReactECharts
      option={option}
      style={{ height }}
      notMerge
      lazyUpdate
    />
  );
};

export function createPieOption(data: { name: string; value: number }[], title: string) {
  return {
    title: { text: title, left: 'center', textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'item' as const, formatter: '{b}: {c} ({d}%)' },
    legend: { bottom: 0, type: 'scroll' as const },
    series: [{ type: 'pie' as const, radius: ['40%', '70%'], data, label: { formatter: '{b}\n{d}%' } }],
  };
}

export function createBarOption(data: { name: string; value: number }[], title: string) {
  return {
    title: { text: title, left: 'center', textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'axis' as const },
    xAxis: { type: 'category' as const, data: data.map((d) => d.name), axisLabel: { rotate: 30 } },
    yAxis: { type: 'value' as const },
    series: [{ type: 'bar' as const, data: data.map((d) => d.value), itemStyle: { color: '#1677ff' } }],
    grid: { bottom: 80 },
  };
}

export function createLineOption(data: { date: string; count: number }[], title: string) {
  return {
    title: { text: title, left: 'center', textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'axis' as const },
    xAxis: { type: 'category' as const, data: data.map((d) => d.date), axisLabel: { rotate: 45, fontSize: 10 } },
    yAxis: { type: 'value' as const },
    series: [{ type: 'line' as const, data: data.map((d) => d.count), smooth: true, itemStyle: { color: '#52c41a' } }],
    grid: { bottom: 60 },
  };
}

export default TrendChart;
