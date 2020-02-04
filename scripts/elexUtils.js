const d3 = Object.assign({},
    require("d3-time-format")
);

export const defaultOrder = ["Trump", "Walsh", "Weld", "Biden", "Sanders", "Warren", "Bloomberg", "Buttigieg", "Yang", "Klobuchar", "Steyer", "Gabbard", "Bennet", "Booker"];

export const candColors = {
    "NO RESULTS": "gray-100",
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
    "Walsh": "elex-gray",
    "Tie": "gray-400"
}

export const colors = {
    "gray-100": "rgb(239,239,239)",
    "gray-200": "rgb(188,190,192)",
    "gray-300": "rgb(147,149,152)",
    "gray-400": "rgb(109,110,113)",
    "gray-500": "rgb(77,77,79)",
    "gray-600": "rgb(65,64,66)",
    "blue-100": "rgb(200,218,240)",
    "blue-200": "rgb(171,200,232)",
    "blue-300": "rgb(122,173,220)",
    "blue-400": "rgb(31,143,206)",
    "blue-500": "rgb(27,120,172)",
    "blue-600": "rgb(4,79,116)",
    "navy-100": "rgb(188,194,224)",
    "navy-200": "rgb(155,164,207)",
    "navy-300": "rgb(105,124,184)",
    "navy-400": "rgb(15,81,159)",
    "navy-500": "rgb(10,66,134)",
    "navy-600": "rgb(0,36,89)",
    "purple-100": "rgb(202,189,220)",
    "purple-200": "rgb(177,156,201)",
    "purple-300": "rgb(141,110,174)",
    "purple-400": "rgb(101,50,144)",
    "purple-500": "rgb(85,36,121)",
    "purple-600": "rgb(54,4,81)",
    "red-100": "rgb(251,201,186)",
    "red-200": "rgb(248,171,152)",
    "red-300": "rgb(243,123,104)",
    "red-400": "rgb(236,32,51)",
    "red-500": "rgb(195,23,41)",
    "red-600": "rgb(130,0,13)",
    "orange-100": "rgb(255,229,187)",
    "orange-200": "rgb(255,202,140)",
    "orange-300": "rgb(255,175,94)",
    "orange-400": "rgb(255,148,47)",
    "orange-500": "rgb(255,121,0)",
    "orange-600": "rgb(179,85,0)",
    "yellow-100": "rgb(254,245,197)",
    "yellow-200": "rgb(254,233,134)",
    "yellow-300": "rgb(254,210,96)",
    "yellow-400": "rgb(255,165,21)",
    "yellow-500": "rgb(225,147,16)",
    "yellow-600": "rgb(165,111,5)",
    "lime-100": "rgb(239,244,204)",
    "lime-200": "rgb(232,238,175)",
    "lime-300": "rgb(219,229,128)",
    "lime-400": "rgb(202,219,46)",
    "lime-500": "rgb(166,182,38)",
    "lime-600": "rgb(106,120,18)",
    "green-100": "rgb(203,225,200)",
    "green-200": "rgb(174,211,171)",
    "green-300": "rgb(125,190,128)",
    "green-400": "rgb(10,167,75)",
    "green-500": "rgb(0,140,62)",
    "green-600": "rgb(0,94,37)",
    "brown-100": "rgb(244,237,211)",
    "brown-200": "rgb(230,221,186)",
    "brown-300": "rgb(216,205,160)",
    "brown-400": "rgb(188,173,109)",
    "brown-500": "rgb(167,154,101)",
    "brown-600": "rgb(125,115,85)",
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
    "elex-gray": "rgb(147, 149, 152)"
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

// function parseISOString(s) {
//   var b = s.split(/\D+/);
//   return new Date(Date.UTC(b[0], --b[1], b[2], b[3], b[4], b[5], b[6]));
// }

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