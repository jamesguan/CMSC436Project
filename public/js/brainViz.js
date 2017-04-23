/**
 * Created by Abhishek on 4/22/2017.
 */


d3.csv("brainRegions.csv", function(error, d) {
    brainRegions = d;
});
d3.csv("brainIndexes.csv", function(error, d) {
    brainIndexes = d;
});

function brainViz(data, patientId) {
    var patientdata;
    if (!patientId) {
        patientdata = data[0];
    }
    var groupByBrainSlice = d3.nest()
        .key(function (d) {
            return d.z;
        })
        .entries(brainRegions);

    groupByBrainSlice[5];


}