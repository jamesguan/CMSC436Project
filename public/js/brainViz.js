/**
 * Created by Abhishek on 4/22/2017.
 */


d3.csv("brainRegions.csv", function(error, d) {
    brainRegions = d;
});
d3.csv("brainIndexes.csv", function(error, d) {
    var obj = [];
    d.forEach(function (i) {
        brainIndexes[i.index] = i.region;
    })

});

function brainViz(data, columns,  patientId) {
    $("#scatter").empty();
    $("#legend").empty();
    $("#resizeBox").empty();
    $("#resizeBox").hide();
    $("#resizeBoxText").hide();
    $("#map").hide();
    $("#container").hide();
    $("#legendContainer").height("590");
    /*var patientdata;
    if (!patientId) {
        patientdata = data[0];
    }
    var groupByBrainSlice = d3.nest()
        .key(function (d) {
            return d.z;
        })
        .entries(brainRegions);

    var slice = groupByBrainSlice[5];

    var patientRecords = {};
    var pids = []
    data[columns[0]].forEach(function (obj) {
       // patientRecords[obj.Subject] = {};
        pids.push(obj.Subject);
    })
    for(i=0; i< pids.length; i++){
        var record = [];

        for (br=0; br<brainRegions.length; br++) {
            var obj = {};
            obj.x = brainRegions[br].x;
            obj.y = brainRegions[br].y;
            obj.z = brainRegions[br].z;
            columns.forEach(function (c) {
                var val = parseInt(data[c][i][brainIndexes[brainRegions[br].index].replace("_", " ")]);
                if (val) {
                    obj[c] = val;
                } else {
                    obj[c] = 10;
                }
            })
            obj.region = brainIndexes[brainRegions[br].index].replace("_", " ");
            record.push(obj);
        }

        patientRecords[pids[i]] = record;

    }
    g_patientId = pids[0];
    dataStore = patientRecords[pids[0]];
    quantitySelected = 'Choline';
    createViz(patientRecords[pids[0]], 'Choline');*/
    drawMeanMVCC(data, columns);
    $('.selectpicker').selectpicker('val', ['Choline','Glx', 'NAA', 'Inositol', 'Creatine']);

    $("#scatterDiv").show();





}
