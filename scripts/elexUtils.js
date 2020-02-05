const d3 = Object.assign({},
    require("d3-time-format")
);

export const defaultOrder = ["Trump", "Walsh", "Weld", "Biden", "Sanders", "Warren", "Bloomberg", "Buttigieg", "Yang", "Klobuchar", "Steyer", "Gabbard", "Bennet", "Booker"];

export const candColors = {
    "NO RESULTS": "elex-light-gray",
    "Biden": "elex-blue",
    "Sanders": "elex-yellow",
    "Buttigieg": "elex-green",
    "Warren": "elex-orange",
    "Klobuchar": "elex-purple",
    "Yang": "elex-magenta",
    "Patrick": "elex-light-blue",
    "Bennet": "elex-light-blue",
    "Delaney": "elex-light-blue",
    "Gabbard": "elex-light-blue",
    "Booker": "elex-light-blue",
    "Harris": "elex-light-blue",
    "Castro": "elex-light-blue",
    "Williamson": "elex-light-blue",
    "Steyer": "elex-light-blue",
    "Uncommitted": "elex-gray",
    "Other": "elex-gray",
    "Bloomberg": "elex-teal",
    "Trump": "elex-orange",
    "Weld": "elex-yellow",
    "Walsh": "elex-gray"
}

export const colors = {
    "elex-purple": "rgb(127, 97, 201)",
    "elex-yellow": "rgb(255, 210, 3)",
    "elex-green": "rgb(114, 191, 46)",
    "elex-turqoise": "rgb(0, 175, 189)",
    "elex-orange": "rgb(249, 136, 0)",
    "elex-blue": "rgb(33, 142, 205)",
    "elex-light-blue": "rgb(200,218,240)",
    "elex-red": "rgb(234, 33, 52)",
    "elex-maroon": "rgb(185, 0, 0)",
    "elex-magenta": "rgb(193,43,111)",
    "elex-teal": "rgb(0,178,148)",
    "white": "rgb(255, 255, 255)",
    "elex-gray": "rgb(147, 149, 152)",
    "elex-light-gray" : "rgb(239,239,239)"
}


export function getCandidateColor(lastName) {
    let colorKey = candColors[lastName];
    return colors[colorKey];
}

//Add leading zeros to integers and return them as strings.
export function pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

//Round a number to a specified decimal place
export function round(value, decimals) {
    return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
}

export function formatTimeStamp(ts) {

    var dt = new Date(ts);

    dt.setTime(dt.getTime() + dt.getTimezoneOffset() * 60 * 1000);

    var offset = -300; //Timezone offset for EST in minutes.
    var estDate = new Date(dt.getTime() + offset * 60 * 1000);

    let date = d3.timeFormat("%b. %e")(estDate);
    let time = d3.timeFormat("%-I:%M %p")(estDate);

    return `<span class="updated">Updated</span> ${date}, <span class='time-here'>${time} ET</span> `;

}

export function lpad(n) {
    let s = n.toString();
    if (s.length === 1) {
        return "0" + s;
    } else {
        return s;
    }
}

export function checkParam(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  let regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");

  let results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return "";
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}