function DendroNetwork() {
  var data,
      options,
      viewerWidth,
      viewerHeight;

  function chart(selection) {

    var svg = selection.append("svg")
      .attr("width", viewerWidth)
      .attr("height", viewerHeight);

    var _dendroDimsNodesOnly, 
        _dendroDimsFull;
    // compute width of text based on all texts
    var getDendroDims = function() {
      var tree = d3.cluster();
      var inner = svg.append("g").classed("inner", true);

      var root = d3.hierarchy(data);
      tree(root);

      var ymax = d3.max(root.descendants(), function(d) { return d.data.y; });
      var ymin = d3.min(root.descendants(), function(d) { return d.data.y; });

      if (options.treeOrientation == "horizontal") {
        fxinv = d3.scaleLinear().domain([ymin, ymax]).range([0, width]);
        fx = d3.scaleLinear().domain([ymax, ymin]).range([0, width]);
      } else {
        fxinv = d3.scaleLinear().domain([ymin, ymax]).range([0, height]);
        fx = d3.scaleLinear().domain([ymax, ymin]).range([0, height]);
      }

      // draw nodes
      var node = inner.selectAll(".node")
        .data(root.descendants())
        .enter().append("g")
        .attr("class", "node")
        .on("mouseover", mouseover)
        .on("mouseout", mouseout);

      if (options.treeOrientation == "horizontal") {
        node.attr("transform", function(d) { return "translate(" + fx(d.data.y) + "," + d.x + ")"; });
      } else {
        node.attr("transform", function(d) { return "translate(" + d.x + "," + fx(d.data.y) + ")"; });
      }

      // node circles
      node.append("circle")
        .attr("r", 4.5)
        .style("fill", options.nodeColour)
        .style("opacity", options.opacity)
        .style("stroke", options.nodeStroke)
        .style("stroke-width", "1.5px");

      _dendroDimsNodesOnly = inner.node().getBBox();

      // node text
      node.append("text")
        .attr("transform", "rotate(" + options.textRotate + ")")
        .style("font-size", options.fontSize + "px")
        .style("font-family", options.fontFamily)
        .style("opacity", function(d) { return d.data.textOpacity; })
        .style("fill", function(d) { return d.data.textColour; })
        .text(function(d) { return d.data.name; });

      if (options.treeOrientation == "horizontal") {
        node.select("text")
          .attr("dx", function(d) { return d.children ? -8 : 8; })
          .attr("dy", ".31em")
          .attr("text-anchor", function(d) { return d.children ? "end" : "start"; });
      } else {
        node.select("text")
          .attr("x", function(d) { return d.children ? -8 : 8; })
          .attr("dy", ".31em")
          .attr("text-anchor", "start");
      }

      _dendroDimsFull = inner.node().getBBox();
      svg.select(".inner").remove();
      return {
        _dendroDimsNodesOnly: _dendroDimsNodesOnly,
        _dendroDimsFull: _dendroDimsFull
      }
    }

    var _dendroDims = getDendroDims();

    _nodeTextsWidth = _dendroDims._dendroDimsFull.width - _dendroDims._dendroDimsNodesOnly.width;
    _nodeTextsHeight = _dendroDims._dendroDimsFull.height - _dendroDims._dendroDimsNodesOnly.height;

    var svgMargins;
    if (options.treeOrientation == "horizontal") {
      svgMargins = {
        bottom: 5,
        left: 10,
        right: 10,
        top: 5
      }
    } else {
      svgMargins = {
        bottom: 10,
        left: 5,
        right: 0,
        top: 10
      }
    }

    var tree = d3.cluster();

    var s = selection.selectAll("svg")
      .attr("margins", svgMargins)
      .attr("treeOrientation", options.treeOrientation);

    var top = svgMargins.top,
      right = svgMargins.right,
      bottom = svgMargins.bottom,
      left = svgMargins.left;

    var height = viewerHeight - top - bottom - _nodeTextsHeight,
      width = viewerWidth - right - left - _nodeTextsWidth;

    if (options.treeOrientation == "horizontal") {
      tree.size([height, width]);
    } else {
      tree.size([width, height]);
    }

    var zoom = d3.zoom().scaleExtent([0.5, 3]);

    svg.selectAll("*").remove();

    svg = svg
      .append("g").attr("class","zoom-layer")
      .append("g")
      .attr("transform", "translate(" + left + "," + top + ")");

    if (options.zoom) {
       zoom.on("zoom", function() {
        selection.select(".zoom-layer")
          .attr("transform", d3.event.transform);
       });

      selection.select("svg")
         .attr("pointer-events", "all")
         .call(zoom);

     } else {
       zoom.on("zoom", null);
     }

    var root = d3.hierarchy(data);
    tree(root);

    var ymax = d3.max(root.descendants(), function(d) { return d.data.y; });
    var ymin = d3.min(root.descendants(), function(d) { return d.data.y; });

    if (s.attr("treeOrientation") == "horizontal") {
      fxinv = d3.scaleLinear().domain([ymin, ymax]).range([0, width]);
      fx = d3.scaleLinear().domain([ymax, ymin]).range([0, width]);
    } else {
      fxinv = d3.scaleLinear().domain([ymin, ymax]).range([0, height]);
      fx = d3.scaleLinear().domain([ymax, ymin]).range([0, height]);
    }

    // draw links
    var link = svg.selectAll(".link")
      .data(root.links())
      .enter().append("path")
      .style("fill", "none")
      .style("stroke", "#ccc")
      .style("opacity", "0.55")
      .style("stroke-width", "1.5px");

    if (options.linkType == "elbow") {
      if (s.attr("treeOrientation") == "horizontal") {
        link.attr("d", function(d, i) {
          return "M" + fx(d.source.data.y) + "," + d.source.x
            + "V" + d.target.x + "H" + fx(d.target.data.y);
        });
      } else {
        link.attr("d", function(d, i) {
          return "M" + d.source.x + "," + fx(d.source.data.y)
            + "H" + d.target.x + "V" + fx(d.target.data.y);
        });
      }
    } else {
      if (s.attr("treeOrientation") == "horizontal") {
        link.attr("d", function(d, i) {
          return "M" + fx(d.source.data.y) + "," + d.source.x
                + "C" + (fx(d.source.data.y) + fx(d.target.data.y)) / 2 + "," + d.source.x
                + " " + (fx(d.source.data.y) + fx(d.target.data.y)) / 2 + "," + d.target.x
                + " " + fx(d.target.data.y) + "," + d.target.x;
        });
      } else {
        link.attr("d", function(d, i) {
          return "M" + d.source.x + "," + fx(d.source.data.y)
                + "C" + (d.source.x + d.target.x) / 2 + "," + fx(d.source.data.y)
                + " " + (d.source.x + d.target.x) / 2 + "," + fx(d.target.data.y)
                + " " + d.target.x + "," + fx(d.target.data.y);
        });
      }
    }

    // draw nodes
    var node = svg.selectAll(".node")
      .data(root.descendants())
      .enter().append("g")
      .attr("class", "node")
      .on("mouseover", mouseover)
      .on("mouseout", mouseout);

    if (s.attr("treeOrientation") == "horizontal") {
      node.attr("transform", function(d) { return "translate(" + fx(d.data.y) + "," + d.x + ")"; });
    } else {
      node.attr("transform", function(d) { return "translate(" + d.x + "," + fx(d.data.y) + ")"; });
    }

    // node circles
    node.append("circle")
      .attr("r", 4.5)
      .style("fill", options.nodeColour)
      .style("opacity", options.opacity)
      .style("stroke", options.nodeStroke)
      .style("stroke-width", "1.5px");

    // node text
    node.append("text")
      .attr("transform", "rotate(" + options.textRotate + ")")
      .style("font-size", options.fontSize + "px")
      .style("font-family", options.fontFamily)
      .style("opacity", function(d) { return d.data.textOpacity; })
      .style("fill", function(d) { return d.data.textColour; })
      .text(function(d) { return d.data.name; });

    if (s.attr("treeOrientation") == "horizontal") {
      node.select("text")
        .attr("dx", function(d) { return d.children ? -8 : 8; })
        .attr("dy", ".31em")
        .attr("text-anchor", function(d) { return d.children ? "end" : "start"; });
    } else {
      node.select("text")
        .attr("x", function(d) { return d.children ? -8 : 8; })
        .attr("dy", ".31em")
        .attr("text-anchor", "start");
    }

    var _duration = 350;

    // mouseover event handler
    function mouseover() {

      d3.select(this).select("circle")
        .attr("r", 9);

      d3.select(this).select("text")
        .style("stroke-width", ".5px")
        .style("font-size", 25 + "px")
        .style("font-family", options.fontFamily)
        .style("opacity", 1);

      var _dim = d3.select(this).node().getBBox();

      d3.select(this).select("circle")
        .attr("r", 4.5);

      d3.select(this).select("text")
        .style("font-size", options.fontSize + "px")
        .style("font-family", options.fontFamily)
        .style("opacity", options.opacity);

      d3.select(this).select("circle").transition()
        .duration(_duration)
        .attr("x", )
        .attr("r", 9);

      d3.select(this).select("text").transition()
        .duration(_duration)
        .style("stroke-width", ".5px")
        .style("font-size", 25 + "px")
        .style("font-family", options.fontFamily)
        .style("opacity", 1);
    }

    // mouseout event handler
    function mouseout() {
      d3.select(this).select("circle").transition()
        .duration(_duration)
        .attr("r", 4.5);

      d3.select(this).select("text").transition()
        .duration(_duration)
        .style("font-size", options.fontSize + "px")
        .style("font-family", options.fontFamily)
        .style("opacity", options.opacity);
    }
  }

  chart.data = function(v) {
    if (!arguments.length) return data;
    data = v;
    return chart;
  };

  chart.settings = function(v) {
      if (!arguments.length) return options;
      options = v;
      return chart;
  };

  chart.width = function(v) {
    if (!arguments.length) return viewerWidth;
    viewerWidth = v;
    return chart;
  };

  // height getter/setter
  chart.height = function(v) {
    if (!arguments.length) return viewerHeight;
    viewerHeight = v;
    return chart;
  };

  return chart;
}