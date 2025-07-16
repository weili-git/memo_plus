// components/Histogram.js
import React, { useEffect, useState, useRef } from 'react';

import * as d3 from 'd3';

const Histogram = ({ data, color = '#69b3a2', onClick }) => {
  
  const svgRef = useRef();
  const [startDate, setStartDate] = useState();
  const [viewRange, setViewRange] = useState(() => {
    const now = new Date();
    const threeMonthAgo = new Date();
    threeMonthAgo.setMonth(now.getMonth() - 3);
    return [
      threeMonthAgo,
      now
    ]
  });

  useEffect(() => {
    if (!data || data.length==0) return;
    // 范围 startDate ~ now，先计算startDate
    setStartDate(new Date(Math.min(...data.map(d => new Date(d+'Z')))));
    const now = new Date();
    if (startDate < new Date(now.getFullYear(), now.getMonth(), now.getDate()-90)) {
      // 左边界超过了startDate，调整范围
      if (viewRange[0] < startDate) {
        setViewRange([startDate, new Date(Math.min(new Date(), new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()+90)))]);
      }
      // 右边界超过了now，调整范围
      if (viewRange[1] > new Date()) {
        setViewRange([new Date(Math.max(startDate, new Date(now.getFullYear(), now.getMonth(), now.getDate()-90))), new Date()]);
      }
    } else {
      // 范围小于3个月，调整范围
      setViewRange[startDate, now];
    }
    

    // 设置 SVG 的尺寸
    const width = 1000;
    const height = 400;
    const margin = { top: 20, right: 30, bottom: 40, left: 40 };

    const svg = d3.select(svgRef.current);

    // 清理之前的内容
    svg.selectAll("*").remove();

    svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // 处理数据，将时间数据转换为天
    const formattedData = data.reduce((acc, d) => {
      // UTC -> 当地时间
      const localDate = new Date(d + 'Z');
      if (localDate >= viewRange[0] && localDate <= viewRange[1]) {
        acc.push(new Date(localDate.getFullYear(), localDate.getMonth(), localDate.getDate())); // 取整日，x坐标起始点为整点
      }
      return acc;
    },[]);

    // 定义x轴的比例尺
    const x = d3.scaleTime()
      .domain(viewRange) // [d3.min(formattedData), new Date()] // d3.timeDay.offset(new Date(), 1)
      .range([margin.left, width - margin.right])

    const histogram = d3.histogram()
      .value(d => d)
      .domain(x.domain())
      .thresholds(x.ticks(d3.timeDay.every(1)));

    const bins = histogram(formattedData);

    // 定义y轴的比例尺
    const y = d3.scaleLinear()
      .domain([0, 30]) // d3.max(bins, d => d.length) + 1， 不应该给一个动态值
      .nice() // 自动调整 y 轴的范围，使其更整洁
      .range([height - margin.top - margin.bottom, 0]);
    
    const bar = svg.selectAll('.bar')
      .data(bins)
      .enter().append('g')
      .attr('class', 'bar')
      .attr('transform', d => `translate(${x(d.x0)},${y(d.length)})`)
      .on('click', (event, d) => {
        if (onClick) {
          onClick(d.x0);
        }
      });

    bar.append('rect')
      .attr('x', 1)
      .attr('width', d => Math.max(x(d.x1) - x(d.x0) - 1, 0))
      .attr('height', d => height - margin.top - margin.bottom - y(d.length))
      .attr('fill', color);

    // 添加柱状图上的文本标签
    bar.append('text')
      .attr('dy', '.75em') // 将文本标签向下移动 0.75 倍字体的高度
      .attr('y', -12) // 将文本标签向上移动 12 像素，使其与柱状图的底部对齐
      .attr('x', d => (x(d.x1) - x(d.x0)) / 2) // 将文本标签水平居中
      .attr('text-anchor', 'middle') // 将文本标签水平居中
      .text(d => d.length); 

    // 添加 X 轴
    svg.append('g')
      .attr('transform', `translate(0,${height - margin.top - margin.bottom})`) 
      .call(d3.axisBottom(x));

    // 添加 Y 轴
    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));

    // 设置passive为false，阻止默认滚轮事件
    svgRef.current?.addEventListener('wheel', handleWheel, { passive: false});
    return () => {
      svgRef.current?.removeEventListener('wheel', handleWheel);
    };

  }, [data, viewRange, color, onClick]);

  const handleWheel = (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? -1 : 1; // deltaY 小于 0 表示向上滚动
    const newRange = [...viewRange];

    // 根据滚轮方向调整范围
    newRange[0].setMonth(newRange[0].getMonth() + zoomFactor);
    newRange[1].setMonth(newRange[1].getMonth() + zoomFactor)

    setViewRange(newRange);
  }

  return (// onWheel={handleWheel}
    <div style={{overflow: "hidden", touchAction: 'none'}}> 
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default Histogram;
