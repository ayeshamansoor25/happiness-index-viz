// ─────────────────────────────────────────────
//  World Happiness Index 2015 — main.js
//  DSC327 Terminal Project
// ─────────────────────────────────────────────

const FACTORS = [
  "Economy (GDP per Capita)",
  "Family",
  "Health (Life Expectancy)",
  "Freedom",
  "Trust (Government Corruption)",
  "Generosity",
];

const FACTOR_LABELS = {
  "Economy (GDP per Capita)": "GDP per Capita",
  "Family": "Family",
  "Health (Life Expectancy)": "Health / Life Expectancy",
  "Freedom": "Freedom",
  "Trust (Government Corruption)": "Trust in Government",
  "Generosity": "Generosity",
  "Dystopia Residual": "Dystopia Residual",
};

const REGION_COLORS = [
  "#F8C062","#595082","#416444","#a89fd4",
  "#d4c98a","#6b5ea8","#2C7A4B","#c4a84a","#7a6fb5","#88b08a",
];

const tooltip = d3.select("#tooltip");

// ── Load Data ─────────────────────────────────
d3.csv("data/2015.csv", d3.autoType).then(rawData => {

  const data = rawData;

  const regions = [...new Set(data.map(d => d.Region))].sort();
  const regionColor = d3.scaleOrdinal().domain(regions).range(REGION_COLORS);

  // Header stat
  d3.select("#stat-top").text(data[0].Country);

  // Populate region filter
  const regionSel = d3.select("#region-filter");
  regions.forEach(r => regionSel.append("option").attr("value", r).text(r));

  // ── State ─────────────────────────────────
  let selectedRegion = "All";
  let selectedFactor = "Economy (GDP per Capita)";

  function filteredData() {
    return selectedRegion === "All"
      ? data
      : data.filter(d => d.Region === selectedRegion);
  }

  // Factor color scale: light to vivid green based on factor value
  function makeFactorColorScale(dataset, factor) {
    return d3.scaleSequential()
      .domain([0, d3.max(dataset, d => +d[factor])])
      .interpolator(d3.interpolate("#2C263F", "#F8C062"));
  }

  // ── Initial draw ──────────────────────────
  drawBar(data, makeFactorColorScale(data, selectedFactor), selectedFactor);
  drawScatter(data, regionColor, selectedFactor);
  drawDonut(data);
  drawStrip(data, makeFactorColorScale(data, selectedFactor), selectedFactor);

  // ── Filter listeners ──────────────────────
  regionSel.on("change", function () {
    selectedRegion = this.value;
    const fd = filteredData();
    const fcs = makeFactorColorScale(fd, selectedFactor);
    drawBar(fd, fcs, selectedFactor);
    drawScatter(fd, regionColor, selectedFactor);
    drawStrip(fd, fcs, selectedFactor);
  });

  d3.select("#factor-select").on("change", function () {
    selectedFactor = this.value;
    const fd = filteredData();
    const fcs = makeFactorColorScale(fd, selectedFactor);
    drawBar(fd, fcs, selectedFactor);
    drawScatter(fd, regionColor, selectedFactor);
    drawStrip(fd, fcs, selectedFactor);
  });
});

// ── Tooltip helpers ───────────────────────────
function showTooltip(event, html) {
  tooltip.classed("hidden", false).html(html);
  moveTooltip(event);
}
function moveTooltip(event) {
  const x = event.clientX, y = event.clientY;
  const tw = 240, th = 150;
  const left = x + 15 + tw > window.innerWidth ? x - tw - 10 : x + 15;
  const top  = y + 15 + th > window.innerHeight ? y - th - 10 : y + 15;
  tooltip.style("left", left + "px").style("top", top + "px");
}
function hideTooltip() { tooltip.classed("hidden", true); }

function countryTip(d, factor) {
  return `<strong>${d.Country}</strong>
    <span>Region:</span> ${d.Region}<br>
    <span>Rank:</span> #${d["Happiness Rank"]}<br>
    <span>Score:</span> ${(+d["Happiness Score"]).toFixed(3)}<br>
    ${factor ? `<span>${FACTOR_LABELS[factor]}:</span> ${(+d[factor]).toFixed(3)}` : ""}`;
}

// ─────────────────────────────────────────────
//  CHART 1 — Horizontal Bar Chart (Top 20)
//  Bars colored by selected factor value
// ─────────────────────────────────────────────
function drawBar(data, factorColorScale, factor) {
  const container = document.getElementById("bar-chart");
  container.innerHTML = "";

  const top20 = data.slice()
    .sort((a,b) => b["Happiness Score"] - a["Happiness Score"])
    .slice(0, 20);

  const margin = { top: 10, right: 200, bottom: 30, left: 140 };
  const width  = container.clientWidth || 900;
  const height = top20.length * 32 + margin.top + margin.bottom;

  const svg = d3.select("#bar-chart")
    .append("svg").attr("width","100%")
    .attr("viewBox", `0 0 ${width} ${height}`);

  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
  const W = width - margin.left - margin.right;
  const H = height - margin.top - margin.bottom;

  const x = d3.scaleLinear().domain([0, 8]).range([0, W]);
  const y = d3.scaleBand().domain(top20.map(d => d.Country)).range([0, H]).padding(0.25);

  // Grid
  g.append("g").attr("class","grid")
    .call(d3.axisBottom(x).ticks(6).tickSize(H).tickFormat(""))
    .call(g => g.select(".domain").remove());

  // Axes
  g.append("g").attr("class","axis").attr("transform",`translate(0,${H})`)
    .call(d3.axisBottom(x).ticks(6).tickFormat(d => d.toFixed(1)));
  g.append("g").attr("class","axis").call(d3.axisLeft(y).tickSize(0))
    .call(g => g.select(".domain").remove())
    .selectAll("text").attr("fill","#F8C062").style("font-size","12px");

  // Bars — colored by factor value
  g.selectAll(".bar")
    .data(top20)
    .join("rect")
    .attr("class","bar")
    .attr("x", 0).attr("y", d => y(d.Country))
    .attr("height", y.bandwidth()).attr("rx", 5)
    .attr("fill", d => factorColorScale(+d[factor]))
    .attr("width", 0)
    .on("mouseover", (event, d) => showTooltip(event, countryTip(d, factor)))
    .on("mousemove", moveTooltip)
    .on("mouseout", hideTooltip)
    .transition().duration(600).delay((d,i) => i * 25)
    .attr("width", d => x(+d["Happiness Score"]));

  // Score labels
  g.selectAll(".bar-label")
    .data(top20)
    .join("text").attr("class","bar-label")
    .attr("x", d => x(+d["Happiness Score"]) + 6)
    .attr("y", d => y(d.Country) + y.bandwidth() / 2 + 4)
    .attr("fill","#F8C062").style("font-size","11px")
    .text(d => (+d["Happiness Score"]).toFixed(3))
    .attr("opacity", 0)
    .transition().duration(600).delay((d,i) => i*25 + 300)
    .attr("opacity", 1);

  // Color legend (gradient for factor)
  const legendW = 120, legendH = 10;
  const legG = svg.append("g")
    .attr("transform", `translate(${width - margin.right + 20}, ${margin.top + 10})`);

  const defs = svg.append("defs");
  const gradId = "bar-grad";
  const grad = defs.append("linearGradient").attr("id", gradId);
  grad.append("stop").attr("offset","0%").attr("stop-color","#2C263F");
  grad.append("stop").attr("offset","100%").attr("stop-color","#F8C062");

  legG.append("rect").attr("width", legendW).attr("height", legendH).attr("rx", 3)
    .attr("fill", `url(#${gradId})`);
  legG.append("text").attr("x", 0).attr("y", legendH + 13)
    .attr("fill","#a89fd4").style("font-size","9px").text("Low");
  legG.append("text").attr("x", legendW).attr("y", legendH + 13)
    .attr("fill","#a89fd4").style("font-size","9px").attr("text-anchor","end").text("High");
  legG.append("text").attr("x", legendW / 2).attr("y", -5)
    .attr("fill","#F8C062").style("font-size","10px").attr("text-anchor","middle")
    .text(FACTOR_LABELS[factor]);
}

// ─────────────────────────────────────────────
//  CHART 2 — Scatter Plot (colored by region)
// ─────────────────────────────────────────────
function drawScatter(data, regionColor, factor) {
  const container = document.getElementById("scatter-chart");
  container.innerHTML = "";

  const margin = { top: 20, right: 20, bottom: 50, left: 55 };
  const width  = container.clientWidth || 560;
  const height = 380;

  const svg = d3.select("#scatter-chart")
    .append("svg").attr("width","100%")
    .attr("viewBox", `0 0 ${width} ${height}`);

  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
  const W = width - margin.left - margin.right;
  const H = height - margin.top - margin.bottom;

  const x = d3.scaleLinear()
    .domain([0, d3.max(data, d => +d[factor]) * 1.1]).range([0, W]);
  const y = d3.scaleLinear().domain([0, 8.5]).range([H, 0]);

  // Grid
  g.append("g").attr("class","grid")
    .call(d3.axisLeft(y).ticks(6).tickSize(-W).tickFormat(""))
    .call(g => g.select(".domain").remove());

  // Axes
  g.append("g").attr("class","axis").attr("transform",`translate(0,${H})`)
    .call(d3.axisBottom(x).ticks(5));
  g.append("g").attr("class","axis").call(d3.axisLeft(y).ticks(6));

  // Axis labels
  g.append("text").attr("x", W/2).attr("y", H + 42)
    .attr("fill","#a89fd4").style("font-size","11px").attr("text-anchor","middle")
    .text(FACTOR_LABELS[factor] || factor);
  g.append("text").attr("transform","rotate(-90)")
    .attr("x", -H/2).attr("y", -42)
    .attr("fill","#a89fd4").style("font-size","11px").attr("text-anchor","middle")
    .text("Happiness Score");

  // Dots colored by region
  g.selectAll(".dot")
    .data(data)
    .join("circle").attr("class","dot")
    .attr("cx", d => x(+d[factor]))
    .attr("cy", d => y(+d["Happiness Score"]))
    .attr("r", 0)
    .attr("fill", d => regionColor(d.Region))
    .attr("stroke","#457247").attr("opacity", 0.85)
    .on("mouseover", (event, d) => showTooltip(event, countryTip(d, factor)))
    .on("mousemove", moveTooltip)
    .on("mouseout", hideTooltip)
    .transition().duration(500).delay((d,i) => i * 4)
    .attr("r", 5);

  // Trend line
  const xVals = data.map(d => +d[factor]);
  const yVals = data.map(d => +d["Happiness Score"]);
  const xMean = d3.mean(xVals), yMean = d3.mean(yVals);
  const slope = d3.sum(xVals.map((xi,i) => (xi-xMean)*(yVals[i]-yMean))) /
                d3.sum(xVals.map(xi => (xi-xMean)**2));
  const intercept = yMean - slope * xMean;
  const x0 = d3.min(xVals), x1 = d3.max(xVals);

  g.append("line")
    .attr("x1", x(x0)).attr("y1", y(slope*x0+intercept))
    .attr("x2", x(x1)).attr("y2", y(slope*x1+intercept))
    .attr("stroke","#F8C062").attr("stroke-width",1.5)
    .attr("stroke-dasharray","6 3").attr("opacity",0.6);
}

// ─────────────────────────────────────────────
//  CHART 3 — Donut Chart
// ─────────────────────────────────────────────
function drawDonut(data) {
  const container = document.getElementById("donut-chart");
  container.innerHTML = "";

  const allFactors = [...FACTORS, "Dystopia Residual"];
  const avgs = allFactors.map(f => ({
    factor: f,
    value: d3.mean(data, d => +d[f]) || 0,
  }));

  const DONUT_COLORS = ["#F8C062","#595082","#416444","#a89fd4","#d4c98a","#6b5ea8","#2C263F"];
  const colorD = d3.scaleOrdinal().domain(allFactors).range(DONUT_COLORS);

  const width  = container.clientWidth || 420;
  const height = 340;
  const radius = Math.min(width, height) / 2 - 30;

  const svg = d3.select("#donut-chart")
    .append("svg").attr("width","100%").attr("viewBox",`0 0 ${width} ${height}`)
    .append("g").attr("transform",`translate(${width/2},${height/2})`);

  const pie = d3.pie().value(d => d.value).sort(null);
  const arc = d3.arc().innerRadius(radius * 0.55).outerRadius(radius);
  const arcHover = d3.arc().innerRadius(radius * 0.55).outerRadius(radius + 10);

  const arcs = svg.selectAll(".arc").data(pie(avgs)).join("g").attr("class","arc");

  arcs.append("path")
    .attr("fill", d => colorD(d.data.factor))
    .attr("stroke","#457247").attr("stroke-width", 2)
    .attr("d", arc)
    .on("mouseover", function(event, d) {
      d3.select(this).transition().duration(150).attr("d", arcHover);
      showTooltip(event,
        `<strong>${FACTOR_LABELS[d.data.factor]}</strong>
        <span>Avg contribution:</span> ${d.data.value.toFixed(3)}<br>
        <span>Share:</span> ${(d.data.value / d3.sum(avgs, a=>a.value) * 100).toFixed(1)}%`
      );
    })
    .on("mousemove", moveTooltip)
    .on("mouseout", function() {
      d3.select(this).transition().duration(150).attr("d", arc);
      hideTooltip();
    });

  svg.append("text").attr("text-anchor","middle").attr("dy","-0.3em")
    .attr("fill","#F8C062").style("font-size","13px").text("Global");
  svg.append("text").attr("text-anchor","middle").attr("dy","1.1em")
    .attr("fill","#F8C062").style("font-size","13px").text("Average");

  // Legend
  const legX = -width/2 + 10;
  const legY = height/2 - 20 - avgs.length * 18;
  const legend = svg.append("g").attr("transform",`translate(${legX}, ${legY})`);
  avgs.forEach((d, i) => {
    const lg = legend.append("g").attr("transform",`translate(0,${i*18})`);
    lg.append("rect").attr("width",10).attr("height",10).attr("rx",2).attr("fill", colorD(d.factor));
    lg.append("text").attr("x",14).attr("y",9)
      .attr("fill","#a89fd4").style("font-size","10px")
      .text(FACTOR_LABELS[d.factor]);
  });
}

// ─────────────────────────────────────────────
//  CHART 4 — Strip Plot
//  Dots colored by selected factor value
// ─────────────────────────────────────────────
function drawStrip(data, factorColorScale, factor) {
  const container = document.getElementById("strip-chart");
  container.innerHTML = "";

  const regions = [...new Set(data.map(d => d.Region))].sort();

  const margin = { top: 20, right: 30, bottom: 60, left: 200 };
  const width  = container.clientWidth || 1000;
  const rowH   = 44;
  const height = regions.length * rowH + margin.top + margin.bottom;

  const svg = d3.select("#strip-chart")
    .append("svg").attr("width","100%").attr("viewBox",`0 0 ${width} ${height}`);

  const g = svg.append("g").attr("transform",`translate(${margin.left},${margin.top})`);
  const W = width - margin.left - margin.right;
  const H = height - margin.top - margin.bottom;

  const x = d3.scaleLinear().domain([0, 8.5]).range([0, W]);
  const y = d3.scaleBand().domain(regions).range([0, H]).padding(0.2);

  // Grid
  g.append("g").attr("class","grid")
    .call(d3.axisBottom(x).ticks(8).tickSize(H).tickFormat(""))
    .call(g => g.select(".domain").remove());

  // Axes
  g.append("g").attr("class","axis").attr("transform",`translate(0,${H})`)
    .call(d3.axisBottom(x).ticks(8).tickFormat(d => d.toFixed(1)));
  g.append("g").attr("class","axis")
    .call(d3.axisLeft(y).tickSize(0))
    .call(g => g.select(".domain").remove())
    .selectAll("text").attr("fill","#F8C062").style("font-size","11.5px");

  // Median line per region
  regions.forEach(region => {
    const rd = data.filter(d => d.Region === region);
    const med = d3.median(rd, d => +d["Happiness Score"]);
    g.append("line")
      .attr("x1", x(med)).attr("x2", x(med))
      .attr("y1", y(region)).attr("y2", y(region) + y.bandwidth())
      .attr("stroke","#F8C062").attr("stroke-width", 2).attr("opacity", 0.45);
  });

  // Dots — colored by factor value
  const jitterScale = y.bandwidth() * 0.7;
  g.selectAll(".strip-dot")
    .data(data)
    .join("circle").attr("class","strip-dot")
    .attr("cx", d => x(+d["Happiness Score"]))
    .attr("cy", d => y(d.Region) + y.bandwidth()/2 + (Math.random() - 0.5) * jitterScale)
    .attr("r", 0)
    .attr("fill", d => factorColorScale(+d[factor]))
    .attr("stroke","#457247").attr("stroke-width",0.5)
    .attr("opacity", 0.85)
    .on("mouseover", (event, d) => showTooltip(event, countryTip(d, factor)))
    .on("mousemove", moveTooltip)
    .on("mouseout", hideTooltip)
    .transition().duration(400).delay((d,i) => i * 3)
    .attr("r", 5);

  // X axis label
  g.append("text").attr("x", W/2).attr("y", H + 48)
    .attr("fill","#a89fd4").style("font-size","11px").attr("text-anchor","middle")
    .text("Happiness Score");
}