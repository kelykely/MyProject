import { MyGame } from "./Game";

//初始化加载的图集
const SPRITE_FRAME_INIT_LOAD_ARR: string[] = [];
/**
 * UINode: 是一个存储UI节点的列表，如果这个UI节点内部有不能移除的prefab，那么这个资源再自动清除的时候不能被删除
 * useSprite: 释放的时候每个节点都需要释放SpriteFrame/SpriteAtlas资源和Texture2D资源
 * useNodeArr: 释放的时候每个节点的SpriteFrame设置为undefined
 */
interface SpriteUseData {
    UINode: cc.Node;
    useSprite: cc.SpriteFrame | cc.SpriteAtlas;
    useNodeArr: cc.Node[];
}
export let spriteUseNodeObj: { [path: string]: SpriteUseData[] } = {};

let spriteAtlasSave: { [path: string]: cc.SpriteAtlas } = {};
let spriteFrameSave: { [path: string]: cc.SpriteFrame } = {};

/**
 * 获取UINode所处的index
 * @param {String} spritePath
 * @param {cc.Node} UINode 
 */
function getUINodeIndex(spritePath, UINode) {
    if (!spriteUseNodeObj[spritePath]) {
        return;
    }
    let i, len = spriteUseNodeObj[spritePath].length;
    for (i = 0; i < len; i++) {
        if (spriteUseNodeObj[spritePath][i].UINode === UINode) {
            return i;
        }
    }
}
/**
 * 获取一个UINode所有运用的图集，返回一个路径的合集
 * @param {cc.Node} path 
 */
export function getAllUINodeUseSprite(UINode) {
    let pathArr: string[] = [];
    for (var key in spriteUseNodeObj) {
        if (!spriteUseNodeObj.hasOwnProperty(key)) {
            continue;
        }
        if (getUINodeIndex(key, UINode) !== undefined) {
            if (pathArr.indexOf(key) < 0) {
                pathArr.push(key);
            }
        }
    }
    return pathArr;
}
/**
 * 清除缓存
 * @param {String} path 
 * 会清除所有的useSprite的资源依赖
 */
export function clearSprite(path: string) {
    if (spriteUseNodeObj[path]) {
        spriteUseNodeObj[path].forEach((oneSpriteUseData) => {
            //oneObjData.useNodeArr.forEach((oneNode) => {
            //    oneNode.getComponent(cc.Sprite).SpriteFrame = undefined;
            //});
            let deps = cc.loader.getDependsRecursively(oneSpriteUseData.useSprite);
            cc.loader.release(deps);
        });
    }
    if (spriteAtlasSave[path]) {
        spriteAtlasSave[path] = undefined;
    }
    if (spriteFrameSave[path]) {
        spriteFrameSave[path] = undefined;
    }
}
/**
 * 清除被删除的节点
 */
export function clearDestroyNode() {
    for (var key in spriteUseNodeObj) {
        if (!spriteUseNodeObj.hasOwnProperty(key)) {
            continue;
        }
        let array: SpriteUseData[] = spriteUseNodeObj[key];
        let newArray: SpriteUseData[] = [];
        array.forEach((nodeObj) => {
            if (nodeObj.UINode && nodeObj.UINode.isValid && !MyGame.UITool.getNodeValue(nodeObj.UINode, '_tj_isDestroy')) {
                newArray.push(nodeObj);
            }
        });
        spriteUseNodeObj[key] = newArray;
    }
}
/**
 * 设置图片，因为图集走的是动态加载，所以你不知道什么时候会有用
 * @param {cc.Node} UINode node节点归属的UI节点，传入的原因是为了标记这个资源被这个UI界面动态使用过一次
 * @param {cc.Node} node 设置图片的节点
 * @param {String} spritePath 图片的路径
 * @param {Function} successCb
 * @param {Function} failCb
 */
export function setSpriteFrame(UINode: cc.Node, node: cc.Node, spritePath: string, successCb: Function, failCb: Function) {
    if (!node.getComponent(cc.Sprite)) {
        return;
    }
    if (!spriteUseNodeObj[spritePath]) {
        spriteUseNodeObj[spritePath] = [];
    }
    let index = getUINodeIndex(spritePath, UINode);
    if (index === undefined) {
        spriteUseNodeObj[spritePath].push({
            UINode: UINode,
            useSprite: undefined,
            useNodeArr: []
        });
        index = spriteUseNodeObj[spritePath].length - 1;
    }
    if (!spriteFrameSave[spritePath]) {
        //动态加载
        loadSpriteFrame(spritePath, (spriteFrame) => {
            node.getComponent(cc.Sprite).spriteFrame = spriteFrame;
            spriteUseNodeObj[spritePath][index].useSprite = spriteFrame;
            if (spriteUseNodeObj[spritePath][index].useNodeArr.indexOf(node) < 0) {
                spriteUseNodeObj[spritePath][index].useNodeArr.push(node);
            }
            if (successCb) {
                successCb();
            }
        }, () => {
            if (failCb) {
                successCb();
            }
        });
        return;
    }
    node.getComponent(cc.Sprite).spriteFrame = spriteFrameSave[spritePath];
    spriteUseNodeObj[spritePath][index].useSprite = spriteFrameSave[spritePath];
    if (spriteUseNodeObj[spritePath][index].useNodeArr.indexOf(node) < 0) {
        spriteUseNodeObj[spritePath][index].useNodeArr.push(node);
    }
    if (successCb) {
        successCb();
    }
}
/**
 * 设置图集中的一张图片，因为图集走的是动态加载，所以你不知道什么时候会有用
 * @param {cc.Node} UINode node节点归属的UI节点，传入的原因是为了标记这个资源被这个UI界面动态使用过一次
 * @param {cc.Node} node 设置图集的节点
 * @param {String} spriteAtlasPath 图集的路径
 * @param {String} spriteName 图片的名字
 * @param {Function} successCb
 * @param {Function} failCb
 */
export function setSpriteFrameInAtlas(UINode: cc.Node, node: cc.Node, spriteAtlasPath: string, spriteName: string, successCb: Function, failCb: Function) {
    if (!node.getComponent(cc.Sprite)) {
        return;
    }
    if (!spriteUseNodeObj[spriteAtlasPath]) {
        spriteUseNodeObj[spriteAtlasPath] = [];
    }
    let index = getUINodeIndex(spriteAtlasPath, UINode);
    if (index === undefined) {
        spriteUseNodeObj[spriteAtlasPath].push({
            UINode: UINode,
            useSprite: undefined,
            useNodeArr: []
        });
        index = spriteUseNodeObj[spriteAtlasPath].length - 1;
    }
    if (!spriteAtlasSave[spriteAtlasPath]) {
        //动态加载
        loadSpriteAtlas(spriteAtlasPath, (spriteAtlas) => {
            node.getComponent(cc.Sprite).spriteFrame = spriteAtlas.getSpriteFrame(spriteName);
            spriteUseNodeObj[spriteAtlasPath][index].useSprite = spriteAtlas;
            if (spriteUseNodeObj[spriteAtlasPath][index].useNodeArr.indexOf(node) < 0) {
                spriteUseNodeObj[spriteAtlasPath][index].useNodeArr.push(node);
            }
            if (successCb) {
                successCb();
            }
        }, () => {
            if (failCb) {
                failCb();
            }
        });
        return;
    }
    node.getComponent(cc.Sprite).spriteFrame = spriteAtlasSave[spriteAtlasPath].getSpriteFrame(spriteName);
    spriteUseNodeObj[spriteAtlasPath][index].useSprite = spriteAtlasSave[spriteAtlasPath];
    if (spriteUseNodeObj[spriteAtlasPath][index].useNodeArr.indexOf(node) < 0) {
        spriteUseNodeObj[spriteAtlasPath][index].useNodeArr.push(node);
    }
    if (successCb) {
        successCb();
    }
}
/**
 * 初始化函数，会预先吧SPRITE_FRAME_INIT_LOAD_ARR下的图集全部加载起来
 * @param {Function} finishCb 
 */
export function init(finishCb: Function) {
    let loadedCount = 0;
    //处理加载选项数量为0的情况
    if (loadedCount === SPRITE_FRAME_INIT_LOAD_ARR.length) {
        if (finishCb) {
            finishCb();
        }
        return;
    }
    SPRITE_FRAME_INIT_LOAD_ARR.forEach((path) => {
        loadSpriteAtlas(path, (spriteAtlas) => {
            loadedCount++;
            if (loadedCount === SPRITE_FRAME_INIT_LOAD_ARR.length) {
                if (finishCb) {
                    finishCb();
                }
            }
        }, (error) => {
            MyGame.LogTool.showLog(`SpriteFrameManager init error! path is ${path}, error is ${error}`);
            loadedCount++;
            if (loadedCount === SPRITE_FRAME_INIT_LOAD_ARR.length) {
                if (finishCb) {
                    finishCb();
                }
            }
        });
    });
}

/**
 * 动态加载一个图集
 * @param {String} path 
 * @param {Function} successCb 
 * @param {Function} failCb 
 */
export function loadSpriteAtlas(path: string, successCb: Function, failCb: Function) {
    if (!path) {
        return;
    }
    if (spriteAtlasSave[path]) {
        if (successCb) {
            successCb(spriteAtlasSave[path]);
        }
        return;
    }
    cc.loader.loadRes(path, cc.SpriteAtlas, function (error, spriteAtlas) {
        if (error) {
            if (failCb) {
                failCb(error);
            }
            return;
        }
        spriteAtlasSave[path] = spriteAtlas;
        if (successCb) {
            successCb(spriteAtlas);
        }
    });
}

/**
 * 动态加载一个图片
 * @param {String} path 
 * @param {Function} successCb 
 * @param {Function} failCb 
 */
export function loadSpriteFrame(path: string, successCb: Function, failCb: Function) {
    if (!path) {
        return;
    }
    if (spriteFrameSave[path]) {
        if (successCb) {
            successCb(spriteFrameSave[path]);
        }
        return;
    }
    cc.loader.loadRes(path, cc.SpriteFrame, function (error, spriteFrame) {
        if (error) {
            if (failCb) {
                failCb(error);
            }
            return;
        }
        spriteFrameSave[path] = spriteFrame;
        if (successCb) {
            successCb(spriteFrame);
        }
    });
}