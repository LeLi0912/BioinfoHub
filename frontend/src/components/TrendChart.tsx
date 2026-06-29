import React from 'react';
import ReactECharts from 'echarts-for-react';

interface Props {
  option: Record<string, unknown>;
  height?: number;
}

const CHART_COLORS = ['#1a365d', '#2d6a4f', '#8b3a3a', '#b8860b', '#2c5282', '#6b8f71', '#a0522d', '#4a7c96', '#8b6b4a', '#5a7a8a'];

const TrendChart: React.FC<Props> = ({ option, height = 350 }) => {
  const enrichedOption = {
    ...option,
    color: CHART_COLORS,
  };

  return (
    <ReactECharts
      option={enrichedOption}
      style={{ height }}
      notMerge
      lazyUpdate
    />
  );
};

export function createPieOption(data: { name: string; value: number }[], title: string) {
  return {
    title: {
      text: title,
      left: 'center',
      textStyle: { fontSize: 14, fontFamily: "'Noto Serif SC', serif", color: '#1a365d', fontWeight: 600 },
    },
    tooltip: { trigger: 'item' as const, formatter: '{b}: {c} ({d}%)' },
    legend: { bottom: 0, type: 'scroll' as const, textStyle: { color: '#6b6b6b' } },
    series: [
      {
        type: 'pie' as const,
        radius: ['40%', '70%'],
        data,
        label: { formatter: '{b}\n{d}%', color: '#6b6b6b', fontSize: 11 },
        itemStyle: { borderColor: '#ffffff', borderWidth: 2 },
      },
    ],
  };
}

export function createBarOption(data: { name: string; value: number }[], title: string) {
  return {
    title: {
      text: title,
      left: 'center',
      textStyle: { fontSize: 14, fontFamily: "'Noto Serif SC', serif", color: '#1a365d', fontWeight: 600 },
    },
    tooltip: { trigger: 'axis' as const },
    xAxis: {
      type: 'category' as const,
      data: data.map((d) => d.name),
      axisLabel: { rotate: 30, fontSize: 10, color: '#6b6b6b' },
      axisLine: { lineStyle: { color: '#e8e4df' } },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value' as const,
      axisLabel: { color: '#6b6b6b' },
      splitLine: { lineStyle: { color: '#f0ede8' } },
    },
    series: [
      {
        type: 'bar' as const,
        data: data.map((d) => d.value),
        itemStyle: { borderRadius: [4, 4, 0, 0] },
      },
    ],
    grid: { bottom: 80, top: 40, left: 50, right: 20 },
  };
}

export function createLineOption(data: { date: string; count: number }[], title: string) {
  return {
    title: {
      text: title,
      left: 'center',
      textStyle: { fontSize: 14, fontFamily: "'Noto Serif SC', serif", color: '#1a365d', fontWeight: 600 },
    },
    tooltip: { trigger: 'axis' as const },
    xAxis: {
      type: 'category' as const,
      data: data.map((d) => d.date),
      axisLabel: { rotate: 45, fontSize: 10, color: '#6b6b6b' },
      axisLine: { lineStyle: { color: '#e8e4df' } },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value' as const,
      axisLabel: { color: '#6b6b6b' },
      splitLine: { lineStyle: { color: '#f0ede8' } },
    },
    series: [
      {
        type: 'line' as const,
        data: data.map((d) => d.count),
        smooth: true,
        lineStyle: { width: 2 },
        areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(45,106,79,0.12)' }, { offset: 1, color: 'rgba(45,106,79,0)' }] } },
        itemStyle: { color: '#2d6a4f' },
      },
    ],
    grid: { bottom: 60, top: 20, left: 50, right: 20 },
  };
}

export default TrendChart;
