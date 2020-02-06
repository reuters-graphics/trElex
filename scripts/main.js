import {
    GraphicUtils
} from './GraphicUtils.js' //always import
import 'bootstrap'; //always import, removing will mess up navigation in the header bar.
import {
    ReutersPym
} from './ReutersPym.js' //always import, unless DEFNITELY NOT embedable. test if pym active with pymObject.hasPym
let pymObject = new ReutersPym();

const d3 = Object.assign({},
    require("d3-selection"),
    require("d3-time-format"),
    require("d3-fetch"),
    require("d3-timer"),
    require("d3-format")
);

import stateRace from '../templates/state-race.html'
import related from '../templates/related.html'
import trElex from "./trElex.js";

$(".main").html(stateRace({
    relativeDate: GraphicUtils.relativeDate
}))

// add elections-specific taskbar
$('#taskbar-container').html(trElex.taskbar({
    'active': 'none' //CHOICES: 'results', 'calendar', 'running', or 'issues'
}))

d3.json("//d3sl9l9bcxfb5q.cloudfront.net/json/al-2020-related").then((data) => {
    $("#related").html(related({
        text: data
    }))
});

let theCharts = [];

/* ==================== */
/* QUERY STRING LOGIC */
/* ==================== */

let qView = null;
function init() {
    qView = trElex.elexUtils.checkParam("party") ? trElex.elexUtils.checkParam("party") : null;

    if (qView === "both") {
        d3.select(".container").classed("both", true);
    } else if (qView === "rep") {
        d3.select(".container").classed("rep", true);
    } else {
        d3.select(".container").classed("dem", true);
    }

    getNewData();
    runTimer();

}

/* ==================== */
/* COUNTDOWN TIMER */
/* ==================== */

let counter = d3.selectAll(".counter");
let timer = {
    stop: () => {
        return false;
    }
};


let runTimer = () => {

    let count = 30;
    counter.text(`New data in ${trElex.elexUtils.lpad(count)} seconds`);
    timer.stop();
    timer = d3.interval(() => {
        count--;
        counter.text(`New data in ${trElex.elexUtils.lpad(count)} seconds`);

        if (count === 0) {
            timer.stop();
            //timerShell.classed("is-fetching", true);
            getNewData();
        }
    }, 1000);
};


/* ==================== */
/* DATA FETCHER */
/* ==================== */

function getNewData() {

    let cache = new Date().getTime();

    Promise.all([
            d3.json(`//graphics.thomsonreuters.com/2020-US-elex/20200203/output_20200203.json?cache=${cache}`)
        ])
        .then(([resultsData]) => {

            if (theCharts.length === 0) {
                //INITIALIZE "UPDATED" TIME STAMP HERE, PER DESIGN MODS -- SH
                let time = trElex.elexUtils.formatTimeStamp(resultsData);
                d3.selectAll(".timestamp").html(time);
                main(resultsData);
            } else {
                updateCharts(resultsData);
            }
        });

}


function main(resultsData) {

    if (!qView || qView === "dem" || qView === "both") {

        const demMap = new trElex.makeMap({
            element: document.querySelector(".dem-row .chart"),
            data: resultsData,
            raceName: "Democratic Caucus",
            stateFips: "19", //Iowa
            aspectHeight: .68
        });

        const demTable = new trElex.makeTable({
            element: document.querySelector(".dem-row .table-div"),
            data: resultsData,
            raceName: "Democratic Caucus",
            stateFips: "19", //Iowa
            limit: 8,
            delColumn: true,
            voteColumns: ["P2", "P"],
            colKeys: {
                "P": "SDE",
                "P2": "Final align."
            },
            formatVote: (val, colKey) => {

                if (isNaN(val)) {
                    return "--";
                } else if (val == 0) {
                    return 0;
                } else {
                    val = colKey === "P" ? trElex.elexUtils.round(val / 100, 0) : val;
                    return d3.format(",")(val);
                }

            }
        });

        theCharts.push(demMap, demTable);

    }

    if (qView === "both" || qView === "rep") {

        const repMap = new makeMap({
            element: document.querySelector(".rep-row .chart"),
            data: resultsData,
            raceName: "Republican Caucus",
            stateFips: "19", //Iowa
            aspectHeight: .68
        });

        const repTable = new makeTable({
            element: document.querySelector(".rep-row .table-div"),
            data: resultsData,
            raceName: "Republican Caucus",
            stateFips: "19", //Iowa
            delColumn: false,
            voteColumns: ["P"]
        });

        theCharts.push(repMap, repTable);

    }

    updateTimeStamp(resultsData.ts);

}



/* ==================== */
/* UPDATE LOGIC */
/* ==================== */

function updateCharts(resultsData) {

    theCharts.forEach(chart => {
        if (resultsData) {
            chart.data = resultsData;

            updateTimeStamp(resultsData.ts);
            runTimer();
        }

        chart.update();
    })

    runTimer();
}

function updateTimeStamp(ts) {
    let time = trElex.elexUtils.formatTimeStamp(ts);
    d3.selectAll(".timestamp").html(time);
}



/* ==================== */
/* RESIZE LOGIC */
/* ==================== */

let windowWidth = window.innerWidth;

window.addEventListener("resize", () => {
    //check if window width has actually changed before reloading everything
    //deals with iphone bug where resize event fires every scroll
    if (windowWidth !== window.innerWidth) {
        windowWidth = window.innerWidth
        updateCharts(null);
    } 
});



init();