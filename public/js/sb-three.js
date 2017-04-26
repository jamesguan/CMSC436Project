/**
 * Created by Abhishek on 3/18/2017.
 */

const threeDSeries = [1, 10, 20, 50, 100];

var extrudeSettings = { amount: 8, bevelEnabled: true, bevelSegments: 2, steps: 2, bevelSize: 1, bevelThickness: 1 };


function create3dViz(data, q) {
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
		renderer.setSize( 1100, 610, false );
        scene.background = new THREE.Color( 0xffffff );

        var container = document.getElementById( 'container' );
        container.appendChild( renderer.domElement );
		
		//height fitting
		var fov = 2 * Math.atan( 500 / ( 2 * 650 ) ) * ( 180 / Math.PI );

        //width fitting
        //var fov = 2 * Math.atan( ( 600 / (1100/610) ) / ( 2 * 350 ) ) * ( 180 / Math.PI );

        camera = new THREE.PerspectiveCamera( fov, window.innerWidth / window.innerHeight, .1, 2000 );
        camera.position.set(0, 0, 1000);

        var light = new THREE.PointLight( 0xffffff, 0.8 );
        camera.add( light );

        controls = new THREE.OrbitControls( camera, container );
        controls.addEventListener( 'change', render ); // remove when using animation loop

        controls.enableZoom = true;


        //Adding the geometry
        var geometry = new THREE.CubeGeometry(600, 500, 500);
        var geo = new THREE.EdgesGeometry( geometry ); // or WireframeGeometry( geometry )

        var mat = new THREE.LineBasicMaterial( { color: 0x767776, linewidth: 2 } );

        var wireframe = new THREE.LineSegments( geo, mat );

        scene.add( wireframe );

        //scene.add( new THREE.AxisHelper( 500 ) );

        draw3DViz(data, scene, q);

        window.addEventListener( 'resize', onWindowResize, false );


    }

    function addLegendLabels(scene, msg, x, y ,z) {
        var loader = new THREE.FontLoader();
        loader.load( '../fonts/helvetiker_regular.typeface.json', function ( font ) {
            var xMid, text;
            var textShape = new THREE.BufferGeometry();
            var color = 0x767776;
            var matDark = new THREE.LineBasicMaterial( {
                color: color,
                side: THREE.DoubleSide
            } );
            var matLite = new THREE.MeshBasicMaterial( {
                color: color,
                transparent: true,
                opacity: 0.8,
                side: THREE.DoubleSide
            } );
            var shapes = font.generateShapes( msg, 10, 2 );
            var geometry = new THREE.ShapeGeometry( shapes );
            geometry.computeBoundingBox();
            xMid = - 0.5 * ( geometry.boundingBox.max.x - geometry.boundingBox.min.x );
            geometry.translate( xMid, 0, 0 );
            // make shape ( N.B. edge view not visible )
            textShape.fromGeometry( geometry );
            text = new THREE.Mesh( textShape, matLite );
            text.position.set( x, y, z);
            scene.add( text );
        } ); //end load function

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

    function draw3DViz(data, scene, q) {
        var xmin = d3.min(data, function (d) {
            return parseInt(d.x);
        })-1;
        var xmax = d3.max(data, function (d) {
                return parseInt(d.x);
            })+1;
        var ymin = d3.min(data, function (d) {
                return parseInt(d.y);
            })-1;
        var ymax = d3.max(data, function (d) {
                return parseInt(d.y);
            })+1;
        var zmin = d3.min(data, function (d) {
                return parseInt(d.z);
            })-1;
        var zmax = d3.max(data, function (d) {
                return parseInt(d.z);
            })+1;
        if (isBrain) {
            xmin=0;
            ymin=0;
            zmin=0;
        }
        var x = d3.scaleLinear()
            .domain([xmin, xmax])
            .range([-300, 300]);
        var y = d3.scaleLinear()
            .domain([ymin, ymax])
            .range([-250, 250]);
        var z = d3.scaleLinear()
            .domain([zmin, zmax])
            .range([-250, 250]);

        var max = d3.max(data, function (d) {
            return parseInt(d[q]);
        });

        var mX = 350;
        addLegendLabels(scene, '('+xmin+','+ymin+','+zmax+')', -mX, -250, 250 );
        addLegendLabels(scene, '('+xmax+','+ymin+','+zmax+')', mX, -250, 250 );
        addLegendLabels(scene, '('+xmin+','+ymax+','+zmax+')', -mX, 250, 250 );
        addLegendLabels(scene, '('+xmax+','+ymax+','+zmax+')', mX, 250, 250 );
        addLegendLabels(scene, '('+xmax+','+ymax+','+zmin+')', mX, 250, -250 );
        addLegendLabels(scene, '('+xmax+','+ymin+','+zmin+')', mX, -250, -250 );
        addLegendLabels(scene, '('+xmin+','+ymin+','+zmin+')', -mX, -250, -250 );
        addLegendLabels(scene, '('+xmin+','+ymax+','+zmin+')', -mX, 250, -250 );

        var normMax = normalizeExtremes(max);
        var ratio = calculateScalingRatio(normMax);
        var groups = legendGroup();

        for (i=0; i<data.length; i++) {
            var item = data[i];
            var dmnsn = getDimensions(item[q], groups, ratio);

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

function draw3DMarkers(data, q) {
    var max = d3.max(data, function (d) {
        return parseInt(d[q]);
    });

    var normMax = normalizeExtremes(max);
    var ratio = calculateScalingRatio(normMax);
    var groups = legendGroup();

    data.forEach(function (item) {
        var dmnsn = getDimensions(item[q], groups, ratio);
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
    //mesh.rotation.set( rx, ry, rz );
    mesh.scale.set( s, s, s );
    scene.add( mesh );
}

/*function plotLegendBar(scene, color, x, y, z, s, item, dmnsn) {

    //var numOfRect = Math.ceil(dmnsn.width/10);

    var numOfRect = dmnsn.width/10;
    var barWidth = 5;

    if (numOfRect>=1) {
        for (var i=0; i<numOfRect; i++) {
            var shape = drawRectangle(barWidth, selectedHeight);
            shape.autoClose = true;
            var points = shape.createPointsGeometry();

            var line = new THREE.Line( points, new THREE.LineBasicMaterial( { color: color, linewidth: .1 } ) );
            line.position.set( x + i*barWidth, y, z);
            //line.rotation.set( item.directionX, item.directionY, item.directionZ );
            line.scale.set( s, s, s );
            scene.add( line );
        }
    }
}*/

function plotLegendBar(scene, color, x, y, z, s, item, dmnsn) {

    //var numOfRect = Math.ceil(dmnsn.width/10);

    var numOfRect = dmnsn.width/10;
    var barWidth = 5;

    if (numOfRect>=1) {
        //for (var i=0; i<numOfRect; i++) {
            var shape = drawRectangle1(barWidth, selectedHeight, numOfRect);
            shape.autoClose = true;
            var points = shape.createPointsGeometry();

            //var geo = new THREE.EdgesGeometry( points ); // or WireframeGeometry( geometry )

            var line = new THREE.Line( points, new THREE.LineBasicMaterial( { color: color, linewidth: .1 } ) );
            //var line = new THREE.Line( geo, new THREE.LineBasicMaterial( { color: color, linewidth: .1 } ) );
            line.position.set( x , y, z);
            //line.rotation.set( item.directionX, item.directionY, item.directionZ );
            line.scale.set( s, s, s );
            scene.add( line );
        //}
    }
}

function drawRectangle1(rectLength, rectWidth, n) {
    var rectShape = new THREE.Shape();
    //rectShape.lineTo( rectLength*n, 0 );
    //rectShape.lineTo( 0, 0 );
    rectShape.moveTo(0,0);
    for (var i=1; i<=n; i++) {
        rectShape.lineTo( (i-1)*rectLength,rectWidth);
        rectShape.moveTo(i*rectLength, rectWidth);
        rectShape.lineTo( i*rectLength, 0 );
        //rectShape.lineTo( rectLength*n, rectWidth );
        //rectShape.moveTo( rectLength*i, 0 );
        //rectShape.lineTo( rectLength*i,rectWidth );
        //rectShape.moveTo( rectLength*i, 0 );
        //rectShape.moveTo( rectLength*i, 0 );

    }
    return rectShape;

}

function mergeMeshes (meshes) {
    var combined = new THREE.Geometry();

    for (var i = 0; i < meshes.length; i++) {
        meshes[i].updateMatrix();
        combined.merge(meshes[i].geometry, meshes[i].matrix);
    }

    return combined;
}

function draw3DLegend() {
    $("#legend").empty();
    var g = d3.select("#legend").attr("height", 300).
    attr("width", 200).append("g");
    var w=10, h=10;
    var height=selectedHeight;
    for (var i=0; i<prefNumberSeries.length; i++) {
        if (prefNumberSeries[i] > selectedWidth) {
            return;
        }
        if (w+prefNumberSeries > 200) {
            w=10; h+=140;
        }
        drawLegendRects(g, w, h, prefNumberSeries[i], height, scalingRatio)
        w+=  prefNumberSeries[i] +26;
    }
}

function drawLBs(g, w, h, width, height, scalingRatio) {
    var fillClr = "#ffffff";
   // var strkClr = "#073f99";
    var strkClr = "#000000";
    var strokeWidth = '.2';
    if (width > 1) {
        strokeWidth = '.5';
    }
    g.append("rect").
    attr("x", w).
    attr("y", h).
    attr("width", width).
    attr("fill", fillClr).
    attr("fill-opacity", 1).
    attr("stroke", strkClr).
    attr("stroke-opacity", 1).
    attr("stroke-width", strokeWidth).
    attr("height", height);
}

function drawLegendRects(g, w, h, width, height, scalingRatio) {
    var numOfRect = width/10;
    var barWidth = 5;

    if (numOfRect>=1) {
        for (var i=0; i<numOfRect; i++) {
            drawLBs(g, w+ i*barWidth, h, barWidth, height, scalingRatio);
        }
    } else {
        drawLBs(g, w, h, 1, height, scalingRatio);
    }

    g.append("text")
        .attr("x", w-3)
        .attr("y", h+ height +10)
        .attr("dy", ".35em")
        .text(parseInt(width*height*(scalingRatio)));
}
