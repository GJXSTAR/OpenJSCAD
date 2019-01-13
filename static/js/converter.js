$(window).load(function(){

    var reader;
    var progress = document.querySelector('#percent');
    var vertices = [];
    var triangles = [];
    var modules = '';
    var calls = '';
    var vertexIndex = 0;
    var converted = 0;
    var totalObjects = 0;
    var convertedObjects = 0;

    function _reset() {
        vertices = [];
        triangles = [];
        modules = '';
        calls = '';
        vertexIndex = 0;
        converted = 0;
        totalObjects = 0;
        document.getElementById('error').innerText = '';
        document.getElementById('conversion').innerText = '';
    }

    function parseResult(stl) {
        _reset();
        var isAscii = true;

        for (var i = 0; i < stl.length; i++) {

            if (stl[i].charCodeAt(0) == 0) {
                isAscii = false;
                break;
            }
        }
        if (!isAscii) {
            parseBinaryResult(stl);
        } else {

            parseAsciiResult(stl);
        }
    }

    function parseBinaryResult(stl) {
        var br = new BinaryReader(stl);
        br.seek(80);
        var totalTriangles = br.readUInt32();

        for (var tr = 0; tr < totalTriangles; tr++) {
            try {
                document.getElementById('conversion').innerText = '转换进行中';

                br.readFloat();
                br.readFloat();
                br.readFloat();
                var v1 = '[' + br.readFloat() + ',' + br.readFloat() + ',' + br.readFloat() + ']';
                var v2 = '[' + br.readFloat() + ',' + br.readFloat() + ',' + br.readFloat() + ']';
                var v3 = '[' + br.readFloat() + ',' + br.readFloat() + ',' + br.readFloat() + ']';

                var triangle = '[' + (vertexIndex++) + ',' + (vertexIndex++) + ',' + (vertexIndex++) + ']';

                br.readUInt16();

                vertices.push(v1);
                vertices.push(v2);
                vertices.push(v3);
                triangles.push(triangle);
            } catch (err) {
                error(err);
                return;
            }
        }

        saveResult(vertices, triangles);
    }

    function parseAsciiResult(stl) {

        var objects = stl.split('endsolid');

        for (var o = 0; o < objects.length; o++) {

            var patt = /\bloop[\s\S]*?\endloop/mgi;
            var result = '';
            converted = 0;
            match = objects[o].match(patt);
            if (match == null) continue;

            for (var i = 0; i < match.length; i++) {
                try {
                    document.getElementById('conversion').innerText = '转换进行中';

                    var vpatt = /\bvertex\s+(-?\d+\.?\d*\E?\e?\-?\+?\d*\.?\d*)\s+(-?\d+\.?\d*\E?\e?\-?\+?\d*\.?\d*)\s+(-?\d+\.?\d*\E?\e?\-?\+?\d*\.?\d*)\s*vertex\s+(-?\d+\.?\d*\E?\e?\-?\+?\d*\.?\d*)\s+(-?\d+\.?\d*\E?\e?\-?\+?\d*\.?\d*)\s+(-?\d+\.?\d*\E?\e?\-?\+?\d*\.?\d*)\s*vertex\s+(-?\d+\.?\d*\E?\e?\-?\+?\d*\.?\d*)\s+(-?\d+\.?\d*\E?\e?\-?\+?\d*\.?\d*)\s+(-?\d+\.?\d*\E?\e?\-?\+?\d*\.?\d*)\s*/mgi;

                    var v = vpatt.exec(match[i]);
                    if (v == null) continue;

                    if (v.length != 10) {
                        document.getElementById('error').innerText = '无法解析' + match[i];
                        break;
                    }

                    var v1 = '[' + v[1] + ',' + v[2] + ',' + v[3] + ']';
                    var v2 = '[' + v[4] + ',' + v[5] + ',' + v[6] + ']';
                    var v3 = '[' + v[7] + ',' + v[8] + ',' + v[9] + ']';
                    var triangle = '[' + (vertexIndex++) + ',' + (vertexIndex++) + ',' + (vertexIndex++) + ']';
                    //Add 3 vertices for every triangle

                    vertices.push(v1);
                    vertices.push(v2);
                    vertices.push(v3);
                    triangles.push(triangle);
                } catch (err) {
                    error(err);
                    return;
                }
            }

            saveResult(vertices, triangles);
        }
    }

    function error(err) {
        document.getElementById('error').innerText = "尝试转换文件时出错,请确保这是一个有效的STL文件";
        document.getElementById('conversion').innerText = '';
    }

    function saveResult(vertices, triangles) {

        var poly = 'polyhedron(\r\n points=[' + vertices + ' ],\r\nfaces=[' + triangles + ']);';

        calls = calls + 'object' + (++totalObjects) + '(1);\r\n\r\n';

        modules = modules + 'module object' + totalObjects + '(scale) {';
        modules = modules + poly + '}\r\n\r\n';

        result = modules + calls;


        window.URL = window.URL || window.webkitURL;

        var blob = new Blob([result], {
            type: 'text/plain'
        });

        $('a').attr("href", window.URL.createObjectURL(blob));
        $('a').attr("download", "FromSTL.SCAD");

        document.getElementById('conversion').innerText = '转换完成';
    }

    function errorHandler(evt) {
        switch (evt.target.error.code) {
            case evt.target.error.NOT_FOUND_ERR:
                alert('文件未找到！');
                break;
            case evt.target.error.NOT_READABLE_ERR:
                alert('文件不可读');
                break;
            case evt.target.error.ABORT_ERR:
                break; // noop
            default:
                alert('读取此文件时出错');
        };
    }

    function updateProgress(evt) {
        if (evt.lengthComputable) {
            var percentLoaded = Math.round((evt.loaded / evt.total) * 100);
            // Increase the progress bar length.
            if (percentLoaded < 100) {
                progress.style.width = percentLoaded + '%';
                progress.textContent = percentLoaded + '%';
            }
        }
    }


    function handleFileSelect(evt) {
        progress.style.width = '0%';
        progress.textContent = '0%';

        reader = new FileReader();
        reader.onerror = errorHandler;
        reader.onprogress = updateProgress;
        reader.onabort = function (e) {
            alert('文件读取已取消');
        };
        reader.onloadstart = function (e) {
            //document.getElementById('progress_bar').className = 'loading';
        };

        reader.onload = function (e) {
            progress.style.width = '100%';
            progress.textContent = '100%';
            document.getElementById('filename').innerText = document.getElementById('files').files[0].name;

            parseResult(reader.result);
        }

        reader.readAsBinaryString(evt.target.files[0]);
    }

    document.getElementById('files').addEventListener('change', handleFileSelect, false);

});
