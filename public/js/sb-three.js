/**
 * Created by Abhishek on 3/18/2017.
 */

function create3dViz(data) {
    $("#scatterDiv").hide();
    //$("#legendDiv").hide();
    $("#scatter").empty();
    if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

    //var stats;

    var camera, controls, scene, renderer;

    init();
    render(); // remove when using next line for animation loop (requestAnimationFrame)
    animate();

    function init() {

        scene = new THREE.Scene();
        //scene.fog = new THREE.FogExp2( 0xcccccc, 0.002 );

        renderer = new THREE.WebGLRenderer();
        //renderer.setClearColor( scene.fog.color );
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
        camera.position.z = 500;

        controls = new THREE.OrbitControls( camera );
        controls.addEventListener( 'change', render ); // remove when using animation loop
        // enable animation loop when using damping or autorotation
        //controls.enableDamping = true;
        //controls.dampingFactor = 0.25;
        controls.enableZoom = true;

        /*//adding grid
        var grid = new THREE.GridHelper(500,50);
        var color = new THREE.Color("rgb(255,0,0)");
        grid.setColors(color, 0x000000);
        scene.add(grid);*/


        /*//adding the plane
        var planeGeometry = new THREE.PlaneGeometry(500,500,500);
        var planeMaterial = new THREE.MeshLambertMaterial({color: 0xffffff});
        var plane = new THREE.Mesh(planeGeometry,planeMaterial);
        scene.add(plane);
        plane.rotation.x = -.5*Math.PI;*/

        //Adding the geometry
        var geometry = new THREE.CubeGeometry(500, 500, 500)
        var geo = new THREE.EdgesGeometry( geometry ); // or WireframeGeometry( geometry )

        var mat = new THREE.LineBasicMaterial( { color: 0x000000, linewidth: 2 } );

        var wireframe = new THREE.LineSegments( geo, mat );

        scene.add( wireframe );

        draw3DViz(data,scene);

        // lights

        light = new THREE.DirectionalLight( 0xffffff );
        light.position.set( 1, 1, 1 );
        //scene.add( light );

        light = new THREE.DirectionalLight( 0x002288 );
        light.position.set( -1, -1, -1 );
        //scene.add( light );

        light = new THREE.AmbientLight( 0x222222 );
       // scene.add( light );

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

        //stats.update();

        render();

    }

    function render() {

        renderer.render( scene, camera );

    }

    function draw3DViz(data, scene) {
        var x = d3.scaleLinear()
            .domain([d3.min(data, function (d) {
                return parseInt(d.x);
            }), d3.max(data, function (d) {
                return parseInt(d.x);
            })])
            .range([-250, 250]);
        var y = d3.scaleLinear()
            .domain([d3.min(data, function (d) {
                return parseInt(d.y);
            }), d3.max(data, function (d) {
                return parseInt(d.y);
            })])
            .range([-250, 250]);
        var z = d3.scaleLinear()
            .domain([d3.min(data, function (d) {
                return parseInt(d.z);
            }), d3.max(data, function (d) {
                return parseInt(d.z);
            })])
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
            var geometry = new THREE.PlaneGeometry(dmnsn.width, dmnsn.height);
            var material = new THREE.MeshBasicMaterial({color: 0x000000});

            var mesh = new THREE.Mesh( geometry, material );
            mesh.setColor = function(color){
                mesh.material.color = new THREE.Color(color);
            }


            mesh.setColor("black")  //change color using hex value or
            //mesh.setColor("blue")    //set material color by using color name
            mesh.position.x = x(item.x) - dmnsn.width/2;
            mesh.position.y = y(item.y) - dmnsn.height/2;
            mesh.position.z = z(item.z);
            //mesh.position.z = ( Math.random() - 0.5 ) * 1000;
            //mesh.updateMatrix();
            //mesh.matrixAutoUpdate = false;
            scene.add( mesh )
        }
    }

}