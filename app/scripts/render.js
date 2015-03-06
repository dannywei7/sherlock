define(['d3', 'lib/knockout', 'scripts/Utils', 'dagre-d3', 'jquery', 'lettuce', 'jquery.tipsy'],
  function (d3, ko, Utils, dagreD3, $, Lettuce) {
    'use strict';
    function renderPage(skills_data) {
      function setSkillNode() {
        ko.utils.arrayForEach(skills_data.skills, function (skill) {
          var value = skill;
          value.label = skill.name;
          value.height = value.width = 60;
          value.rx = value.ry = 15;
          g.setNode(skill.name, value);
        });
      }

      function setSkillEdge() {
        ko.utils.arrayForEach(skills_data.skills, function (skill) {
          var skill_id = skill.id;
          if (skill.depends) {
            ko.utils.arrayForEach(skill.depends, function (id) {
              var dependents_name = Utils.getSkillById(skills_data.skills, id).name;
              var skill_name = Utils.getSkillById(skills_data.skills, skill_id).name;
              g.setEdge(dependents_name, skill_name, {label: '', lineInterpolate: 'basis'});
            });
          }
        });
      }

      var lettuce = new Lettuce();
      var g = new dagreD3.graphlib.Graph().setGraph({});
      setSkillNode();
      setSkillEdge();
      g.nodes().forEach(function (v) {
        var node = g.node(v);
        //console.log(node);
      });

      var render = new dagreD3.render();
      var svg = d3.select('svg');

      /* append image */
      g.nodes().forEach(function (v) {
        var node = g.node(v);
        if( node.logo){
          svg.append("defs")
            .append("pattern")
            .attr("id", node.id)
            .attr("width", 80)
            .attr("height", 80)
            .append("svg:image")
            .attr("xlink:href", "./app/logo/" + node.logo)
            .attr("width", 80)
            .attr("height", 80)
            .attr("x", 0)
            .attr("y", 0);
        }
      });

      var inner = svg.append('g');

      render(inner, g);

      inner.selectAll('rect')
        .attr('class', 'inner');

      /* fill background */
      var rect = inner.selectAll('g.node rect' );
      rect.style("fill", function (d, i) {
        var node = g.node(d);
        if(node.logo) {
          return "url(#" + node.id + ")" ;
        }
        return "";
      });

      inner.selectAll('g.node')
        .on("click", function (d, i) {
          d3.select(this).style('opacity', '0.5');
        })
        .on('mouseover', function () {
          d3.select(this).style('fill', 'red');
        })
        .on('mouseout', function () {
          d3.select(this).style('fill', 'black');
        });

      inner.selectAll('g.node')
        .attr('title', function (v) {
          var data = {
            name: v,
            description: g.node(v).description
          };
          var results = lettuce.Template.tmpl('<p class="name">{%=o.name%}</p><p class="description">{%=o.description%}</p>', data);
          return results;
        })
        .each(function (v) {
          $(this).tipsy({gravity: 's', opacity: 1, html: true});
        });

      svg.attr('height', g.graph().height + 120);
    }

    return {
      renderPage: renderPage
    };
  });
