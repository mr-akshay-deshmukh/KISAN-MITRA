import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

import { LanguageCode } from '../types';

interface DistrictYield {
  name: string;
  lat: number;
  lng: number;
  yieldDensity: number; // 0 to 100
}

const MAHARASHTRA_DATA: DistrictYield[] = [
  { name: 'Nashik', lat: 20.0, lng: 73.8, yieldDensity: 95 },
  { name: 'Pune', lat: 18.5, lng: 73.8, yieldDensity: 80 },
  { name: 'Nagpur', lat: 21.1, lng: 79.0, yieldDensity: 60 },
  { name: 'Aurangabad', lat: 19.8, lng: 75.3, yieldDensity: 75 },
  { name: 'Solapur', lat: 17.6, lng: 75.9, yieldDensity: 85 },
  { name: 'Kolhapur', lat: 16.7, lng: 74.2, yieldDensity: 90 },
  { name: 'Jalgaon', lat: 21.0, lng: 75.5, yieldDensity: 70 },
  { name: 'Latur', lat: 18.4, lng: 76.5, yieldDensity: 65 },
  { name: 'Amravati', lat: 20.9, lng: 77.7, yieldDensity: 55 },
  { name: 'Nanded', lat: 19.1, lng: 77.3, yieldDensity: 60 },
  { name: 'Satara', lat: 17.6, lng: 74.0, yieldDensity: 88 },
  { name: 'Sangli', lat: 16.8, lng: 74.5, yieldDensity: 92 },
  { name: 'Ahmednagar', lat: 19.0, lng: 74.7, yieldDensity: 82 },
  { name: 'Dhule', lat: 20.9, lng: 74.7, yieldDensity: 60 },
  { name: 'Beed', lat: 18.9, lng: 75.7, yieldDensity: 50 },
  { name: 'Yavatmal', lat: 20.4, lng: 78.1, yieldDensity: 45 },
];

interface MaharashtraYieldHeatmapProps {
  className?: string;
  currentLanguage: LanguageCode;
}

export const MaharashtraYieldHeatmap: React.FC<MaharashtraYieldHeatmapProps> = ({ className = '', currentLanguage }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const renderMap = () => {
      const container = containerRef.current;
      if (!container) return;
      
      const width = container.clientWidth;
      const height = 400;

      const svg = d3.select(svgRef.current);
      svg.selectAll("*").remove();

      svg.attr("width", width)
         .attr("height", height)
         .attr("viewBox", [0, 0, width, height].join(" "));

      // Projection specifically for Maharashtra (approximate center and scale)
      const projection = d3.geoMercator()
        .center([76.5, 19.0]) // center of maharashtra
        .scale(width * 2.8)
        .translate([width / 2, height / 2]);

      // Format data into points for the contour density map
      const densityData: {x: number, y: number, weight: number}[] = [];
      
      MAHARASHTRA_DATA.forEach(d => {
        const coords = projection([d.lng, d.lat]);
        if (coords) {
          const count = Math.floor(d.yieldDensity / 5);
          for (let i = 0; i < count; i++) {
            const dx = (Math.random() - 0.5) * 40;
            const dy = (Math.random() - 0.5) * 40;
            densityData.push({
              x: coords[0] + dx,
              y: coords[1] + dy,
              weight: d.yieldDensity
            });
          }
        }
      });

      // Compute the contour density
      const contours = d3.contourDensity<{x: number, y: number, weight: number}>()
        .x(d => d.x)
        .y(d => d.y)
        .size([width, height])
        .bandwidth(30)
        .thresholds(15)
        (densityData);
        
      const heatColor = d3.scaleSequential(d3.interpolateYlGn)
        .domain([0, d3.max(contours, d => d.value) || 1]);

      const g = svg.append("g");

      g.append("g")
        .attr("fill", "none")
        .attr("stroke", "none")
        .attr("stroke-linejoin", "round")
        .selectAll("path")
        .data(contours)
        .enter().append("path")
        .attr("fill", d => heatColor(d.value))
        .attr("opacity", 0.7)
        .attr("d", d3.geoPath());

      const markers = g.append("g").selectAll("g")
        .data(MAHARASHTRA_DATA)
        .enter().append("g")
        .attr("transform", d => {
          const p = projection([d.lng, d.lat]);
          return `translate(${p ? p[0] : 0},${p ? p[1] : 0})`;
        });

      markers.append("circle")
        .attr("r", 4)
        .attr("fill", "#0F1411")
        .attr("stroke", "#C2D66E")
        .attr("stroke-width", 1.5)
        .attr("opacity", 0.8);

      markers.append("text")
        .attr("dy", "-0.5em")
        .attr("text-anchor", "middle")
        .attr("fill", "#E5E9E7")
        .style("font-size", "10px")
        .style("font-family", "sans-serif")
        .style("font-weight", "600")
        .style("pointer-events", "none")
        .text(d => d.name);

      // Tooltip interaction
      // First, ensure we don't duplicate tooltips on resize
      d3.select(container).selectAll(".heatmap-tooltip").remove();
      
      const tooltip = d3.select(container)
        .append("div")
        .attr("class", "heatmap-tooltip")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("background-color", "#0F1411")
        .style("border", "1px solid #2C3631")
        .style("color", "#E5E9E7")
        .style("padding", "6px 10px")
        .style("border-radius", "8px")
        .style("font-size", "11px")
        .style("pointer-events", "none")
        .style("z-index", "10");

      markers.append("circle")
        .attr("r", 15)
        .attr("fill", "transparent")
        .style("cursor", "pointer")
        .on("mouseover", (event, d) => {
          tooltip.style("visibility", "visible")
            .html(`<strong>${d.name}</strong><br/>Yield Density: <span style="color:#C2D66E">${d.yieldDensity}%</span>`);
          d3.select((event.currentTarget as Element).previousElementSibling?.previousElementSibling as Element)
            .transition().duration(200)
            .attr("r", 7)
            .attr("fill", "#C2D66E");
        })
        .on("mousemove", (event) => {
          // get mouse position relative to container
          const [mouseX, mouseY] = d3.pointer(event, container);
          tooltip.style("top", (mouseY - 40) + "px")
                 .style("left", (mouseX + 15) + "px");
        })
        .on("mouseout", (event) => {
          tooltip.style("visibility", "hidden");
          d3.select((event.currentTarget as Element).previousElementSibling?.previousElementSibling as Element)
            .transition().duration(200)
            .attr("r", 4)
            .attr("fill", "#0F1411");
        });
    };

    renderMap();

    window.addEventListener('resize', renderMap);
    return () => {
      window.removeEventListener('resize', renderMap);
      if (containerRef.current) {
        d3.select(containerRef.current).selectAll(".heatmap-tooltip").remove();
      }
    };
  }, []);

  return (
    <div className={`relative w-full rounded-2xl bg-[#121A15] border border-[#2C3631] overflow-hidden ${className}`}>
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <h3 className="text-sm font-bold text-[#E5E9E7] mb-1">
          {currentLanguage === 'mr' ? 'महाराष्ट्र पीक उत्पादन घनता (D3.js)' : 'Maharashtra Yield Density Heatmap'}
        </h3>
        <p className="text-[10px] text-[#8E9B94]">
          {currentLanguage === 'mr' ? 'थेट भौगोलिक डेटा आणि जिल्ह्यानुसार विश्लेषण' : 'Geospatial mapping of district-level crop density'}
        </p>
      </div>
      <div ref={containerRef} className="w-full h-[400px]">
        <svg ref={svgRef} className="w-full h-full"></svg>
      </div>
      
      {/* Legend */}
      <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-[#0F1411]/80 backdrop-blur-sm p-2 rounded-lg border border-[#2C3631]">
        <span className="text-[10px] text-[#8E9B94]">Low</span>
        <div className="w-24 h-2 rounded-full bg-gradient-to-r from-[#ffffe5] via-[#78c679] to-[#004529] opacity-80" />
        <span className="text-[10px] text-[#8E9B94]">High</span>
      </div>
    </div>
  );
};
