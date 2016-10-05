import fs from 'fs';
import path from 'path';

export const FOLDER_KIND = 'FOLDER';
export const FILE_KIND = 'FILE'

export function Scanner(dirpath) {
    
    this.dirpath = dirpath;
    this.ignore = [];
    this.info = [];
    
    this.addIgnoredFolder = (name) => {
        this.ignore[this.ignore.length] = name;  
    };
    
    this.countLineNumbers = (file) => {
        return fs.readFileSync(file).toString().split('\n').length;
    };
    
    this.scan = (dirpath = this.dirpath, info = this.info) => {
        
        if(Array.isArray(info) && info.length === 0) {
            info[0] = {
                name: path.basename(dirpath),
                kind: FOLDER_KIND,
                child: []
            };

            info = info[0];    
        }
        fs.readdirSync(dirpath).filter((file)=>{
            let targetFile = path.join(dirpath, file);
            
            let isDir = fs.statSync(targetFile).isDirectory();
            
            if(isDir) {
                                
                var isIgnored = false;
                
                for(var i=0; i<this.ignore.length; i++)
                    if(file === this.ignore[i])
                        isIgnored = true;
                
                if(!isIgnored) {
                    
                    info.child[info.child.length] = {
                        name: file,
                        kind: FOLDER_KIND,
                        child: []
                    };
                    
                    this.scan(targetFile, info.child[info.child.length-1]);
                }
            }
            else {
                info.child[info.child.length] = {
                    name: file,
                    kind: FILE_KIND,
                    lines: this.countLineNumbers(targetFile)
                };
            }
        });
    };
    
    return {
        dirpath: this.dirpath,
        info: this.info,
        addIgnoredFolder: this.addIgnoredFolder,
        scan: this.scan,
    }
    
}

export default {
    FILE_KIND: FILE_KIND,
    FOLDER_KIND: FOLDER_KIND,
    Scanner: Scanner,
}