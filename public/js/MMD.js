/**
 * MMD.js
 * @version 0.1
 * @requires three.js r50 or later
 * @author <a href="http://www20.atpages.jp/katwat/wp/">katwat</a>
 */

THREE.MMDLoader = function () {
};

THREE.MMDLoader.prototype = {
	constructor: THREE.MMDLoader,
	crossOrigin: 'anonymous',
	monitor: null, // loading monitor
	hasNormalMap: false,
	extractUrlBase: function ( url ) {

		var parts = url.split( '/' );
		parts.pop();
		return ( parts.length < 1 ? '.' : parts.join( '/' ) ) + '/';

	},
	initMaterials: function ( geometry, materials, texturePath ) {

		geometry.materials = [];

		for ( var i = 0; i < materials.length; ++ i ) {

			geometry.materials[ i ] = this.createMaterial( materials[ i ], texturePath );

		}

	},
	createMaterial: function ( m, texturePath ) {

		var that = this;

		function is_pow2( n ) {

			var l = Math.log( n ) / Math.LN2;
			return Math.floor( l ) == l;

		}

		function nearest_pow2( n ) {

			var l = Math.log( n ) / Math.LN2;
			return Math.pow( 2, Math.round(  l ) );

		}

		function load_image( where, url ) {

			var image = new Image();

			var et = new THREE.EventTarget();
			if (that.monitor) {
				that.monitor.add(et);
			}

			image.onload = function () {

				if ( !is_pow2( this.width ) || !is_pow2( this.height ) ) {

					var width = nearest_pow2( this.width );
					var height = nearest_pow2( this.height );

					where.image.width = width;
					where.image.height = height;
					where.image.getContext( '2d' ).drawImage( this, 0, 0, width, height );

				} else {

					where.image = this;

				}

				where.needsUpdate = true;

				et.dispatchEvent( { type: 'load' } );
			};

			image.crossOrigin = that.crossOrigin;
			image.src = url;

		}

		function create_texture( where, name, sourceFile, repeat, offset, wrap ) {

			var texture = document.createElement( 'canvas' );

			where[ name ] = new THREE.Texture( texture );
			where[ name ].sourceFile = sourceFile;

			if( repeat ) {

				where[ name ].repeat.set( repeat[ 0 ], repeat[ 1 ] );

				if ( repeat[ 0 ] !== 1 ) where[ name ].wrapS = THREE.RepeatWrapping;
				if ( repeat[ 1 ] !== 1 ) where[ name ].wrapT = THREE.RepeatWrapping;

			}

			if ( offset ) {

				where[ name ].offset.set( offset[ 0 ], offset[ 1 ] );

			}

			if ( wrap ) {

				var wrapMap = {
					"repeat": THREE.RepeatWrapping,
					"mirror": THREE.MirroredRepeatWrapping
				}

				if ( wrapMap[ wrap[ 0 ] ] !== undefined ) where[ name ].wrapS = wrapMap[ wrap[ 0 ] ];
				if ( wrapMap[ wrap[ 1 ] ] !== undefined ) where[ name ].wrapT = wrapMap[ wrap[ 1 ] ];

			}

			load_image( where[ name ], texturePath + sourceFile );

		}

		function rgb2hex( rgb ) {

			return ( rgb[ 0 ] * 255 << 16 ) + ( rgb[ 1 ] * 255 << 8 ) + rgb[ 2 ] * 255;

		}

		// defaults

		var mtype = "MeshLambertMaterial";
		var mpars = { color: 0xeeeeee, opacity: 1.0, map: null, lightMap: null, normalMap: null, bumpMap: null, wireframe: false };

		// parameters from model file

		if ( m.shading ) {

			var shading = m.shading.toLowerCase();

			if ( shading === "phong" ) mtype = "MeshPhongMaterial";
			else if ( shading === "basic" ) mtype = "MeshBasicMaterial";
			else if ( shading === "mmd" ) mtype = "MMDMaterial";
			else mtype = m.shading;
		}

		if ( m.blending !== undefined && THREE[ m.blending ] !== undefined ) {

			mpars.blending = THREE[ m.blending ];

		}

		if ( m.transparent !== undefined || m.opacity < 1.0 ) {

			mpars.transparent = m.transparent;

		}

		if ( m.depthTest !== undefined ) {

			mpars.depthTest = m.depthTest;

		}

		if ( m.depthWrite !== undefined ) {

			mpars.depthWrite = m.depthWrite;

		}

		if ( m.visible !== undefined ) {

			mpars.visible = m.visible;

		}

		if ( m.flipSided !== undefined ) {

			mpars.side = THREE.BackSide;

		}

		if ( m.doubleSided !== undefined ) {

			mpars.side = THREE.DoubleSide;

		}

		if ( m.wireframe !== undefined ) {

			mpars.wireframe = m.wireframe;

		}

		if ( m.vertexColors !== undefined ) {

			if ( m.vertexColors == "face" ) {

				mpars.vertexColors = THREE.FaceColors;

			} else if ( m.vertexColors ) {

				mpars.vertexColors = THREE.VertexColors;

			}

		}

		// colors

		if ( m.colorDiffuse ) {

			mpars.color = rgb2hex( m.colorDiffuse );

		} else if ( m.DbgColor ) {

			mpars.color = m.DbgColor;

		}

		if ( m.colorSpecular ) {

			mpars.specular = rgb2hex( m.colorSpecular );

		}

		if ( m.colorAmbient ) {

			mpars.ambient = rgb2hex( m.colorAmbient );

		}

		// modifiers

		if ( m.transparency ) {

			mpars.opacity = m.transparency;

		}

		if ( m.specularCoef ) {

			mpars.shininess = m.specularCoef;

		}

		// textures

		if ( m.mapDiffuse /* && texturePath */) {

			create_texture( mpars, "map", m.mapDiffuse, m.mapDiffuseRepeat, m.mapDiffuseOffset, m.mapDiffuseWrap );

		}

		if ( m.mapLight /* && texturePath */) {

			create_texture( mpars, "lightMap", m.mapLight, m.mapLightRepeat, m.mapLightOffset, m.mapLightWrap );

		}

		if ( m.mapBump /* && texturePath */ ) {

			create_texture( mpars, "bumpMap", m.mapBump, m.mapBumpRepeat, m.mapBumpOffset, m.mapBumpWrap );

		}

		if ( m.mapNormal /* && texturePath */) {

			create_texture( mpars, "normalMap", m.mapNormal, m.mapNormalRepeat, m.mapNormalOffset, m.mapNormalWrap );

		}

		if ( m.mapSpecular /* && texturePath */) {

			create_texture( mpars, "specularMap", m.mapSpecular, m.mapSpecularRepeat, m.mapSpecularOffset, m.mapSpecularWrap );

		}

		// special case for normal mapped material

		if ( m.mapNormal ) {

			var shader = THREE.ShaderUtils.lib[ "normal" ];
			var uniforms = THREE.UniformsUtils.clone( shader.uniforms );

			uniforms[ "tNormal" ].texture = mpars.normalMap;

			if ( m.mapNormalFactor ) {

				uniforms[ "uNormalScale" ].value = m.mapNormalFactor;

			}

			if ( mpars.map ) {

				uniforms[ "tDiffuse" ].texture = mpars.map;
				uniforms[ "enableDiffuse" ].value = true;

			}

			if ( mpars.specularMap ) {

				uniforms[ "tSpecular" ].texture = mpars.specularMap;
				uniforms[ "enableSpecular" ].value = true;

			}

			if ( mpars.lightMap ) {

				uniforms[ "tAO" ].texture = mpars.lightMap;
				uniforms[ "enableAO" ].value = true;

			}

			// for the moment don't handle displacement texture

			uniforms[ "uDiffuseColor" ].value.setHex( mpars.color );
			uniforms[ "uSpecularColor" ].value.setHex( mpars.specular );
			uniforms[ "uAmbientColor" ].value.setHex( mpars.ambient );

			uniforms[ "uShininess" ].value = mpars.shininess;

			if ( mpars.opacity !== undefined ) {

				uniforms[ "uOpacity" ].value = mpars.opacity;

			}

			var parameters = { fragmentShader: shader.fragmentShader, vertexShader: shader.vertexShader, uniforms: uniforms, lights: true, fog: true };
			var material = new THREE.ShaderMaterial( parameters );
			this.hasNormalMap = true;

		} else {

			var material = new THREE[ mtype ]( mpars );

		}

		if ( m.DbgName !== undefined ) material.name = m.DbgName;

		return material;

	},
	load: function ( url, callback, texturePath, callbackProgress ) {
		var that = this;
	
		texturePath = texturePath || this.extractUrlBase( url );
	
		var xhr = new XMLHttpRequest();
	
		var length = 0;
	
		xhr.onreadystatechange = function () {
	
			if ( xhr.readyState === xhr.DONE ) {
	
				if ( xhr.status === 200 || xhr.status === 0 ) {
	
					if ( xhr.responseText ) {
	
						that.createModel( JSON.parse( xhr.responseText ), callback, texturePath, callbackProgress );
	
					} else {
	
						console.warn( "THREE.MMDLoader: [" + url + "] seems to be unreachable or file there is empty" );
	
					}
	
					// in context of more complex asset initialization
					// do not block on single failed file
					// maybe should go even one more level up
	
				} else {
	
					console.error( "THREE.MMDLoader: Couldn't load [" + url + "] [" + xhr.status + "]" );
	
				}
	
			} else if ( xhr.readyState === xhr.LOADING ) {
	
				if ( callbackProgress ) {
	
					if ( length === 0 ) {
	
						length = xhr.getResponseHeader( "Content-Length" );
	
					}
	
					callbackProgress( { total: length, loaded: xhr.responseText.length } );
	
				}
	
			} else if ( xhr.readyState === xhr.HEADERS_RECEIVED ) {
	
				length = xhr.getResponseHeader( "Content-Length" );
	
			}
	
		};
	
		xhr.open( "GET", url, true );
		//if ( xhr.overrideMimeType ) xhr.overrideMimeType( "text/plain; charset=x-user-defined" );
		//xhr.setRequestHeader( "Content-Type", "text/plain" );
		xhr.send( null );
	
	},
	createModel: function ( json, callback, texturePath, callbackProgress ) {
		var that = this;
		var geometry = new THREE.Geometry();
		//var scale = ( json.scale !== undefined ) ? 1.0 / json.scale : 1.0;
		var et = new THREE.EventTarget();
		this.monitor = new THREE.LoadingMonitor();
		this.monitor.addEventListener('progress',function(ev){
			if (callbackProgress) callbackProgress(ev);
		});
		this.monitor.addEventListener('load',function(ev){
			callback(geometry,json);
			that.monitor = null; // done
		});
		this.monitor.add(et);
		this.initMaterials( geometry, json.materials, texturePath );
	
		parseModel( /* scale */);
	
		parseSkin();
		parseMorphing( /* scale */ );
	
		geometry.computeCentroids();
		geometry.computeFaceNormals();
	
		if ( this.hasNormalMap ) geometry.computeTangents();

		geometry.MMDIKs = json.MMDIKs;
		et.dispatchEvent( { type: 'load' } ); //callback( geometry );
	
		function parseModel( /* scale */ ) {
	
			function isBitSet( value, position ) {
	
				return value & ( 1 << position );
	
			}
	
			var i, j, fi,
	
			offset, zLength, nVertices,
	
			colorIndex, normalIndex, uvIndex, materialIndex,
	
			type,
			isQuad,
			hasMaterial,
			hasFaceUv, hasFaceVertexUv,
			hasFaceNormal, hasFaceVertexNormal,
			hasFaceColor, hasFaceVertexColor,
	
			vertex, face, color, normal,
	
			uvLayer, uvs, u, v,
	
			faces = json.faces,
			vertices = json.vertices,
			normals = json.normals,
			colors = json.colors,
	
			nUvLayers = 0;
	
			// disregard empty arrays
	
			for ( i = 0; i < json.uvs.length; i++ ) {
	
				if ( json.uvs[ i ].length ) nUvLayers ++;
	
			}
	
			for ( i = 0; i < nUvLayers; i++ ) {
	
				geometry.faceUvs[ i ] = [];
				geometry.faceVertexUvs[ i ] = [];
	
			}
	
			offset = 0;
			zLength = vertices.length;
	
			while ( offset < zLength ) {
	
				vertex = new THREE.Vector3();
	
				vertex.x = vertices[ offset ++ ];// * scale;
				vertex.y = vertices[ offset ++ ];// * scale;
				vertex.z = vertices[ offset ++ ];// * scale;
	
				geometry.vertices.push( vertex );
	
			}
	
			offset = 0;
			zLength = faces.length;
	
			while ( offset < zLength ) {
	
				type = faces[ offset ++ ];
	
	
				isQuad          	= isBitSet( type, 0 );
				hasMaterial         = isBitSet( type, 1 );
				hasFaceUv           = isBitSet( type, 2 );
				hasFaceVertexUv     = isBitSet( type, 3 );
				hasFaceNormal       = isBitSet( type, 4 );
				hasFaceVertexNormal = isBitSet( type, 5 );
				hasFaceColor	    = isBitSet( type, 6 );
				hasFaceVertexColor  = isBitSet( type, 7 );
	
				//console.log("type", type, "bits", isQuad, hasMaterial, hasFaceUv, hasFaceVertexUv, hasFaceNormal, hasFaceVertexNormal, hasFaceColor, hasFaceVertexColor);
	
				if ( isQuad ) {
	
					face = new THREE.Face4();
	
					face.a = faces[ offset ++ ];
					face.b = faces[ offset ++ ];
					face.c = faces[ offset ++ ];
					face.d = faces[ offset ++ ];
	
					nVertices = 4;
	
				} else {
	
					face = new THREE.Face3();
	
					face.a = faces[ offset ++ ];
					face.b = faces[ offset ++ ];
					face.c = faces[ offset ++ ];
	
					nVertices = 3;
	
				}
	
				if ( hasMaterial ) {
	
					materialIndex = faces[ offset ++ ];
					face.materialIndex = materialIndex;
	
				}
	
				// to get face <=> uv index correspondence
	
				fi = geometry.faces.length;
	
				if ( hasFaceUv ) {
	
					for ( i = 0; i < nUvLayers; i++ ) {
	
						uvLayer = json.uvs[ i ];
	
						uvIndex = faces[ offset ++ ];
	
						u = uvLayer[ uvIndex * 2 ];
						v = uvLayer[ uvIndex * 2 + 1 ];
	
						geometry.faceUvs[ i ][ fi ] = new THREE.UV( u, v );
	
					}
	
				}
	
				if ( hasFaceVertexUv ) {
	
					for ( i = 0; i < nUvLayers; i++ ) {
	
						uvLayer = json.uvs[ i ];
	
						uvs = [];
	
						for ( j = 0; j < nVertices; j ++ ) {
	
							uvIndex = faces[ offset ++ ];
	
							u = uvLayer[ uvIndex * 2 ];
							v = uvLayer[ uvIndex * 2 + 1 ];
	
							uvs[ j ] = new THREE.UV( u, v );
	
						}
	
						geometry.faceVertexUvs[ i ][ fi ] = uvs;
	
					}
	
				}
	
				if ( hasFaceNormal ) {
	
					normalIndex = faces[ offset ++ ] * 3;
	
					normal = new THREE.Vector3();
	
					normal.x = normals[ normalIndex ++ ];
					normal.y = normals[ normalIndex ++ ];
					normal.z = normals[ normalIndex ];
	
					face.normal = normal;
	
				}
	
				if ( hasFaceVertexNormal ) {
	
					for ( i = 0; i < nVertices; i++ ) {
	
						normalIndex = faces[ offset ++ ] * 3;
	
						normal = new THREE.Vector3();
	
						normal.x = normals[ normalIndex ++ ];
						normal.y = normals[ normalIndex ++ ];
						normal.z = normals[ normalIndex ];
	
						face.vertexNormals.push( normal );
	
					}
	
				}
	
	
				if ( hasFaceColor ) {
	
					colorIndex = faces[ offset ++ ];
	
					color = new THREE.Color( colors[ colorIndex ] );
					face.color = color;
	
				}
	
	
				if ( hasFaceVertexColor ) {
	
					for ( i = 0; i < nVertices; i++ ) {
	
						colorIndex = faces[ offset ++ ];
	
						color = new THREE.Color( colors[ colorIndex ] );
						face.vertexColors.push( color );
	
					}
	
				}
	
				geometry.faces.push( face );
	
			}
	
		};
	
		function parseSkin() {
	
			var i, l, x, y, z, w, a, b, c, d;
	
			if ( json.skinWeights ) {
	
				for ( i = 0, l = json.skinWeights.length; i < l; i += 2 ) {
	
					x = json.skinWeights[ i     ];
					y = json.skinWeights[ i + 1 ];
					z = 0;
					w = 0;
	
					geometry.skinWeights.push( new THREE.Vector4( x, y, z, w ) );
	
				}
	
			}
	
			if ( json.skinIndices ) {
	
				for ( i = 0, l = json.skinIndices.length; i < l; i += 2 ) {
	
					a = json.skinIndices[ i     ];
					b = json.skinIndices[ i + 1 ];
					c = 0;
					d = 0;
	
					geometry.skinIndices.push( new THREE.Vector4( a, b, c, d ) );
	
				}
	
			}
	
			geometry.bones = json.bones;
			geometry.animation = json.animation;
	
		};
	
		function parseMorphing( /* scale */ ) {
	
			if ( json.morphTargets !== undefined ) {
	
				var i, l, v, vl, dstVertices, srcVertices;
	
				for ( i = 0, l = json.morphTargets.length; i < l; i ++ ) {
	
					geometry.morphTargets[ i ] = {};
					geometry.morphTargets[ i ].name = json.morphTargets[ i ].name;
					geometry.morphTargets[ i ].vertices = [];
	
					dstVertices = geometry.morphTargets[ i ].vertices;
					srcVertices = json.morphTargets [ i ].vertices;
	
					for( v = 0, vl = srcVertices.length; v < vl; v += 3 ) {
	
						var vertex = new THREE.Vector3();
						vertex.x = srcVertices[ v ];// * scale;
						vertex.y = srcVertices[ v + 1 ];// * scale;
						vertex.z = srcVertices[ v + 2 ];// * scale;
	
						dstVertices.push( vertex );
	
					}
	
				}
	
			}
	
			if ( json.morphColors !== undefined ) {
	
				var i, l, c, cl, dstColors, srcColors, color;
	
				for ( i = 0, l = json.morphColors.length; i < l; i++ ) {
	
					geometry.morphColors[ i ] = {};
					geometry.morphColors[ i ].name = json.morphColors[ i ].name;
					geometry.morphColors[ i ].colors = [];
	
					dstColors = geometry.morphColors[ i ].colors;
					srcColors = json.morphColors [ i ].colors;
	
					for ( c = 0, cl = srcColors.length; c < cl; c += 3 ) {
	
						color = new THREE.Color( 0xffaa00 );
						color.setRGB( srcColors[ c ], srcColors[ c + 1 ], srcColors[ c + 2 ] );
						dstColors.push( color );
	
					}
	
				}
	
			}
	
		};
	}
};

THREE.MMDIK = function (mesh) {
	this.mesh = mesh;
};
THREE.MMDIK.prototype = {
	constructor: THREE.MMDIK,
	update: function() {
		var a,iks,ik,ikl,i,j,il,jl,bones,target,effector,link,targetPos,effectorPos,linkPos,mtx,targetVec,effectorVec,angle,axis,q,c;
		effectorVec = new THREE.Vector3();
		targetVec = new THREE.Vector3();
		axis = new THREE.Vector3();
		mtx = new THREE.Matrix4();
		q = new THREE.Quaternion();
		bones = this.mesh.bones;
		iks = this.mesh.geometry.MMDIKs;
		for (a=0;a<iks.length;a++) {
			ik = iks[a];
			effector = bones[ik.effector];
			target = bones[ik.target];
			targetPos = this.getGlobalPosition(target);
			il = ik.iteration;
			jl = ik.links.length
			for (i=0;i<il;i++) {
				for (j=0;j<jl;j++) {
					ikl = ik.links[j];				
					link = bones[ikl.bone];
					linkPos = this.getGlobalPosition(link);
					mtx.getInverse(this.getGlobalRotationMatrix(link));
					effectorPos = this.getGlobalPosition(effector);
					effectorVec = (mtx.multiplyVector3( effectorVec.sub(effectorPos, linkPos) )).normalize();
					targetVec = (mtx.multiplyVector3( targetVec.sub(targetPos, linkPos) )).normalize();
					angle = targetVec.dot(effectorVec);
					if (angle > 1 - 1.0e-5) { // 発散対策
						continue;
					}
					angle = Math.acos(angle);
					if (angle < 1.0e-3) { // 発散対策
						continue;
					}
					if (angle > ik.control) {
						angle = ik.control;
					}
					q.setFromAxisAngle( (axis.cross(effectorVec, targetVec)).normalize(), angle);
					link.quaternion.multiply(link.quaternion,q);
					if (ikl.limits) { // 実質的に「ひざ」限定。
						c = link.quaternion.w;
						link.quaternion.set(Math.sqrt(1 - c * c), 0, 0, c); // x only
					}
				}
			}
		}
	},
	getMatrix: function(bone) {
		var m = bone.matrix;
		m.identity();
		m.setPosition(bone.position);
		m.setRotationFromQuaternion(bone.quaternion);
		return m;
	},
	getGlobalPosition: function(bone) {
		var pos = bone.position.clone();
		while (bone.parent !== this.model) {
			bone = bone.parent;
			pos = this.getMatrix(bone).multiplyVector3(pos);
		}
		return pos;
	},
	getRotationMatrix: function(bone) {
		var m = bone.matrix;
		m.identity();
		m.setRotationFromQuaternion(bone.quaternion);
		return m;
	},
	getGlobalRotationMatrix: function(bone) {
		var mat = this.getRotationMatrix(bone).clone();
		while (bone.parent !== this.model) {
			bone = bone.parent;
			mat.multiply(this.getRotationMatrix(bone), mat);
		}
		return mat;
	}
};
