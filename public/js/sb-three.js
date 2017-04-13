/**
 * Created by Abhishek on 3/18/2017.
 */

const threeDSeries = [1, 10, 20, 50, 100];

var extrudeSettings = { amount: 8, bevelEnabled: true, bevelSegments: 2, steps: 2, bevelSize: 1, bevelThickness: 1 };


function create3dViz(data) {
    if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

    var camera, controls, scene, renderer;

    init();
    render(); // remove when using next line for animation loop (requestAnimationFrame)
    animate();

    function init() {
        //scene.fog = new THREE.FogExp2( 0xcccccc, 0.002 );
        scene = new THREE.Scene();
        renderer = new THREE.WebGLRenderer({
            clearAlpha: 1,
            antialias: true
        });

        renderer.setPixelRatio( window.devicePixelRatio );
        //renderer.setSize( window.innerWidth, window.innerHeight );
        //renderer.setSize( window.innerWidth, window.innerHeight );
		renderer.setSize( 1100, 610 );
        scene.background = new THREE.Color( 0xffffff );

        var container = document.getElementById( 'container' );
        container.appendChild( renderer.domElement );
		
		//height fitting
		var fov = 2 * Math.atan( 500 / ( 2 * 250 ) ) * ( 180 / Math.PI );

        camera = new THREE.PerspectiveCamera( fov, window.innerWidth / window.innerHeight, .1, 2000 );
        camera.position.set(0, 0, 500);

        var light = new THREE.PointLight( 0xffffff, 0.8 );
        camera.add( light );

        controls = new THREE.OrbitControls( camera );
        controls.addEventListener( 'change', render ); // remove when using animation loop

        controls.enableZoom = true;


        //Adding the geometry
        var geometry = new THREE.CubeGeometry(500, 500, 500);
        var geo = new THREE.EdgesGeometry( geometry ); // or WireframeGeometry( geometry )

        var mat = new THREE.LineBasicMaterial( { color: 0x000000, linewidth: 2 } );

        var wireframe = new THREE.LineSegments( geo, mat );

        scene.add( wireframe );

        draw3DViz(data, scene);

        window.addEventListener( 'resize', onWindowResize, false );

    }

    function onWindowResize() {

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize( window.innerWidth, window.innerHeight );

    }

    function animate() {

        requestAnimationFrame( animate );

        controls.update(); // required if controls.enableDamping = true, or if controls.autoRotate = true

        render();

    }

    function render() {

        renderer.render( scene, camera );

    }

    function draw3DViz(data, scene) {
        var x = d3.scaleLinear()
            .domain([d3.min(data, function (d) {
                return parseInt(d.x);
            })-1, d3.max(data, function (d) {
                return parseInt(d.x);
            })+1])
            .range([-250, 250]);
        var y = d3.scaleLinear()
            .domain([d3.min(data, function (d) {
                return parseInt(d.y);
            })-1, d3.max(data, function (d) {
                return parseInt(d.y);
            })+1])
            .range([-250, 250]);
        var z = d3.scaleLinear()
            .domain([d3.min(data, function (d) {
                return parseInt(d.z);
            })-1, d3.max(data, function (d) {
                return parseInt(d.z);
            })+1])
            .range([-250, 250]);

        var max = d3.max(data, function (d) {
            return parseInt(d.val);
        });


        var normMax = normalizeExtremes(max);
        var ratio = calculateScalingRatio(normMax);
        var groups = legendGroup();

        for (i=0; i<data.length; i++) {
            var item = data[i];
            var dmnsn = getDimensions(item.val, groups, ratio);

            var x1 = x(item.x);
            var y1 = y(item.y);
            var z1= z(item.z);
            draw3DLegend();
            plotLegendBar(scene, 0xa6bfed, x1, y1, z1, 1, item, dmnsn);
            drawMagnitude(scene, x1, y1, z1, dmnsn, item);
            drawPosition( scene, x1, y1, z1, item);
        }
    }

}

function draw3DMarkers(data) {
    var max = d3.max(data, function (d) {
        return parseInt(d.val);
    });

    var normMax = normalizeExtremes(max);
    var ratio = calculateScalingRatio(normMax);
    var groups = legendGroup();

    data.forEach(function (item) {
        var dmnsn = getDimensions(item.val, groups, ratio);
    });
}

function plot3DMarkers(dmnsn, item) {
    var geometry = new THREE.Geometry();

    geometry.vertices.push();
    geometry.vertices.push(point);

    var line = new THREE.Line(geometry, new THREE.LineBasicMaterial({}));
}

function obtainVertices(dmnsn, item) {
    var vertices = [];
    var x = x(item.x);
    var y = y(item.y);
    var z = z(item.z);
    vertices.push(new THREE.Vector3( x, y, z));
    vertices.push(new THREE.Vector3( x, y, z));
}

function calculateOrientation(x, a, b) {

}

function drawMagnitude(scene, x, y, z, dmnsn, item) {
    var rectLength = dmnsn.width, rectWidth = dmnsn.height;

    var rectShape = drawRectangle(rectLength/2, rectWidth);
    //addShape( scene, rectShape, extrudeSettings, 0x073f99, x- rectLength/2,  y- rectWidth/2, z, item.directionX, item.directionY, item.directionZ, 1 );
    addShape( scene, rectShape, extrudeSettings, 0x073f99, x,  y, z, item.directionX, item.directionY, item.directionZ, 1 );
}

function drawRectangle(rectLength, rectWidth) {
    var rectShape = new THREE.Shape();
    rectShape.moveTo( 0,0 );
    rectShape.lineTo( 0, rectWidth );
    rectShape.lineTo( rectLength, rectWidth );
    rectShape.lineTo( rectLength, 0 );
    rectShape.lineTo( 0, 0 );
    return rectShape;
}

function drawPosition( scene, x, y, z, item) {

    var circleRadius = 2;
    var circleShape = new THREE.Shape();
    circleShape.moveTo( 0, circleRadius );
    circleShape.quadraticCurveTo( circleRadius, circleRadius, circleRadius, 0 );
    circleShape.quadraticCurveTo( circleRadius, -circleRadius, 0, -circleRadius );
    circleShape.quadraticCurveTo( -circleRadius, -circleRadius, -circleRadius, 0 );
    circleShape.quadraticCurveTo( -circleRadius, circleRadius, 0, circleRadius );
    //addShape( scene, circleShape, extrudeSettings, 0xf70707,  x-dmnsn.width/2 - circleRadius,  y-dmnsn.height/2 - circleRadius, z, 0, 0, 0, 1);
    addShape( scene, circleShape, extrudeSettings, 0xf70707,  x - circleRadius,  y - circleRadius, z, item.directionX, item.directionY, item.directionZ, 1);
}

function addShape( scene, shape, extrudeSettings, color, x, y, z, rx, ry, rz, s ) {
    var geometry = new THREE.ShapeBufferGeometry( shape );

    var mesh = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( {
        color: color,
        opacity:.8,
        transparent : true,
        side: THREE.DoubleSide } ) );
    mesh.position.set( x, y, z );
   // mesh.rotation.set( rx, ry, rz );
    mesh.scale.set( s, s, s );
    scene.add( mesh );
}

function plotLegendBar(scene, color, x, y, z, s, item, dmnsn) {

    //var numOfRect = Math.ceil(dmnsn.width/10);

    var numOfRect = dmnsn.width/10;
    var barWidth = 5;

    if (numOfRect>=1) {
        for (var i=0; i<numOfRect; i++) {
            var shape = drawRectangle(barWidth, selectedHeight);
            shape.autoClose = true;
            var points = shape.createPointsGeometry();
            //var spacedPoints = shape.createSpacedPointsGeometry( 50 );
            // solid line
            var line = new THREE.Line( points, new THREE.LineBasicMaterial( { color: color, linewidth: .1 } ) );
            line.position.set( x + i*barWidth, y, z);
            //line.rotation.set( item.directionX, item.directionY, item.directionZ );
            line.scale.set( s, s, s );
            scene.add( line );
        }
    } /*else {
        console.log("in < 1");
        var shape = drawRectangle(0, selectedHeight);
        shape.autoClose = true;
        var points = shape.createPointsGeometry();
        //var spacedPoints = shape.createSpacedPointsGeometry( 50 );
        // solid line
        var line = new THREE.Line( points, new THREE.LineBasicMaterial( { color: color, linewidth: .1 } ) );
        line.position.set( x, y, z);
       // line.rotation.set( item.directionX, item.directionY, item.directionZ );
        line.scale.set( s, s, s );
        scene.add( line );
    }
*/


}

function draw3DLegend() {
    $("#legend").empty();
    var g = d3.select("#legend").attr("height", 300).
    attr("width", 300).append("g");
    var w=10, h=10;
    var height=selectedHeight;
    for (var i=0; i<prefNumberSeries.length; i++) {
        if (prefNumberSeries[i] > selectedWidth) {
            return;
        }
        if (w+prefNumberSeries > 300) {
            w=10; h+=140;
        }
        g.append("rect").
        attr("x", w).
        attr("y", h).
        attr("width", prefNumberSeries[i]).
        attr("fill", "#ffffff").
        attr("fill-opacity", 1).
        attr("stroke", '#073f99').
        attr("stroke-width", '1').
        attr("height", height);
        g.append("text")
            .attr("x", w-3)
            .attr("y", h+ height +10)
            .attr("dy", ".35em")
            .text(parseInt(prefNumberSeries[i]*height*(scalingRatio)));
        w+=  prefNumberSeries[i] +26;
    }
}

function drawLBs(g) {

}
