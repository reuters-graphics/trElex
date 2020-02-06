let d3formatter = require("d3-format");
let d3 = Object.assign(d3formatter, require("d3-fetch"), require("d3-time-format"), require("d3-scale"), require("d3-axis"), require("d3-color"), require("d3-path"), require("d3-selection"), require("d3-selection-multi"), require("d3-shape"), require("d3-transition"), require("d3-time"), require("d3-svg-annotation"));

// too attach an annotaiton to a data point, use either category, or date, or the name of a linear column you are plotting for the basescale, and use XXX value XXX for the other axis.

const annotations = function () {
    return [                    

        {
          note: {
            label: gettext("Basic settings with subject position(x,y) and a note offset(dx, dy)"),
            title: gettext("basic"),
            wrap:150,
          },
          data:{date:"01/01/10",value:-50},
          //data:{category:"dogs",value:120000},
          dy: -30,
          dx: 35
        },

        {
          note: {
            label: gettext("Added connector end 'arrow', note wrap '180', and note align 'left'"),
            title: gettext("Arrow"), // commenting this out will make no title
            wrap: 150, // how wide do you want it to be
			//dyOffset:0.8,	            
            align: "left" // will the blurb be centered at the connection point, or left or right aligned?
          },
          className:"special-blurb", // add a specific class
          connector: {
            end: "arrow" // 'dot' also available
          },
          //data:{date:"03/01/2016",value:1978}, // instead of data, you can use a specific x and y, as shown below
		  x:this.width / 2,
		  y:0,
          dy: 80,
          dx: 0
        },

        {
          note: {
            label: gettext("Changed connector type to 'curve'"),
            title: gettext("dot and curve"),
            wrap: 0,
          },
          connector: {
            end: "dot",
            type: "curve", // this adds in teh curve
            points: 1 // number of points on the curve
          },
          data:{date:"03/21/10",value:100},
          dy: 100,
          dx: 100
        },
        
        {
          type: d3.annotationCalloutCircle, // this sets as a circle
          note: {
            label: gettext("A different annotation type"),
            title: gettext("It's a circle"),
            wrap: 100,
			//dyOffset:0.8,	            			            
            align: "middle"		            
          },
          subject: {
            radius: 10
          },
          data:{date:"03/21/10",value:100},

          dy: 115,
          dx: 102
        },
	
		
		{
          type: d3.annotationXYThreshold,	 //vertical line			
		  note: {
		    label: gettext("Longer text to show text wrapping"),
		    title: gettext("Vertical Line")
		  },
          data:{date:"03/21/10"},
		  dy: -this.height / 2,
		  dx: 10,
		  disable:["connector"], //connector, subject or note
		  subject: {
		    y1: 0,
		    y2: this.height
		  }
		},

		{
          type: d3.annotationXYThreshold,	// horizontal line			
		  note: {
		    label: gettext("Longer text to show text wrapping"),
		    title: gettext("Horizontal Line")
		  },
          data:{date:"03/21/10",value:88},
		  dy: 0,
		  dx: 10,
		  disable:["connector"], //connector, subject or note
		  subject: {
		    x1: 0,
		    x2: this.width
		  }

		},

		//makes a box
        {
	      type:d3.annotationCalloutRect,
          note: {
            label: gettext("Basic settings with subject position(x,y) and a note offset(dx, dy)"),
            wrap:150,
			//"align":"end",			            
          },
          data:{date:"03/21/10",value:-150},
          subject:{
	          width:this.scales.x(this.dateParse("02/24/10")) - this.scales.x(this.dateParse("02/17/11")),
	          height:-this.height
          },
          disable:["connector"],
          dy: -176,
          dx: -10
        },					


	]
}

export { annotations }