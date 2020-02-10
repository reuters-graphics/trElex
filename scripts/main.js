/* ================================== */
/* CUSTOMIZE PROJECT HERE */
/* ================================== */

import geoData from "../data/states/subs-33.topo.json";

let config = {
    stateName: "New Hampshire",
    stateFips: "33",
    subhead: "Live Primary Results | Feb. 11, 2020",
    demRaceName: "D",
    repRaceName: "R",
    demDisplay: "Democratic Primary",
    repDisplay: "Republican Primary",
    delColumn: true,
    dataUrl: "//graphics.thomsonreuters.com/2020-US-elex/20200211EndOfNight/output_20200211EndOfNight.json",
    aspectHeight: .9,
    smAspectHeight: 1.1,
    pollsClose: "Polls close at 7:00 PM ET"
}

/* ================================== */

import {
    GraphicUtils
} from './GraphicUtils.js' //always import

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
    relativeDate: GraphicUtils.relativeDate,
    config: config
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

let partyView = null;
let tableOnly = null;
let tableExpand = true;

function init() {
    partyView = trElex.elexUtils.checkParam("party") ? trElex.elexUtils.checkParam("party") : null;
    tableOnly = trElex.elexUtils.checkParam("tableOnly") ? trElex.elexUtils.checkParam("tableOnly") : null;
    tableExpand = trElex.elexUtils.checkParam("tableExpand") ? trElex.elexUtils.checkParam("tableExpand") : true;

    if (partyView === "both") {
        d3.select(".container").classed("both", true);
    } else if (partyView === "rep") {
        d3.selectAll(".container").classed("rep", true);
    } else {
        d3.selectAll(".container").classed("dem", true);
    }

    if (tableOnly && tableOnly === "true") {
        d3.selectAll(".container").classed("table-only", true);
    }

    if (tableExpand === "false") {
        tableExpand = false;
        d3.selectAll(".table-col").classed("no-expand", true);
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
            d3.json(`${config.dataUrl}?cache=${cache}`)
        ])
        .then(([resultsData]) => {

            if (theCharts.length === 0) {
                main(resultsData);
            } else {
                updateCharts(resultsData);
            }
        });

}


function main(resultsData) {

    if (!partyView || partyView === "dem" || partyView === "both") {

        const demMap = new trElex.makeMap({
            element: document.querySelector(".dem-row .chart"),
            data: resultsData,
            raceName: config.demRaceName,
            stateFips: config.stateFips,
            aspectHeight: config.aspectHeight,
            smAspectHeight: config.smAspectHeight,
            geoData: geoData
        });

        const demTable = new trElex.makeTable({
            element: document.querySelector(".dem-row .table-div"),
            data: resultsData,
            raceName: config.demRaceName,
            stateFips: config.stateFips,
            limit: 8,
            delColumn: true,
            voteColumns: ["P"],
            tableExpand: tableExpand
        });

        theCharts.push(demMap, demTable);

    }

    if (partyView === "both" || partyView === "rep") {

        const repMap = new trElex.makeMap({
            element: document.querySelector(".rep-row .chart"),
            data: resultsData,
            raceName: config.repRaceName,
            stateFips: config.stateFips,
            aspectHeight: config.aspectHeight,
            smAspectHeight: config.smAspectHeight,
            geoData: geoData
        });

        const repTable = new trElex.makeTable({
            element: document.querySelector(".rep-row .table-div"),
            data: resultsData,
            raceName: config.repRaceName,
            stateFips: config.stateFips,
            delColumn: true,
            limit: 3,
            voteColumns: ["P"],
            tableExpand: tableExpand
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
        }
        chart.update();
    })

    if (resultsData) {
        updateTimeStamp(resultsData.ts);
        runTimer();
    }

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