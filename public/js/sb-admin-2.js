$(function() {
    $('#side-menu').metisMenu();
});

//Loads the correct sidebar on window load,
//collapses the sidebar on window resize.
// Sets the min-height of #page-wrapper to window size
$(function() {
    $(window).bind("load resize", function() {
        var topOffset = 50;
        var width = (this.window.innerWidth > 0) ? this.window.innerWidth : this.screen.width;
        if (width < 768) {
            $('div.navbar-collapse').addClass('collapse');
            topOffset = 100; // 2-row-menu
        } else {
            $('div.navbar-collapse').removeClass('collapse');
        }

        var height = ((this.window.innerHeight > 0) ? this.window.innerHeight : this.screen.height) - 1;
        height = height - topOffset;
        if (height < 1) height = 1;
        if (height > topOffset) {
            $("#page-wrapper").css("min-height", (height) + "px");
        }
    });

    var url = window.location;
    // var element = $('ul.nav a').filter(function() {
    //     return this.href == url;
    // }).addClass('active').parent().parent().addClass('in').parent();
    var element = $('ul.nav a').filter(function() {
        return this.href == url;
    }).addClass('active').parent();

    while (true) {
        if (element.is('li')) {
            element = element.parent().addClass('in').parent();
        } else {
            break;
        }
    }
});

const prefNumberSeries = [1,2,5,10,20,50,100,200,500,1000];
var selectedHeight = 50, selectedWidth =50;
var dataStore={};
var brHeight = window.innerHeight - 5;

function readData() {
    d3.csv("spinVSpos.csv", function(error, data) {
        if (error) throw error;
        data = selectRandom1000(data);
        dataStore = data;
        createViz(data);
    });
}

function selectRandom1000(data) {
    var data1 = [];
    for (i=0; i<100; i++) {
        data1[i] = data[Math.round(Math.random()*500000)];
    }
    return createsampleVals(data1);

}

function createViz(data) {
    drawResizeBox();
    var svg = d3.select("#scatter").attr("height", brHeight),
        margin = {top: 20, right: selectedWidth, bottom: selectedHeight, left: 20},
        width = $("#scatter").width(),
        height = brHeight,
        domainwidth = width - margin.left - margin.right,
        domainheight = height - margin.top - margin.bottom;



    var g = svg.append("g")
        .attr("transform", "translate(" + margin.top + "," + margin.left + ")");

    g.append("rect")
        .attr("width", width - margin.left)
        .attr("height", height- margin.top)
        .attr("fill", "#FFFFFF");

        var x = d3.scaleLinear()
            .domain([d3.min(data, function (d) {
                return parseInt(d.x);
            }), d3.max(data, function (d) {
                return parseInt(d.x);
            })])
            .range([0, domainwidth]);
        var y = d3.scaleLinear()
            .domain([d3.min(data, function (d) {
                return parseInt(d.y);
            }), d3.max(data, function (d) {
                return parseInt(d.y);
            })])
            .range([domainheight, 0]);

        data = _.sortBy(data, function(item) {
            return item.val;
        });
        draw(data.reverse(), g, x, y);
}

function createsampleVals(data) {
    data.forEach(function (item) {
        item.val = Math.random()*10000;
    })
    return data;
}

function draw(data, g,x, y) {
    var min = d3.min(data, function (d) {
        return parseInt(d.val);
    });

    var max = d3.max(data, function (d) {
        return parseInt(d.val);
    });

    var normMax = normalizeExtremes(max);
    var ratio = calculateScalingRatio(normMax);
    var groups = legendGroup();

    drawLegend();

    data.forEach(function (item) {
        var dmnsn = getDimensions(item.val, groups, ratio);
        g./*selectAll("rect").
        data(data1).enter().*/
        append("rect").
        attr("x", x(item.x) - dmnsn.width/2).
        attr("y", y(item.y) - dmnsn.height/2).
        attr("width", dmnsn.width).
        attr("stroke", '#FFFFFF').
        attr("fill", '#000000').
        attr("fill-opacity", 1).
        attr("stroke-width", '.1').
        attr("height", dmnsn.height)/*.attr("transform", "translate(" +x(item.x)+","+y(item.y) +") rotate(10)")*/
    })
}

function normalizeExtremes(num) {
    var tens = 0;var norm=0;
    while(num > 10) {
        num = parseInt(num/10);
        tens++;

    }

    if (num >=2 && num<5) {
        norm = 5 * Math.pow(10, tens);
    } else if (num >=0 && num<2) {
        norm = 2 * Math.pow(10, tens);
    } else {
        norm = 10 * Math.pow(10, tens);
    }
    return norm;
}

function calculateScalingRatio(num) {
    return (num/(selectedHeight*selectedWidth));
}

function legendGroup() {
    var arr = [];
    prefNumberSeries.forEach(function(item) {
        if(item<=selectedWidth) {
            var obj = {};
            obj.width = item;
            obj.maxValue = item*selectedHeight;
            arr.push(obj);
        }
    })
    if (prefNumberSeries.indexOf(selectedWidth) == -1) {
        var obj = {};
        obj.width = selectedWidth;
        obj.maxValue = selectedWidth*selectedHeight;
        arr.push(obj);
    }
    return arr;
}

function getDimensions(num, groups, ratio) {
    var scaledValue = parseInt(num/ratio);
    var dmnsn = {};
    groups.some(function (item) {
        if (scaledValue< item.maxValue) {
            dmnsn.width = item.width;
            dmnsn.height = parseInt(scaledValue/item.width);
            return true;
        }
    })
    return dmnsn;
    
}

function drawLegend1() {
    var g = d3.select("#legend").attr("height", brHeight - $("#resizeBox").height()).append("g");
    var h=0;
    for (j=0; j<prefNumberSeries.length; j++) {
        var w=0;
        for (i=1; i<=4; i++) {
            var height=selectedHeight*i/4;
            if (prefNumberSeries[j] <=selectedWidth) {
                g.append("rect").
                attr("x", w).
                attr("y", h+selectedHeight-height).
                attr("width", prefNumberSeries[j]).
                attr("fill", '#000000').
                attr("fill-opacity", 1).
                attr("height", height);
                w+=  prefNumberSeries[j] +10;
            } else if(prefNumberSeries.indexOf(selectedWidth) == -1){
                g.append("rect").
                attr("x", w).
                attr("y", h+selectedHeight-height).
                attr("width", selectedWidth).
                attr("fill", '#000000').
                attr("fill-opacity", 1).
                attr("height", height);
                break;
            } else {
                break;
            }
        }
        h+= selectedHeight+ 40;
    }
}

function drawLegend() {
    var g = d3.select("#legend").attr("height", brHeight - $("#resizeBox").height()).append("g");
    var h=0;
    for (i=1; i<=4; i++) {
        var w=0, height=selectedHeight*i/4;
        for (j=0; j<prefNumberSeries.length; j++) {
            if (prefNumberSeries[j] <=selectedWidth) {
                g.append("rect").
                attr("x", w).
                attr("y", h+selectedHeight-height).
                attr("width", prefNumberSeries[j]).
                attr("fill", '#000000').
                attr("fill-opacity", 1).
                attr("height", height);
                w+=  prefNumberSeries[j] +10;
            } else if(prefNumberSeries.indexOf(selectedWidth) == -1){
                g.append("rect").
                attr("x", w).
                attr("y", h+selectedHeight-height).
                attr("width", selectedWidth).
                attr("fill", '#000000').
                attr("fill-opacity", 1).
                attr("height", height);
                break;
            } else {
                break;
            }
        }
        h+= height+ 40;
    }
}

function drawResizeBox() {
    var R = Raphael("resizeBox", 100, 100),
        c = R.rect(0, 0, selectedWidth, selectedHeight).attr({
            fill: "#000000",
            stroke: "none",
            opacity: 1,
            cursor: "move"
        }),
        s = R.rect(selectedWidth -20 , selectedHeight-20, 20, 20).attr({
            fill: "#000000",
            stroke: "none",
            opacity: 1
        }),
        rstart = function () {
            // storing original coordinates
            this.ox = this.attr("x");
            this.oy = this.attr("y");

            this.box.ow = this.box.attr("width");
            this.box.oh = this.box.attr("height");
        },
        rmove = function (dx, dy) {
            // move will be called with dx and dy
            this.attr({x: this.ox + dx, y: this.oy + dy});
            this.box.attr({width: this.box.ow + dx, height: this.box.oh + dy});

        },
        rend= function() {
            selectedHeight = this.box.attr("height");
            selectedWidth = this.box.attr("width");
            $("#scatter").empty();
            $("#legend").empty();
            $("#resizeBox").empty();
            createViz(dataStore);
            //alert(+ "," + );
        };
    // rstart and rmove are the resize functions;
    //c.drag(move, start, up);
    c.sizer = s;
    s.drag(rmove, rstart, rend);
    s.box = c;

}

function a() {
    create3dViz(dataStore);
}