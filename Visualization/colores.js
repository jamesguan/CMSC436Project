function colores_google(n) {
  var colores_g = ["#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99", "#aaaa11", "#6633cc", "#e67300", "#8b0707", "#651067", "#329262", "#5574a6", "#3b3eac"];
  return colores_g[n % colores_g.length];
}

//hexToRgb("#0033ff").g
function hexToRgb(hex){
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;

}

function hexToLuminance(hex, lum) {

	// validate hex string
	hex = String(hex).replace(/[^0-9a-f]/gi, '');
	if (hex.length < 6) {
		hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
	}
	lum = lum || 0;

	// convert to decimal and change luminosity
	var rgb = "#", c, i;
	for (i = 0; i < 3; i++) {
		c = parseInt(hex.substr(i*2,2), 16);
		c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
		rgb += ("00"+c).substr(c.length);
	}

	return rgb;
}

// Deprecated
//var c20c = d3.scale.category20c();

var c20c = d3.scaleOrdinal(d3.schemeCategory20c);

var svg4 = d3.select("#c20c")
             .append("svg")
             .attr("width", 1500)
             .attr("height", 30);

svg4.append("text").attr("x", 80).attr("y", 15).attr("fill", d3.schemeCategory20c[0]).text("Stress");
svg4.append("text").attr("x", 152).attr("y", 15).attr("fill", d3.schemeCategory20c[1]).text("PTSD");
svg4.append("text").attr("x", 220).attr("y", 15).attr("fill", d3.schemeCategory20c[2]).text("Speech");
svg4.append("text").attr("x", 288).attr("y", 15).attr("fill", d3.schemeCategory20c[3]).text("Anxiety");
svg4.append("text").attr("x", 350).attr("y", 15).attr("fill", d3.schemeCategory20c[4]).text("Depression");
svg4.append("text").attr("x", 426).attr("y", 15).attr("fill", d3.schemeCategory20c[5]).text("Headache");
svg4.append("text").attr("x", 510).attr("y", 15).attr("fill", d3.schemeCategory20c[6]).text("Sleep");
svg4.append("text").attr("x", 565).attr("y", 15).attr("fill", d3.schemeCategory20c[7]).text("Audiology");
svg4.append("text").attr("x", 649).attr("y", 15).attr("fill", d3.schemeCategory20c[8]).text("Vision");
svg4.append("text").attr("x", 705).attr("y", 15).attr("fill", d3.schemeCategory20c[9]).text("Neurologic");
svg4.append("text").attr("x", 781).attr("y", 15).attr("fill", d3.schemeCategory20c[10]).text("Alzheimer");
svg4.append("text").attr("x", 854).attr("y", 15).attr("fill", d3.schemeCategory20c[11]).text("Cognitive");
svg4.append("text").attr("x", 942).attr("y", 15).attr("fill", d3.schemeCategory20c[12]).text("PCS");
svg4.append("text").attr("x", 995).attr("y", 15).attr("fill", d3.schemeCategory20c[13]).text("Endocrine");
svg4.append("text").attr("x", 1070).attr("y", 15).attr("fill", d3.schemeCategory20c[14]).text("Skull_inj");
svg4.append("text").attr("x", 1130).attr("y", 15).attr("fill", d3.schemeCategory20c[15]).text("NON_skull_inj");










svg4.selectAll("rect")
    .data( d3.range(16) )
    .enter()
    .append("rect")
    .attr("width", 56 )
    .attr("height", 10)
    .attr("x", d3.scaleLinear().domain([-1, 20]).range([0, 1500]))
    .attr("y", 20)
    .attr("fill", c20c );
