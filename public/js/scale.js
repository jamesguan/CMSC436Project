var base = d3.select("#overlay");
//var sidebase = d3.select("#sidebar");

var display = base.append("canvas").attr("width", 15700).attr("height", 1999);
//var sidedisplay = base.append("canvas").attr("width", 100).attr("height", 1710);

var ctx = display.node().getContext("2d");
//var sidectx = sidedisplay.node().getContext("2d");

ctx.font = "18px Open Sans";
ctx.textAlign = "start";
ctx.textBaseline = "hanging"

function drawScale(){
  ctx.strokeStyle="#434242";
  ctx.rect(30, 100, 40, 400);

  ctx.fillText("Depth Scale", 5, 50);
  ctx.fillText("0", 5, 95);
  ctx.fillText("40", 5, 493);
  ctx.font = "14px Open Sans";
  ctx.fillText("By:", 5, 530);
  

  ctx.fillText("Abhishek", 5, 550);
  ctx.fillText("John", 5, 570);
  ctx.fillText("James", 5, 590);
  for (var i = 0; i < 40; i++){
     //ctx.strokeStyle= rgb(0, 240 - (i * 4), 215 + i);
     ctx.fillStyle = rgb(0, 240 - (i * 4), 215 + i);
     ctx.fillRect(31, 100 + (i * 10), 38, 10);
  }
  ctx.stroke();
}

