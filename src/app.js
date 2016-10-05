// Here is the starting point for your application code.
// All stuff below is just to show you how it works. You can delete all of it.

// Use new ES6 modules syntax for everything.
import os from 'os'; // native node.js module
import {
    remote
}
from 'electron'; // native electron module
import jetpack from 'fs-jetpack'; // module loaded from npm
import {
    greet
}
from './hello_world/hello_world'; // code authored by you in this project
import {
    ROOT_KIND, FOLDER_KIND, FILE_KIND, ProjectTree, Translator
}
from './tree/project_tree';
import {
    Scanner
}
from './file_discover/scanner';
import env from './env';

console.log('Loaded environment variables:', env);

var app = remote.app;
var appDir = jetpack.cwd(app.getAppPath());

document.addEventListener('DOMContentLoaded', function () {
    //    let dirpath = 'D:/ID Design Email/';
    //    let dirpath = 'D:/Workspace/Desktop/project-tree/';
    let dirpath = 'D:/Ambiente/Workspace/PHP/zenfreela';
    let scanner = new Scanner(dirpath);
    scanner.addIgnoredFolder('node_modules');
    scanner.addIgnoredFolder('.git');
    scanner.addIgnoredFolder('dist');
    scanner.addIgnoredFolder('.settings');

    scanner.scan();

    let translator = new Translator(scanner.info);
    let maxSize = translator.translate();

    let projectTree = new ProjectTree(document.getElementById('graph'));
    projectTree.addOption('nodes', {
        shape: 'dot'
    });

    //    projectTree.addOption('layout',{
    //        hierarchical: {
    //            direction: "UD",
    //            sortMethod: "directed",
    //        }
    //    });

//    projectTree.addOption('physics', {
//        enabled: true,
//        barnesHut: {
//            gravitationalConstant: -50000,
//            centralGravity: 0.1,
//            springLength: 500,
//            springConstant: 0.005,
//            damping: 0.1,
//            nodeSpacing: maxSize*3,
//            avoidOverlap: 0.2
//        },
//        minVelocity: 0.75,
//        stabilization: {
//            enabled: true,
//            iterations: 1000,
//            updateInterval: 30
//        }
//    });

    console.log(translator.translatedInfo);
    projectTree.setNodes(translator.translatedInfo.nodes);
    projectTree.setEdges(translator.translatedInfo.edges);

    projectTree.setOnClickHandler((evt, tree) => {
        let nodes = evt.nodes;

        let details = document.getElementById('details');
        let name = document.getElementById('selectedName');
        let kind = document.getElementById('selectedType');
        let meta = document.getElementById('selectedMeta');

        if (nodes.length == 1) {
            let nodeId = nodes[0];

            let node = tree.nodeDataSet.get(nodeId);

            name.innerHTML = node.label;
            kind.innerHTML = node.kind.label;
            meta.innerHTML = node.meta;

            details.style.backgroundColor = node.color.background;
        } else {

            let defaultLabel = 'None';

            name.innerHTML = defaultLabel;
            kind.innerHTML = defaultLabel;
            meta.innerHTML = defaultLabel;

            details.style.backgroundColor = '#000';
        }
    });

    let network = projectTree.render();

    network.on("stabilizationProgress", function (params) {
        var maxWidth = 496;
        var minWidth = 20;
        var widthFactor = params.iterations / params.total;
        var width = Math.max(minWidth, maxWidth * widthFactor);

        document.getElementById('loadingProgress').style.width = width + 'px';
        document.getElementById('loadingText').innerHTML = Math.round(widthFactor * 100) + '%';
    });
    network.once("stabilizationIterationsDone", function () {
        document.getElementById('loadingText').innerHTML = '100%';
        document.getElementById('loadingProgress').style.width = '496px';
        document.getElementById('loadingBar').style.opacity = 0;
        document.getElementById('details').style.opacity = 1;
        // really clean the dom element
        setTimeout(function () {
            document.getElementById('loadingBar').style.display = 'none';
        }, 500);
    });

    remote.globalShortcut.register('CommandOrControl+A', () => {
        projectTree.showAll();
    });
});