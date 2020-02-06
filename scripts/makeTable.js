const d3 = Object.assign({},
    require("d3-selection"),
    require("d3-collection"),
    require("d3-array"),
    require("d3-format"),
    require("d3-scale")
);

import * as elexUtils from "./elexUtils.js";

export default class makeTable {

    constructor(opts) {
        Object.assign(this, opts);

        this.colKeys = this.colKeys ? this.colKeys : {
            "P": "Votes",
            "P2": "Final align.",
        }

        this.collapsed = true; //

        this._setData();
        this._setDimensions();
        this.appendElements();
        this.update();
    }

    update() {
        this._setDimensions();
        this._setData();
        this.render();
    }

    _setData() {

        this.candLookup = this.data.candidates;
        this.statewide = this.data.results[this.stateFips][0][this.raceName];
        this.series = this.statewide.candidates;

        if (this.data.raceCalls[this.stateFips] && this.data.raceCalls[this.stateFips][this.raceName]) {
            this.raceCalls = this.data.raceCalls[this.stateFips][this.raceName];
        } else {
            this.raceCalls = {};
        }

        // this.reportingVals = this.data.results[this.stateFips][this.raceName][0][3];
        // this.callStatus = this.data.results[this.stateFips][this.raceName][0][2];

        //Max value for bars in tables.
        this.xMax = d3.max(this.series, d => {
            return d["P"] / this.statewide.totals["P"];
        })

        //If the leading candidate has zero results,
        //No votes have been returned. So...
        //Show candidates in the default order
        if (this.series[0]["P"] == 0) {
            this.series = this.series.sort((a, b) => {

                let aLast = this.candLookup[a.candID][2];
                let bLast = this.candLookup[b.candID][2];

                let aPos = elexUtils.defaultOrder.indexOf(aLast) >= 0 ? elexUtils.defaultOrder.indexOf(aLast) : 999;
                let bPos = elexUtils.defaultOrder.indexOf(bLast) >= 0 ? elexUtils.defaultOrder.indexOf(bLast) : 999;

                return aPos - bPos;

            })
        }

    }

    _setDimensions() {

        //Set SVG dimensions for the bars.
        this.margin = {
            top: -3,
            right: 0,
            bottom: 0,
            left: 8
        };

        let el = d3.select(this.element).node();

        this.w = 60;
        this.h = 18;

        this.isSmall = this.element.offsetWidth <= 450;
        // d3.select(this.element).classed("is-small", this.isSmall);

        this.width = this.w - this.margin.left - this.margin.right;
        this.height = this.h - this.margin.top - this.margin.bottom;

        this.barScale = d3.scaleLinear()
            .rangeRound([0, this.w])
            .domain([0, this.xMax]);

    }

    getCandidateName(candObj) {
        let candFirst = candObj ? candObj[0] : "";
        let candLast = candObj ? candObj[2] : "Other";

        // Abbreviate first name to first initial on small screens.
        if (this.isSmall) {
            candFirst = candFirst ? "" : candFirst;
        }

        return `${candFirst} ${candLast}`;

        //return `${candFirst} ${candLast}`;
    }

    appendElements() { //ONLY GETS FIRED ON LOAD

        this.wrapper = d3.select(this.element);

        //OTHER BUTTON
        //removed btn-light class

        let expand = `<button type="button" class="btn btn-sm other-btn">
                                Others
                                <img src="./images/dropdown-arrow.svg" class="dropdown-arrow">
                            </button>`



        let otherButton = expand;

        // column definitions
        this.columns = [{
            head: 'Candidates',
            class: "cand",
            tdWrite: (d, elem) => {

                let candId = d.candID;
                let candObj = this.data.candidates[candId] ? this.data.candidates[candId] : null;
                let candDisplay = this.getCandidateName(candObj);

                let candLast = candObj ? candObj[2] : "Other";
                let color = elexUtils.getCandidateColor(candLast);
                let slug = slugify(candLast);
                let pseudo = d3.select(document.createElement('div'));

                if (elexUtils.hasPhoto[candLast]) {
                    pseudo.append("span")
                        .attr("class", `img ${slug}`)
                        .style("background-color", color)
                        .append("img")
                        .attr("src", `./images/bw/${slug}-bw.png?v=1`);
                }



                pseudo.append("span")
                    .html(candDisplay.trim())

                if (this.raceCalls.status === "W" && this.raceCalls.leadCand === candId) {

                    let winnerBgColor = color.replace('rgb(', 'rgba(').replace(')', ', 0.1)')

                    pseudo.append("span")
                        .html(`<i class="fas fa-check-circle"></i>`)
                        .classed("win-check", true);

                    d3.select(elem).classed("winner", true);
                    d3.select(elem.parentNode).classed('winner-row', true)
                        .style('background-color', winnerBgColor)

                }

                let markup = d3.select(pseudo.node()).html();

                if (!candObj && this.limit) {
                    markup = otherButton;
                }

                d3.select(elem).html(markup);
            }
        }]


        if (this.voteColumns) {
            this.voteColumns.forEach(colKey => {

                this.columns.push({
                    head: this.colKeys[colKey],
                    class: "votes",
                    tdWrite: (d, elem) => {

                        let val = d[colKey];
                        let markup = d3.format(",")(val);

                        if (this.formatVote) {
                            markup = this.formatVote(val, colKey);
                        }

                        d3.select(elem).html(markup);
                    }
                })
            })
        }

        let pctCols = [{
            head: 'Pct.&nbsp;',
            class: "pct",
            tdWrite: (d, elem, index) => {
                let val = d["P"] === 0 ? 0 : (d["P"] / this.statewide.totals["P"]);
                let markup = d3.format(".1%")(val);

                if (val < .01 && val > 0) {
                    markup = "<1%";
                } else if (d["P"] == 0) {
                    markup = "0.0%";
                }

                if (index !== 0) {
                    markup = markup.replace("%", "&nbsp;")
                }

                d3.select(elem).html(markup);
            }
        }, {
            head: '',
            class: "pct-bar",
            tdWrite: (d, elem) => {

                let val = d["P"] / this.statewide.totals["P"];
                let candId = d.candID;
                let candObj = this.data.candidates[candId] ? this.data.candidates[candId] : null;
                let candLast = candObj ? candObj[2] : "Other";
                let color = elexUtils.getCandidateColor(candLast);

                let pseudo = d3.select(document.createElement('div')); //Empty floating div
                let svg = pseudo.append("svg");

                svg.attr("width", this.width + this.margin.left + this.margin.left)
                    .attr("height", this.height + this.margin.bottom + this.margin.top);

                let plot = svg.append("g")
                    .attr("transform", `translate(${this.margin.left}, ${this.margin.top})`);

                let rect = plot.append("rect")
                    .attr("width", val == 0 ? 0 : this.barScale(val))
                    .attr("height", this.h)
                    .style("fill", color);

                let markup = d3.select(pseudo.node()).html();

                d3.select(elem).html(markup);
            }
        }];

        this.columns = this.columns.concat(pctCols);

        if (this.delColumn) {

            let col = {
                head: this.isSmall ? "Dels" : "Delegates",
                class: "del",
                tdWrite: (d, elem) => {
                    let markup = d["Q"] && d["Q"].tot ? d["Q"].tot : "--";
                    d3.select(elem).html(markup);
                }
            }

            this.columns.push(col);
        }


    }



    render() {

        this.wrapper.html("");
        this.table = this.wrapper.append("table")
            .classed("table", true)
            .classed("sm", this.isSmall);

        this.tableHead = this.table.append('thead').append('tr')
        this.tableBody = this.table.append('tbody');

        this.th = this.tableHead.selectAll('th')
            .data(this.columns);

        this.th.enter().append('th')
            .attr('class', d => d.class)
            .merge(this.th)
            .each((d, i, e) => {

                let elem = e[i];

                if (this.columns[i].thWrite) {
                    this.columns[i].thWrite(d.data, elem);
                } else {
                    d3.select(e[i]).html(d.head);
                }

            })

        //If this.limit is a number, limit the number of candidates shown
        //and group the "Others" together in a single row with "show more" button.
        if (this.collapsed && this.limit) {

            let other = {};

            let keys = Object.keys(this.series[0])
                .filter(key => {
                    return key !== "candID" && key !== "Q";
                })

            keys.forEach(key => {
                other[key] = 0;
            })

            this.series.forEach((d, i) => {

                if (i >= this.limit) {
                    keys.forEach(key => {
                        other[key] += d[key];
                    })
                }

            })

            other.candID = "Others";

            this.series = this.series.slice(0, this.limit);
            this.series.push(other);

            this.wrapper.selectAll('.collapse')
                .style('display', 'none')
        }

        this.tr = this.tableBody.selectAll('tr')
            .data(this.series, d => {
                return d.candID; //Key by candidate ID (1st value in the array).
            });

        this.tr.enter().append("tr")
            .attr('class', (d, i) => {

                let candObj = this.data.candidates[d.candID] ? this.data.candidates[d.candID] : null;
                let candLast = candObj ? candObj[2] : "Other";
                let slug = d.candID === "Others" ? "others" : slugify(candLast);

                return `table-tr tr-${i} ${slug}`;
            })
            .merge(this.tr)
            .selectAll('td')
            .data((row, i) => {
                return this.columns.map(col => {

                    var cell = {
                        data: row,
                        index: i
                    };

                    d3.keys(col).forEach(key => {
                        cell[key] = col[key];
                    });

                    return cell;
                });

            }).enter()
            .append("td")
            .attr("class", (d, i) => {
                return this.columns[i].class;
            })
            .each((d, i, e) => {
                let elem = e[i];
                this.columns[i].tdWrite(d.data, elem, d.index); //Write td content here
            })

        let collapseMarkup = `<button type="button" class="btn btn-sm other-btn collapse">
                                Fewer
                                <img src="./images/dropdown-arrow.svg" class="dropdown-arrow">
                            </button>`

        this.wrapper.append('div')
            .attr('class', 'collapse-btn')
            .html(collapseMarkup)

        if (!this.collapsed) {
            this.wrapper.selectAll('.collapse')
                .style('display', 'inline-block')
        }

        //MODIFIED TO PROVIDE A FEWER ^ VIEW
        this.wrapper.selectAll(".other-btn").on("click", () => {
            this.collapsed = this.collapsed ? false : true;
            this.update();
        })

        //Force candidate bar column to svg width + 20px.
        d3.selectAll("th.pct-bar, td.pct-bar")
            .style("width", `${this.width + 20}px`)

        //Calculate percentage of precincts reporting.
        let totPrecincts = this.statewide.precincts.pTot;
        let totReporting = this.statewide.precincts.pRep;

        let totPrecinctsStr = d3.format(",")(totPrecincts);
        let totReportingStr = d3.format(",")(totReporting);

        let percentReporting = d3.format(".1%")(totReporting / totPrecincts);

        if (totReporting === 0) {
            percentReporting = "0.0%";
        }

        let markup = `${totReportingStr} of ${totPrecinctsStr} precincts reporting (${percentReporting})`;

        this.wrapper.append("p")
            .attr("class", "precincts")
            .html(markup);

    }

}

function pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}


function slugify(text) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-') // Replace spaces with -
        .replace(/[^\w\-]+/g, '') // Remove all non-word chars
        .replace(/\-\-+/g, '-') // Replace multiple - with single -
        .replace(/^-+/, '') // Trim - from start of text
        .replace(/-+$/, ''); // Trim - from end of text
}