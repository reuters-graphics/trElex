window.gettext = function(text){
    return text;
}

let d3formatter = require("d3-format");
let d3 = Object.assign(d3formatter, require("d3-time-format"));


class GraphicUtils {

	static getJsonFromUrl(hashBased = null){
        let query;
        if(hashBased) {
            let pos = location.href.indexOf('?');
            if(pos == -1) return [];
            query = location.href.substr(pos+1);
        } else {
            query = location.search.substr(1);
        }
        let result = {};
        query.split('&').forEach(function(part) {
            if(!part) return;
            part = part.split('+').join(' '); // replace every + with space, regexp-free version
            let eq = part.indexOf('=');
            let key = eq > -1 ? part.substr(0,eq) : part;
			let val = eq > -1 ? decodeURIComponent(part.substr(eq + 1)) : '';
            //convert true / false to booleans.
            if(val == 'false'){
                val = false;
            }else if(val == 'true'){
                val = true;
            }

            let f = key.indexOf('[');
            if(f == -1){ 
                result[decodeURIComponent(key)] = val;
            }else {
                var to = key.indexOf(']');
                var index = decodeURIComponent(key.substring(f + 1,to));
                key = decodeURIComponent(key.substring(0,f));
                if(!result[key]){
                    result[key] = [];
                }
                if(!index){
                    result[key].push(val);
                }else{
                    result[key][index] = val;
                }
            }
        });
        return result;
    }

	static locales(lang) {
		let locales = {
			en:{
				decimal:".",
				thousands:",",
				grouping:[3],
				currency:["$",""],				
			  "dateTime": "%x, %X",
			  "date": "%-m/%-d/%Y",
			  "time": "%-I:%M:%S %p",
			  "periods": ["AM", "PM"],
			  "days": ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
			  "shortDays": ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
			  "months": ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
			  "shortMonths": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
			},
			
			es:{
				"decimal": ",",
				"thousands": ".",
				"grouping": [3],
				"currency": ["$", ""],				
			  "dateTime": "%x, %X",
			  "date": "%d/%m/%Y",
			  "time": "%-I:%M:%S %p",
			  "periods": ["AM", "PM"],
			  "days": ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"],
			  "shortDays": ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"],
			  "months": ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
			  "shortMonths": ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"]
			},
			
			fr:{
				"decimal": ",",
				"thousands": ".",
				"grouping": [3],
				"currency": ["$", ""],				
			  "dateTime": "%A, le %e %B %Y, %X",
			  "date": "%d/%m/%Y",
			  "time": "%H:%M:%S",
			  "periods": ["AM", "PM"],
			  "days": ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"],
			  "shortDays": ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."],
			  "months": ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"],
			  "shortMonths": ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."]
			},
		
			ch:{
				decimal:".",
				thousands:",",
				grouping:[3],
				currency:["¥",""],				
				dateTime:"%a %b %e %X %Y",
				date:"%d/%m/%Y",
				time:"%H:%M:%S",
				periods:["AM","PM"],
				days:["周日","周一","周二","周三","周四","周五","周六"],
				shortDays:["周日","周一","周二","周三","周四","周五","周六"],
				months:["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"],
				"shortMonths":["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"]
			},	
		
			pt:{
				"decimal": ",",
				"thousands": ".",
				"grouping": [3],
				"currency": ["$", ""],				
				"dateTime": "%a %b %e %X %Y",
				"date": "%m/%d/%Y",
				"time": "%H:%M:%S",
				"periods": ["AM", "PM"],
				"days": ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes","Sábado"],
				"shortDays": ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"],
				"months": ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"],
				"shortMonths": ["Jan", "Fev", "Mar", "Abr", "Maio", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
			},
			ar:{
		        decimal:".",
		        thousands:",",
		        grouping:[3],
		        currency:["$",""],				
		        dateTime:"%a %b %e %X %Y",
		        date:"%m/%d/%Y",
		        time:"%H:%M:%S",
		        periods:["صباحا","مسا؛ا"],
		        days:[" الأحد"," الإثنين "," الثلاثاء "," الأربعاء "," الخميس "," الجمعة "," السبت "],
		        shortDays:[" أحد "," إثنين "," ثلاثاء "," أربعاء ","لخميس"," الجمعة "," سبت "],
		        months:[" يناير"," فبراير "," مارس "," أبريل ","مايو"," يونيو "," يوليو "," أغسطس "," سبتمبر "," اكتوبر "," نوفمبر "," ديسمبر "],
		        "shortMonths":[" يناير"," فبراير "," مارس "," أبريل ","مايو"," يونيو "," يوليو "," أغسطس "," سبتمبر "," اكتوبر "," نوفمبر "," ديسمبر "],
			},
			ja:{
		        decimal:".",	
		        thousands:",",	
		        grouping:[3],	
		        currency:["¥",""],				
		        dateTime:"%a %b %e %X %Y",	
		        date:"%Y/%m/%d",	
		        time:"%H:%M:%S",	
		        periods:["午前","午後"],	
		        days:["日曜日","月曜日","火曜日","水曜日","木曜日","金曜日","土曜日"],	
		        shortDays:["（日）","（月）","（火）","（水）","（木）","（金）","（土曜）"],	
		        months:["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"],	
		        "shortMonths":["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"]	
			},
			bg:{
				decimal:".",
				thousands:" ",
				grouping:[3],
				currency:["$",""],				
				dateTime:"%a %b %e %X %Y",
				date:"%m/%d/%Y",
				time:"%H:%M:%S",
				periods:["AM","PM"],
				days:["неделя","понеделник","вторник","сряда","четвъртък","петък","събота"],
				shortDays:["нед.","пон.","вт.","ср.","чет.","пет.","съб."],
				months:["януари","февруари","март","април","май","юни","юли","август","септември","октомври","ноември","декември"],
				"shortMonths":["ян.","фев.","март","апр.","май","юни","юли","авг.","септ.","окт.","нов.","дек."]
			}
		}		
		return locales[lang]	
	}

	static relativeDate (dateString) {

		function sameDay(d1, d2) {
		  return d1.getFullYear() === d2.getFullYear() &&
		    d1.getMonth() === d2.getMonth() &&
		    d1.getDate() === d2.getDate();
		}
		function compareWeeks ( d ) { 
			let target  = new Date(d.valueOf());  	
			let dayNr   = (d.getDay() + 6) % 7;  	
			target.setDate(target.getDate() - dayNr + 3);  	
			let jan4    = new Date(target.getFullYear(), 0, 4);  
			let dayDiff = (target - jan4) / 86400000;    
			let weekNr = 1 + Math.ceil(dayDiff / 7);    	
			return weekNr;    
		}
	
		let date = new Date(dateString);
		let today = new Date()
		today.setHours(0);
		today.setMinutes(0);
		today.setSeconds(0,0);
	
		if (sameDay(date, today)){
			return "today"
		}	
		if(today.getTime() - date.getTime() == 86400000 ){
			return "yesterday"
		}
		
		if (compareWeeks ( date ) == compareWeeks ( today )){
			let weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
			return "on " + weekdays[date.getDay()];
		}
		
		return "on " + dateString;
	}
	
}

let params = GraphicUtils.getJsonFromUrl();

d3.timeFormatDefaultLocale(GraphicUtils.locales(gettext("en")))
d3.formatDefaultLocale(GraphicUtils.locales(gettext("en")));

if (params.media){
    document.documentElement.classList.add("media-flat")
}

if (params.eikon){
     document.documentElement.classList.add("eikon")
}

if (params.header == "no"){
     document.documentElement.classList.add("remove-header")
}

window.forest1 = "#C4D6C4";
window.forest2 = "#A5C3A8";
window.forest3 = "#73A97F";
window.forest4 = "#008C4E";
window.forest5 = "#007741";
window.forest6 = "#005027";
window.green1 = "#CBE1C8";
window.green2 = "#AED3AB";
window.green3 = "#7DBE80";
window.green4 = "#0AA74B";
window.green5 = "#008C3E";
window.green6 = "#005E25";
window.olive1 = "#E0EDCB";
window.olive2 = "#D0E4AF";
window.olive3 = "#B4D682";
window.olive4 = "#8FC641";
window.olive5 = "#74A535";
window.olive6 = "#476E1E";
window.lime1 = "#EFF4CC";
window.lime2 = "#E8EEAF";
window.lime3 = "#DBE580";
window.lime4 = "#CADB2E";
window.lime5 = "#A6B626";
window.lime6 = "#6A7812";
window.yellow1 = "#FCF8CD";
window.yellow2 = "#FBF5B0";
window.yellow3 = "#F9F17E";
window.yellow4 = "#F6EB0E";
window.yellow5 = "#CAC313";
window.yellow6 = "#838103";
window.tangerine1 = "#FFECC6";
window.tangerine2 = "#FFE3A7";
window.tangerine3 = "#FFD576";
window.tangerine4 = "#FDC218";
window.tangerine5 = "#D0A115";
window.tangerine6 = "#886A00";
window.orange1 = "#FDD5BB";
window.orange2 = "#FBBE99";
window.orange3 = "#F79967";
window.orange4 = "#F26725";
window.orange5 = "#C8551D";
window.orange6 = "#843401";
window.red1 = "#FBC9BA";
window.red2 = "#F8AB98";
window.red3 = "#F37B68";
window.red4 = "#EC2033";
window.red5 = "#C31729";
window.red6 = "#82000D";
window.rose1 = "#E9C3C8";
window.rose2 = "#DFA4AE";
window.rose3 = "#D17589";
window.rose4 = "#C02460";
window.rose5 = "#A11950";
window.rose6 = "#6B0031";
window.violet1 = "#DABFD1";
window.violet2 = "#C99FBB";
window.violet3 = "#B1709B";
window.violet4 = "#952978";
window.violet5 = "#7E1E65";
window.violet6 = "#530041";
window.purple1 = "#CABDDC";
window.purple2 = "#B19CC9";
window.purple3 = "#8D6EAE";
window.purple4 = "#653290";
window.purple5 = "#552479";
window.purple6 = "#360451";
window.navy1 = "#BCC2E0";
window.navy2 = "#9BA4CF";
window.navy3 = "#697CB8";
window.navy4 = "#0F519F";
window.navy5 = "#0A4286";
window.navy6 = "#002459";
window.blue1 = "#C8DAF0";
window.blue2 = "#ABC8E8";
window.blue3 = "#7AADDC";
window.blue4 = "#1F8FCE";
window.blue5 = "#1B78AC";
window.blue6 = "#044F74";
window.cyan1 = "#CFE8F9";
window.cyan2 = "#B5DDF6";
window.cyan3 = "#86CCF1";
window.cyan4 = "#2AB8EB";
window.cyan5 = "#259AC5";
window.cyan6 = "#0C6785";
window.gray1 = "#DCDDDE";
window.gray2 = "#BCBEC0";
window.gray3 = "#939598";
window.gray4 = "#6D6E71";
window.gray5 = "#4D4D4F";
window.gray6 = "#414042";

window.grey1 = "#AFBABF";
window.grey2 = "#D4D8DA";
window.black = "#231F20";
window.white = "#FFFFFF";

//relative colors,
window.staticnav = grey1;
window.selectednav = black;

window.mcolor = {
  'red': {
    '50': "#ffebee",
    '100': "#ffcdd2",
    '200': "#ef9a9a",
    '300': "#e57373",
    '400': "#ef5350",
    '500': "#f44336",
    '600': "#e53935",
    '700': "#d32f2f",
    '800': "#c62828",
    '900': "#b71c1c",
    'a100': "#ff8a80",
    'a200': "#ff5252",
    'a400': "#ff1744",
    'a700': "#d50000",
  },

  'pink': {
    '50': "#fce4ec",
    '100': "#f8bbd0",
    '200': "#f48fb1",
    '300': "#f06292",
    '400': "#ec407a",
    '500': "#e91e63",
    '600': "#d81b60",
    '700': "#c2185b",
    '800': "#ad1457",
    '900': "#880e4f",
    'a100': "#ff80ab",
    'a200': "#ff4081",
    'a400': "#f50057",
    'a700': "#c51162",
  },

  'purple': {
    '50': "#f3e5f5",
    '100': "#e1bee7",
    '200': "#ce93d8",
    '300': "#ba68c8",
    '400': "#ab47bc",
    '500': "#9c27b0",
    '600': "#8e24aa",
    '700': "#7b1fa2",
    '800': "#6a1b9a",
    '900': "#4a148c",
    'a100': "#ea80fc",
    'a200': "#e040fb",
    'a400': "#d500f9",
    'a700': "#aa00ff",
  },

  'deep-purple': {
    '50': "#ede7f6",
    '100': "#d1c4e9",
    '200': "#b39ddb",
    '300': "#9575cd",
    '400': "#7e57c2",
    '500': "#673ab7",
    '600': "#5e35b1",
    '700': "#512da8",
    '800': "#4527a0",
    '900': "#311b92",
    'a100': "#b388ff",
    'a200': "#7c4dff",
    'a400': "#651fff",
    'a700': "#6200ea",
  },

  'indigo': {
    '50': "#e8eaf6",
    '100': "#c5cae9",
    '200': "#9fa8da",
    '300': "#7986cb",
    '400': "#5c6bc0",
    '500': "#3f51b5",
    '600': "#3949ab",
    '700': "#303f9f",
    '800': "#283593",
    '900': "#1a237e",
    'a100': "#8c9eff",
    'a200': "#536dfe",
    'a400': "#3d5afe",
    'a700': "#304ffe",
  },

  'blue': {
    '50': "#e3f2fd",
    '100': "#bbdefb",
    '200': "#90caf9",
    '300': "#64b5f6",
    '400': "#42a5f5",
    '500': "#2196f3",
    '600': "#1e88e5",
    '700': "#1976d2",
    '800': "#1565c0",
    '900': "#0d47a1",
    'a100': "#82b1ff",
    'a200': "#448aff",
    'a400': "#2979ff",
    'a700': "#2962ff",
  },

  'light-blue': {
    '50': "#e1f5fe",
    '100': "#b3e5fc",
    '200': "#81d4fa",
    '300': "#4fc3f7",
    '400': "#29b6f6",
    '500': "#03a9f4",
    '600': "#039be5",
    '700': "#0288d1",
    '800': "#0277bd",
    '900': "#01579b",
    'a100': "#80d8ff",
    'a200': "#40c4ff",
    'a400': "#00b0ff",
    'a700': "#0091ea",
  },

  'cyan': {
    '50': "#e0f7fa",
    '100': "#b2ebf2",
    '200': "#80deea",
    '300': "#4dd0e1",
    '400': "#26c6da",
    '500': "#00bcd4",
    '600': "#00acc1",
    '700': "#0097a7",
    '800': "#00838f",
    '900': "#006064",
    'a100': "#84ffff",
    'a200': "#18ffff",
    'a400': "#00e5ff",
    'a700': "#00b8d4",
  },

  'teal': {
    '50': "#e0f2f1",
    '100': "#b2dfdb",
    '200': "#80cbc4",
    '300': "#4db6ac",
    '400': "#26a69a",
    '500': "#009688",
    '600': "#00897b",
    '700': "#00796b",
    '800': "#00695c",
    '900': "#004d40",
    'a100': "#a7ffeb",
    'a200': "#64ffda",
    'a400': "#1de9b6",
    'a700': "#00bfa5",
  },

  'green': {
    '50': "#e8f5e9",
    '100': "#c8e6c9",
    '200': "#a5d6a7",
    '300': "#81c784",
    '400': "#66bb6a",
    '500': "#4caf50",
    '600': "#43a047",
    '700': "#388e3c",
    '800': "#2e7d32",
    '900': "#1b5e20",
    'a100': "#b9f6ca",
    'a200': "#69f0ae",
    'a400': "#00e676",
    'a700': "#00c853",
  },

  'light-green': {
    '50': "#f1f8e9",
    '100': "#dcedc8",
    '200': "#c5e1a5",
    '300': "#aed581",
    '400': "#9ccc65",
    '500': "#8bc34a",
    '600': "#7cb342",
    '700': "#689f38",
    '800': "#558b2f",
    '900': "#33691e",
    'a100': "#ccff90",
    'a200': "#b2ff59",
    'a400': "#76ff03",
    'a700': "#64dd17",
  },

  'lime': {
    '50': "#f9fbe7",
    '100': "#f0f4c3",
    '200': "#e6ee9c",
    '300': "#dce775",
    '400': "#d4e157",
    '500': "#cddc39",
    '600': "#c0ca33",
    '700': "#afb42b",
    '800': "#9e9d24",
    '900': "#827717",
    'a100': "#f4ff81",
    'a200': "#eeff41",
    'a400': "#c6ff00",
    'a700': "#aeea00",
  },

  'yellow': {
    '50': "#fffde7",
    '100': "#fff9c4",
    '200': "#fff59d",
    '300': "#fff176",
    '400': "#ffee58",
    '500': "#ffeb3b",
    '600': "#fdd835",
    '700': "#fbc02d",
    '800': "#f9a825",
    '900': "#f57f17",
    'a100': "#ffff8d",
    'a200': "#ffff00",
    'a400': "#ffea00",
    'a700': "#ffd600",
  },

  'amber': {
    '50': "#fff8e1",
    '100': "#ffecb3",
    '200': "#ffe082",
    '300': "#ffd54f",
    '400': "#ffca28",
    '500': "#ffc107",
    '600': "#ffb300",
    '700': "#ffa000",
    '800': "#ff8f00",
    '900': "#ff6f00",
    'a100': "#ffe57f",
    'a200': "#ffd740",
    'a400': "#ffc400",
    'a700': "#ffab00",
  },

  'orange': {
    '50': "#fff3e0",
    '100': "#ffe0b2",
    '200': "#ffcc80",
    '300': "#ffb74d",
    '400': "#ffa726",
    '500': "#ff9800",
    '600': "#fb8c00",
    '700': "#f57c00",
    '800': "#ef6c00",
    '900': "#e65100",
    'a100': "#ffd180",
    'a200': "#ffab40",
    'a400': "#ff9100",
    'a700': "#ff6d00",
  },

  'deep-orange': {
    '50': "#fbe9e7",
    '100': "#ffccbc",
    '200': "#ffab91",
    '300': "#ff8a65",
    '400': "#ff7043",
    '500': "#ff5722",
    '600': "#f4511e",
    '700': "#e64a19",
    '800': "#d84315",
    '900': "#bf360c",
    'a100': "#ff9e80",
    'a200': "#ff6e40",
    'a400': "#ff3d00",
    'a700': "#dd2c00",
  },

  'brown': {
    '50': "#efebe9",
    '100': "#d7ccc8",
    '200': "#bcaaa4",
    '300': "#a1887f",
    '400': "#8d6e63",
    '500': "#795548",
    '600': "#6d4c41",
    '700': "#5d4037",
    '800': "#4e342e",
    '900': "#3e2723",
  },

  'grey': {
    '50': "#fafafa",
    '100': "#f5f5f5",
    '200': "#eeeeee",
    '300': "#e0e0e0",
    '400': "#bdbdbd",
    '500': "#9e9e9e",
    '600': "#757575",
    '700': "#616161",
    '800': "#424242",
    '900': "#212121",
  },

  'blue-grey': {
    '50': "#eceff1",
    '100': "#cfd8dc",
    '200': "#b0bec5",
    '300': "#90a4ae",
    '400': "#78909c",
    '500': "#607d8b",
    '600': "#546e7a",
    '700': "#455a64",
    '800': "#37474f",
    '900': "#263238",
    '1000': "#11171a",
  }
};

export { GraphicUtils }
