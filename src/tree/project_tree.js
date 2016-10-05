import vis from 'vis';
import scanner from '../file_discover/scanner';

export var FOLDER_KIND = {
    color: '#a52f2f',
    value: 'FOLDER',
    label: 'Folder'
};
export var FILE_KIND = {
    color: '#2f2f2f',
    value: 'FILE',
    label: 'File'
};

export var ROOT_KIND = {
    color: '#2f2fa5',
    value: 'ROOT',
    label: 'Root'
}

export function Translator(info) {

    this.info = info;

    this.translatedInfo = {
        nodes: [],
        edges: []
    };

    this.lastId = 0;

    this.translate = (root = null, info = this.info[0], translatedInfo = this.translatedInfo) => {

        // 800 Lines of code
        const MAX_SIZE = 80;

        let translatedRoot = null;

        if (root == null) {
            translatedRoot = {
                id: ++this.lastId,
                label: info.name,
                font: {
                    color: '#000'
                },
                kind: ROOT_KIND,
                meta: 'The Project',
                color: {
                    background: ROOT_KIND.color,
                    border: ROOT_KIND.color
                }
            };

            root = translatedRoot.id;
        }

        for (var i = 0; i < info.child.length; i++) {
            let file = info.child[i];

            let translated = {
                id: ++this.lastId,
                label: file.name,
                font: {
                    color: '#000'
                },
            };

            let translatedEdge = {
                from: root,
                to: translated.id,
                color: FOLDER_KIND.color
            };

            if (file.kind === scanner.FILE_KIND) {
                
                let fileSize = file.lines/10.0;
                if(fileSize<5)
                    fileSize = 5;
                
                if(fileSize > MAX_SIZE) {
                    fileSize = MAX_SIZE;
                }
                    
                translated.size = fileSize;
                translated.kind = FILE_KIND;
                translated.meta = file.lines + " lines",
                translated.color = {
                    background: FILE_KIND.color,
                    border: FILE_KIND.color
                };
                
                translatedEdge.color = FILE_KIND.color;
                
                if(fileSize >= MAX_SIZE) {
                    let gold = '#CFA700';
                    
                    translated.color = {
                        background: gold,
                        border: gold
                    };
                    
                    translatedEdge.color = gold;
                }
                                    
            }
            else {
                translated.kind = FOLDER_KIND;
                translated.meta = info.child[i].child.length + " files and folders";
                translated.color = {
                    background: FOLDER_KIND.color,
                    border: FOLDER_KIND.color
                };

                translated.size = 20;
                    
                this.translate(
                    translated.id,
                    info.child[i],
                    translatedInfo
                );
            }
            
            this.translatedInfo.edges[this.translatedInfo.edges.length] = translatedEdge;

            this.translatedInfo.nodes[this.translatedInfo.nodes.length] = translated;
        }

        if (translatedRoot !== null) {
            
            translatedRoot.size = 50;
            this.translatedInfo.nodes[this.translatedInfo.nodes.length] = translatedRoot;
        }

        return 1;
    };

    return {
        translate: this.translate,
        translatedInfo: this.translatedInfo
    };

}

export function ProjectTree(container) {
    this.nodes = [];
    this.edges = [];

    this.nodeDataSet = null;
    this.edgeDataSet = null;

    this.container = container;
    this.options = {
       
    };
    this.animationOptions = {
        animation: {
            duration: 2000,
            easingFunction: 'easeInOutQuad'
        }
    };
    this.network = null;
    this.onClickHandler = () => {};

    this.addNode = (id, parent = null, label, kind = FOLDER_KIND, size = 10, meta = null, edgeLabel = '') => {
        this.nodes[this.nodes.length] = {
            id: id,
            label: label,
            meta: meta,
            kind: kind,
            size: size,
            font: {
                color: '#000'
            },
            color: {
                background: kind.color,
                border: kind.color,
            }
        };

        if (parent !== null) {
            this.edges[this.edges.length] = {
                from: parent,
                to: id,
                label: edgeLabel,
                color: kind.color
            };
        }

    };

    this.addOption = (name, value) => {
        this.options[name] = value;
    };

    this.bootstrap = () => {
        this.nodeDataSet = new vis.DataSet(this.nodes);
        this.edgeDataSet = new vis.DataSet(this.edges);
    };


    this.render = () => {

        this.bootstrap();

        let data = {
            nodes: this.nodeDataSet,
            edges: this.edgeDataSet
        };

        this.network = new vis.Network(this.container, data, this.options);

        this.showAll();

        this.network.on('click', (event) => {
            this.onClickHandler(event, this);
        });

        return this.network;
    };

    this.showAll = () => {
        this.network.fit(this.animationOptions);
    };

    this.setOnClickHandler = (handler) => {
        this.onClickHandler = handler;
    };

    this.setNodes = (nodes) => {
        this.nodes = nodes;
    };

    this.setEdges = (edges) => {
        this.edges = edges;
    };

    return {
        nodes: this.nodes,
        edges: this.edges,
        nodeDataSet: this.nodeDataSet,
        edgeDataSet: this.edgeDataSet,
        addNode: this.addNode,
        addOption: this.addOption,
        bootstrap: this.bootstrap,
        render: this.render,
        showAll: this.showAll,
        setOnClickHandler: this.setOnClickHandler,
        setNodes: this.setNodes,
        setEdges: this.setEdges,
    };
};

export default {
    ProjectTree: ProjectTree,
}