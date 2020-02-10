const d3 = Object.assign({},
    require("d3-selection"),
    require("d3-array"),
    require("d3-geo"),
    require("d3-fetch"),
    require("d3-scale"),
    require("d3-scale-chromatic")
);

let topojson = require("topojson-client");

import theCities from "../data/cities.json";
import statePlanes from "../data/statePlanes_fips.json";
import setTooltip from "./tooltip.js";

import trElex from "./trElex.js";



export default class makeMap {

    constructor(opts) {
        Object.assign(this, opts);

        //Should be passed as an argument. Determines size of state map.
        this.aspectHeight = opts.aspectHeight ? opts.aspectHeight : 0.68;

        this._setData();
        this.appendElements();
        this.update();
    }

    update() {
        this._setData();
        this._setDimensions();
        this._setScales();
        this.render();
    }

    _setData() {

        this.candLookup = this.data.candidates;

        this.fipsLookup = {};
        this.countyLookup = {};

        this.stateTopo = topojson.feature(this.geoData, this.geoData.objects.states);
        this.countyTopo = topojson.feature(this.geoData, this.geoData.objects.counties);

        this.countyTopo.features.forEach(d => {
            let name = d.properties["NAME"].toUpperCase();
            let geoid = d.properties["GEOID"];
            this.fipsLookup[name] = geoid;
        })
    }

    _setDimensions() {
        this.margin = {
            top: 10,
            right: 10,
            bottom: 10,
            left: 10
        };

        this.isSmall = this.element.offsetWidth <= 400;

        console.log(this.isSmall)
        console.log(this)

        if (this.isSmall && this.smAspectHeight) {
            this.aspectHeight = this.smAspectHeight;
        }

        this.width = this.element.offsetWidth - this.margin.left - this.margin.right;
        this.height = (this.element.offsetWidth * this.aspectHeight) - this.margin.top - this.margin.bottom;

    }

    _setScales() {

        this.statePlane = statePlanes[this.stateFips];
        this.projection = d3[this.statePlane.proj]();
        this.path = d3.geoPath().projection(this.projection);

    }

    appendElements() { //ONLY GETS FIRED ON LOAD

        d3.select(this.element).classed("results-map", true);

        this.tooltip = new setTooltip({
            element: this.element,
            elexUtils: trElex.elexUtils,
            candidates: this.candLookup,
            raceName: this.raceName
        });

        this.svg = d3.select(this.element).append("svg");

        this.plot = this.svg.append("g").attr("class", "chart-g");
        this.intx = this.svg.append("g").attr("class", "intx-g");
        this.lbls = this.svg.append("g").attr("class", "lbls-g");

        /* TIE PATTERN */
        this.defs = this.svg.append("defs");

        this.tie = this.defs
            .append("pattern")
            .attr("id", "tie")
            .attr("patternUnits", "userSpaceOnUse");

        this.tie.append("rect").attr("fill", "#999");
        this.tie.append("path").attr("stroke", "#cccccc");

        this.tie.attr("width", 4)
            .attr("height", 4)
            .attr("patternTransform", "rotate(-45)");

        this.tie.selectAll("rect")
            .attr("width", 4)
            .attr("height", 4);

        this.tie.selectAll("path")
            .attr("d", "M " + -1 + "," + 2 + " l " + 6 + "," + 0)
            .attr("stroke-width", 2);

        /* END TIE PATTERN */
        this.key = d3.select(this.element).append("div")
            .attr("class", "key")

        this.state = this.plot.selectAll("path.state")
            .data(this.stateTopo.features)
            .enter()
            .append("path")
            .attr("class", "state")

        this.counties = this.plot.selectAll("path.county")
            .data(this.countyTopo.features)
            .enter()
            .append("path")
            .attr("class", "county");

        this.cities = this.lbls.selectAll(".city-g")
            .data(theCities[this.stateFips])
            .enter().append("g")
            .each(d => {
                d.coord = [d[1], d[2]];
            })
            .attr("class", "city-g");

        this.cities.append("text")
            .attr("class", "bkgd")
            .text(d => d[0])

        this.cities.append("text")
            .attr("class", "main")
            .text(d => d[0])

        this.cities.append("circle");

    }

    render() {

        this.svg.attr("width", this.width + this.margin.left + this.margin.right);
        this.svg.attr("height", this.height + this.margin.top + this.margin.bottom);

        this.plot.attr("transform", `translate(${this.margin.left},${this.margin.top})`);
        this.lbls.attr("transform", `translate(${this.margin.left},${this.margin.top})`);
        this.intx.attr("transform", `translate(${this.margin.left},${this.margin.top})`);

        this.rot = this.statePlane.rotate;

        this.leadersLookup = {};

        this.projection = d3[this.statePlane.proj]()
            .rotate(this.rot)
            .fitSize([this.width, this.height], this.countyTopo);

        this.path.projection(this.projection);

        let raceData = this.data.results[this.stateFips];

        this.state.attr("d", d => {
            return this.path(d);
        })

        this.counties.attr("d", d => {
                return this.path(d);
            })
            .style("fill", d => {

                let geoid = d.properties["GEOID"];

                let countyData = raceData[geoid] ? raceData[geoid][this.raceName] : null;

                if (!raceData[geoid]) {
                    return trElex.elexUtils.getCandidateColor("NO POLLING PLACES");
                } else if (!countyData) {
                    return trElex.elexUtils.getCandidateColor("NO RESULTS");
                }

                let leaderID = countyData.candidates[0].cId;
                let leaderVotes = countyData.candidates[0]["P"];
                let secondVotes = countyData.candidates[1]["P"];
                let lastName = this.data.candidates[leaderID][2];

                if (leaderVotes == 0) {
                    return trElex.elexUtils.getCandidateColor("NO RESULTS");
                } else {

                    if (leaderVotes === secondVotes) {
                        lastName = "Tie";
                    }

                    if (!this.leadersLookup[lastName]) {
                        this.leadersLookup[lastName] = 0;
                    }

                    this.leadersLookup[lastName]++;

                    if (lastName === "Tie") {
                        return "url(#tie)"
                    } else {
                        return trElex.elexUtils.getCandidateColor(lastName);
                    }
                }

            })
            .on("mouseover", (d, i, e) => {

                let centroid = this.path.centroid(d);
                let xPos = centroid[0] + this.margin.left;
                let yPos = centroid[1] + this.margin.top;

                let ttPos = [xPos, yPos];

                this.intx.append("path")
                    .attr("d", this.path(d));

                let geoid = d.properties["GEOID"];

                let countyData = raceData[geoid] ? raceData[geoid][this.raceName] : null;

                d.data = countyData;

                this.tooltip.updateFields(d);
                this.tooltip.position(ttPos, [this.element.offsetWidth, this.element.offsetHeight]);

            })
            .on("mouseout", d => {
                this.tooltip.deposition();
                this.intx.selectAll("path").remove();
            });

        let offsets = {
            "ne": [8, -4],
            "nw": [-8, -4],
            "se": [8, 12],
            "sw": [-8, 12]
        }

        this.cities.selectAll("circle")
            .attr("cx", d => {
                return this.projection(d.coord)[0];
            })
            .attr("cy", d => {
                return this.projection(d.coord)[1];
            })
            .attr("r", 4)
            .attr("fill", "magenta");

        this.cities.selectAll("text")
            .attr("x", d => {
                let offsetX = offsets[d[3]][0];
                return this.projection(d.coord)[0] + offsetX;
            })
            .attr("y", d => {
                let offsetY = offsets[d[3]][1];
                return this.projection(d.coord)[1] + offsetY;
            })
            .attr("text-anchor", d => {
                return d[3] == "nw" || d[3] == "sw" ? "end" : "start";
            })

        this.updateMapKey();

    }


    updateMapKey() {

        let keyArray = Object.keys(this.leadersLookup).sort((a, b) => {
            return this.leadersLookup[b] - this.leadersLookup[a];
        })

        if (keyArray.length === 0) {
            this.key.html("");
        } else {
            this.key.html("<span class='leading'>Leading</span>");
        }

        let keyItem = this.key.selectAll(".key-item")
            .data(keyArray)
            .enter().append("div")
            .attr("class", "key-item");

        keyItem.append("span")
            .attr("class", "swatch")
            .style("background", key => trElex.elexUtils.getCandidateColor(key));

        keyItem.selectAll(".swatch")
            .filter(key => {
                return key === "Tie";
            })
            .style("background-image", `url("images/tie-hash.png")`)

        keyItem.append("span")
            .attr("class", "name")
            .html(key => key);

    }



}


function round(value, decimals) {
    return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
}