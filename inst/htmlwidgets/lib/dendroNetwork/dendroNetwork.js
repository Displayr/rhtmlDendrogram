function DendroNetwork() {
  'use strict'
  var data,
      options,
      viewerWidth,
      viewerHeight;

  function chart(selection) {


    function wrap_new(text, width) {
      var separators = {" ": 1};
      var lineNumbers = [];
      text.each(function() {
          var text = d3.select(this),
              chars = text.text().split("").reverse(),
              c,
              nextchar,
              sep,
              newline = [],
              lineTemp = [],
              lineNumber = 0,
              lineHeight = 1.1, // ems
              x = text.attr("x"),
              y = text.attr("y"),
              dy = parseFloat(text.attr("dy")),
              tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
          while (c = chars.pop()) {
              // remove leading space
              if (lineTemp.length === 0 && c === " ") {
                continue;
              }
              lineTemp.push(c);
              tspan.text(lineTemp.join(""));
              if (tspan.node().getComputedTextLength() > width) {

              // if no separator detected before c, wait until there is one
              // otherwise, wrap texts
                if (sep === undefined) {
                  if (c in separators) {
                    if (c === " ") {
                      lineTemp.pop();
                    }
                    // make new line
                    sep = undefined;
                    tspan.text(lineTemp.join(""));
                    tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text("");
                    lineTemp = [];
                    newline = [];
                  }
                } else {
                  // pop out chars until reaching sep
                  if (c in separators) {
                    newline.push(lineTemp.pop());
                  }
                  nextchar = lineTemp.pop();
                  while (nextchar !== sep && lineTemp.length > 0) {
                    newline.push(nextchar);
                    nextchar = lineTemp.pop();
                  }
                  newline.reverse();
                  while (nextchar = newline.pop()) {
                    chars.push(nextchar);
                  }

                  if (sep !== " ") {
                    lineTemp.push(sep);
                  }
                  // make new line
                  sep = undefined;
                  tspan.text(lineTemp.join(""));
                  tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text("");
                  lineTemp = [];
                  newline = [];
                }
              } else {
                  if (c in separators) {
                    sep = c;
                  }
              }
          }
          lineNumbers.push(lineNumber + 1);
      });
    }

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

      // draw nodes
      var node = inner.selectAll(".node")
        .data(root.descendants())
        .enter().append("g")
        .attr("class", "node")
        .on("mouseover", mouseover)
        .on("mouseout", mouseout);

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

    // width and height of the node texts
    var _nodeTextsWidth = _dendroDims._dendroDimsFull.width - _dendroDims._dendroDimsNodesOnly.width;
    var _nodeTextsHeight = _dendroDims._dendroDimsFull.height - _dendroDims._dendroDimsNodesOnly.height;

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

    var titleWidth = 0,
        titleHeight = 0,
        subtitleWidth = 0,
        subtitleHeight = 0,
        footerWidth = 0,
        footerHeight = 0;

    if (options.title) {
      svg.append("g")
          .attr("class", "gtitle")
          .append("text")
          .attr("x", 0)
          .attr("y", 0)
          .attr("dy", 0)
          .text(options.title)
          .style("font-family", options.titleFontFamily)
          .style("font-size", options.titleFontSize)
          .style("fill", options.titleFontColor)
          .style("text-anchor", "middle")
          .call(wrap_new, viewerWidth - 10);

      var _titleDims = d3.select(".gtitle").node().getBBox();
      titleWidth = _titleDims.width;
      titleHeight = _titleDims.height;
    }

    if (options.subtitle) {
      svg.append("g")
          .attr("class", "gsubtitle")
          .append("text")
          .attr("x", 0)
          .attr("y", 0)
          .attr("dy", 0)
          .text(options.subtitle)
          .style("font-family", options.subtitleFontFamily)
          .style("font-size", options.subtitleFontSize)
          .style("fill", options.subtitleFontColor)
          .style("text-anchor", "middle")
          .call(wrap_new, viewerWidth - 10);

      var _subtitleDims = d3.select(".gsubtitle").node().getBBox();
      subtitleWidth = _subtitleDims.width;
      subtitleHeight = _subtitleDims.height;
    }

    if (options.footer) {
      svg.append("g")
          .attr("class", "gfooter")
          .append("text")
          .attr("x", 0)
          .attr("y", 0)
          .attr("dy", 0)
          .text(options.footer)
          .style("font-family", options.footerFontFamily)
          .style("font-size", options.footerFontSize)
          .style("fill", options.footerFontColor)
          .style("text-anchor", "start")
          .call(wrap_new, viewerWidth - 10);

      var _footerDims = d3.select(".gfooter").node().getBBox();
      footerWidth = _footerDims.width;
      footerHeight = _footerDims.height;
    }

    var tree = d3.cluster();

    var s = selection.selectAll("svg")
      .attr("margins", svgMargins)
      .attr("treeOrientation", options.treeOrientation);

    var top = svgMargins.top + titleHeight + subtitleHeight,
      right = svgMargins.right,
      bottom = svgMargins.bottom,
      left = svgMargins.left;

    var height = viewerHeight - top - bottom - _nodeTextsHeight - footerHeight,
      width = viewerWidth - right - left - _nodeTextsWidth;

    if (options.treeOrientation == "horizontal") {
      tree.size([height, width]);
    } else {
      tree.size([width, height]);
    }

    var zoom = d3.zoom().scaleExtent([0.5, 3]);

    svg.selectAll("*").remove();
    d3.select('body').select('.d3-tip').remove();

    var mainsvg = svg.attr("class","mainsvg");
    svg = svg
      .append("g").attr("class","zoom-layer")
      .append("g")
      .attr("transform", "translate(" + left + "," + top + ")");

    if (options.title) {
      mainsvg.append("g")
          .attr("class", "gtitle")
          .append("text")
          .attr("x", 0)
          .attr("y", 0)
          .attr("dy", 0)
          .text(options.title)
          .style("font-family", options.titleFontFamily)
          .style("font-size", options.titleFontSize)
          .style("fill", options.titleFontColor)
          .style("text-anchor", "middle")
          .call(wrap_new, viewerWidth - 10);

      d3.select(".gtitle").attr("transform", "translate(" + viewerWidth/2 + "," + options.titleFontSize + ")");
    }

    if (options.subtitle) {
      mainsvg.append("g")
          .attr("class", "gsubtitle")
          .append("text")
          .attr("x", 0)
          .attr("y", 0)
          .attr("dy", 0)
          .text(options.subtitle)
          .style("font-family", options.subtitleFontFamily)
          .style("font-size", options.subtitleFontSize)
          .style("fill", options.subtitleFontColor)
          .style("text-anchor", "middle")
          .call(wrap_new, viewerWidth - 10);

      d3.select(".gsubtitle").attr("transform", "translate(" + viewerWidth/2 + "," + (titleHeight + options.subtitleFontSize) + ")");
    }

    if (options.footer) {
      mainsvg.append("g")
          .attr("class", "gfooter")
          .append("text")
          .attr("x", 0)
          .attr("y", 0)
          .attr("dy", 0)
          .text(options.footer)
          .style("font-family", options.footerFontFamily)
          .style("font-size", options.footerFontSize)
          .style("fill", options.footerFontColor)
          .style("text-anchor", "start")
          .call(wrap_new, viewerWidth - 10);

      d3.select(".gfooter").attr("transform", "translate(" + 0 + "," + (viewerHeight - footerHeight + options.footerFontSize/2) + ")");

    }

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

    var fxinv, fx;
    if (options.treeOrientation == "horizontal") {
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
      if (options.treeOrientation == "horizontal") {
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
      if (options.treeOrientation == "horizontal") {
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
      .attr("class", "nodeText")
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
        .attr("dx", function(d) { return d.children ? -8 : 8; })
        .attr("dy", ".31em")
        .attr("text-anchor", "start");
    }


    function getTransformation(transform) {
      // Create a dummy g for calculation purposes only. This will never
      // be appended to the DOM and will be discarded once this function 
      // returns.
      var g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      
      // Set the transform attribute to the provided string value.
      g.setAttributeNS(null, "transform", transform);
      
      // consolidate the SVGTransformList containing all transformations
      // to a single SVGTransform of type SVG_TRANSFORM_MATRIX and get
      // its SVGMatrix. 
      var matrix = g.transform.baseVal.consolidate().matrix;
      
      // Below calculations are taken and adapted from the private function
      // transform/decompose.js of D3's module d3-interpolate.
      var {a, b, c, d, e, f} = matrix;   // ES6, if this doesn't work, use below assignment
      // var a=matrix.a, b=matrix.b, c=matrix.c, d=matrix.d, e=matrix.e, f=matrix.f; // ES5
      var scaleX, scaleY, skewX;
      if (scaleX = Math.sqrt(a * a + b * b)) a /= scaleX, b /= scaleX;
      if (skewX = a * c + b * d) c -= a * skewX, d -= b * skewX;
      if (scaleY = Math.sqrt(c * c + d * d)) c /= scaleY, d /= scaleY, skewX /= scaleY;
      if (a * d < b * c) a = -a, b = -b, skewX = -skewX, scaleX = -scaleX;
      return {
        translateX: e,
        translateY: f,
        rotate: Math.atan2(b, a) * 180 / Math.PI,
        skewX: Math.atan(skewX) * 180 / Math.PI,
        scaleX: scaleX,
        scaleY: scaleY
      };
    }

    node.each(function(d) {
      d.nodeTransform = getTransformation(d3.select(this).attr("transform"));

      var _dim0 = d3.select(this).node().getBBox();
      d._width0 = _dim0.width;
      d._height0 = _dim0.height;

      d3.select(this).select("circle")
        .attr("r", 9);

      d3.select(this).select("text")
        .style("stroke-width", ".5px")
        .style("font-size", 25 + "px")
        .style("font-family", options.fontFamily)
        .style("opacity", 1);

      var _dim = d3.select(this).node().getBBox();
      var _excessWidth = d.nodeTransform.translateX + _dim.width - viewerWidth; 
      var _excessHeight = d.nodeTransform.translateY + _dim.height - viewerHeight; 
      d._excessWidth = _excessWidth;
      d._excessHeight = _excessHeight;
      d._width = _dim.width;
      d._height = _dim.height;

      d3.select(this).select("circle")
        .attr("r", 4.5);

      d3.select(this).select("text")
        .style("font-size", options.fontSize + "px")
        .style("font-family", options.fontFamily)
        .style("opacity", options.opacity);
    });

    var realFormatter = d3.format(",.1f");
    var intFormatter = d3.format(",d");

    // tooltips
    var tip = {};
    var tipTriangle;
    if (options.colnames && options.treeOrientation == "horizontal") {
      var tipMax = Number.MIN_VALUE,
          tipMin = Number.MAX_VALUE;
      node.each(function(d) {
        if (d.data.tips) {
          var ma = d3.max(d.data.tips);
          var mi = d3.min(d.data.tips);
          tipMax = ma > tipMax ? ma : tipMax;
          tipMin = mi < tipMin ? mi : tipMin;
        }
      });

      tip = d3.tip()
              .attr('class', 'd3-tip')
              .html(function(d) {return d.tooltipHTML; });

      tipTriangle = selection
                      .append("div")
                      .attr("id", "littleTriangle")
                      .style("visibility", "hidden");

      var maxBarLength = 50;
      var tipBarScale = d3.scaleLinear().domain([tipMin/2, tipMax]).range([0, maxBarLength])
      node.each(function(d) {
        if (d.data.tips) {
          var ft_s = options.tooltipsFontSize;
          var ft_f = options.tooltipsFontFamily;
          var t = "";
          var nval = d.data.tips.length;
          t = t + "<div class='tipTableContainer' style='white-space:nowrap;" + "font-size:" + ft_s + "px;font-family:" + ft_f + ";'>";
          t = t + "Name: " + d.data.name + "<br>" + "<table class='tipTable'>";
          for (var i = 0; i < nval; i++) {
              t = t + "<tr>";
              t = t + "<td class='tipDClassification' style='white-space:nowrap;" + "font-size:" + ft_s + "px;font-family:" + ft_f + ";'>" + options.colnames[i] + "</td>";
              t = t + "<td class='tipDClassification' style='white-space:nowrap;'>";
              t = t + "<div style='width:" + tipBarScale(d.data.tips[i]) + "px;height:8px;background-color:steelblue'></div>" + "</td>";
              t = t + "</tr>";
          }
          t = t + "</table></div>";
          d.tooltipHTML = t;
        }
      });

      node.selectAll("text")
      .on("mouseover", function(d) {
        var thisTip;
        thisTip = tip.offset([-20,0]).show(d);
        var tipHeight = parseFloat(thisTip.style("height"));
        var tipWidth = parseFloat(thisTip.style("width"));
        var clientRect = this.getBoundingClientRect();
        // southward and northward tip top y position
        var tipSouth = clientRect.bottom + 5;
        var tipNorth = clientRect.top - 5;
        var tipEast = clientRect.right + 5;

        if (tipNorth - tipHeight >= 0) {
            // northward tip
          thisTip = thisTip.direction("n").offset([-20,0]).show(d);
          d3.select("#littleTriangle")
          .attr("class", "northTip")
          .style("visibility", "visible")
          .style("top", (clientRect.top - 27.5) + "px")
          .style("left", (clientRect.left + clientRect.width/2 - 5) + "px");

          if (parseFloat(thisTip.style("left")) < 0) {
              thisTip.style("left", "5px");
          } else if (parseFloat(thisTip.style("left")) + tipWidth > viewerWidth) {
              thisTip.style("left", (viewerWidth - 5 - tipWidth) + "px");
          }

        } else if (viewerHeight - tipSouth >= tipHeight) {

          thisTip = thisTip.direction("s").offset([20,0]).show(d);
          d3.select("#littleTriangle")
          .attr("class", "southTip")
          .style("visibility", "visible")
          .style("top", (clientRect.bottom + 7.5) + "px")
          .style("left", (clientRect.left + clientRect.width/2 - 5) + "px");

          if (parseFloat(thisTip.style("left")) < 0) {
              thisTip.style("left", "5px");
          } else if (parseFloat(thisTip.style("left")) + tipWidth > viewerWidth) {
              thisTip.style("left", (viewerWidth - 5 - tipWidth) + "px");
          }

        } else if (tipEast >= viewerWidth * 0.5) {

          thisTip = thisTip.direction("w").offset([0, -10]).show(d);
          d3.select("#littleTriangle")
          .attr("class", "westTip")
          .style("visibility", "visible")
          .style("top", (clientRect.top + clientRect.height/2 - 5) + "px")
          .style("left", (clientRect.left - 12.5) + "px");

          if (parseFloat(thisTip.style("top")) < 0) {
              thisTip.style("top", "5px");
          } else if (parseFloat(thisTip.style("top")) + tipHeight > viewerHeight) {
              thisTip.style("top", (viewerHeight - tipHeight - 5) + "px");
          }

        } else {
          thisTip = thisTip.direction("e").offset([0, 10]).show(d);
          d3.select("#littleTriangle")
          .attr("class", "eastTip")
          .style("visibility", "visible")
          .style("top", (clientRect.top + clientRect.height/2 - 5) + "px")
          .style("left", (clientRect.right + 2.5) + "px");

          if (parseFloat(thisTip.style("top")) < 0) {
              thisTip.style("top", "5px");
          } else if (parseFloat(thisTip.style("top")) + tipHeight > viewerHeight) {
              thisTip.style("top", (viewerHeight - tipHeight - 5) + "px");
          }
        }
      })
      .on("mouseout", function(d) {
        tip.hide(d);
        d3.select("#littleTriangle").style("visibility", "hidden");
      });

      svg.call(tip);
    }

    var _duration = 300;

    // mouseover event handler
    function mouseover(d) {

      // if (options.colnames) {
      //   tip.show(d);
      // }

      if (options.treeOrientation == "horizontal") {
        if (d._excessWidth > 0) {
          d3.select(this)
            .transition("2")
            .duration(_duration)
            .attr("transform", function(d) {
              return "translate(" + (d.nodeTransform.translateX - d._excessWidth) + "," + d.nodeTransform.translateY + ")";
            });

          d3.select(this).select("circle")
            .transition("1")
            .duration(_duration)
            .attr("cx", -4)
            .attr("r", 9);

          d3.select(this).select("text")
            .transition("1")
            .duration(_duration)
            .attr("dx", function(d) { return d.children ? -8 : 8; })
            .attr("dy", ".31em")
            .style("stroke-width", ".5px")
            .style("font-size", 25 + "px")
            .style("font-family", options.fontFamily)
            .style("opacity", 1);

        } else {

          d3.select(this).select("circle")
            .transition("1")
            .duration(_duration)
            .attr("r", 9);

          d3.select(this).select("text")
            .transition("1")
            .duration(_duration)
            .attr("dx", function(d) { return d.children ? -12 : 12; })
            .attr("dy", ".31em")
            .style("stroke-width", ".5px")
            .style("font-size", 25 + "px")
            .style("font-family", options.fontFamily)
            .style("opacity", 1);
        }
      } else {
        if (d._excessHeight > 0) {
          d3.select(this)
            .transition("2")
            .duration(_duration)
            .attr("transform", function(d) {
              return "translate(" + (d.nodeTransform.translateX - Math.tan((90 - options.textRotate) * Math.PI / 180)*d._excessHeight) 
                + "," + (d.nodeTransform.translateY - d._excessHeight) + ")";
            });
          d3.select(this).select("circle")
            .transition("1")
            .duration(_duration)
            .attr("cy", -4)
            .attr("r", 9);
          d3.select(this).select("text")
            .transition("1")
            .duration(_duration)
            .attr("dx", function(d) { return d.children ? -8 : 8; })
            .attr("dy", ".31em")
            .style("stroke-width", ".5px")
            .style("font-size", 25 + "px")
            .style("font-family", options.fontFamily)
            .style("opacity", 1);

        } else {
          d3.select(this).select("circle")
            .transition("1")
            .duration(_duration)
            .attr("r", 9);
          d3.select(this).select("text")
            .transition("1")
            .duration(_duration)
            .attr("dx", function(d) { return d.children ? -12 : 12; })
            .attr("dy", ".31em")
            .style("stroke-width", ".5px")
            .style("font-size", 25 + "px")
            .style("font-family", options.fontFamily)
            .style("opacity", 1);
        }
      }


    }

    // mouseout event handler
    function mouseout(d) {

      // if (options.colnames) {
      //   tip.hide(d);
      // }

      d3.select(this)
        .transition("2")
        .duration(_duration)
        .attr("transform", function(d) {
          return "translate(" + d.nodeTransform.translateX + "," + d.nodeTransform.translateY + ")";
        });

      d3.select(this).select("circle")
        .transition("1")
        .duration(_duration)
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", 4.5);

      d3.select(this).select("text")
        .transition("1")
        .duration(_duration)
        .attr("dx", function(d) { return d.children ? -8 : 8; })
        .attr("dy", ".31em")
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