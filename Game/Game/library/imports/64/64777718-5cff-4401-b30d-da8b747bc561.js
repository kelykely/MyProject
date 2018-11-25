"use strict";
cc._RF.push(module, '64777cYXP9EAbMN2ot0e8Vh', 'BaseUI');
// Script/UI/Base/BaseUI.js

'use strict';

cc.Class({
    extends: cc.Component,

    properties: {
        //UI的名字
        _leftNode: null,
        _topNode: null,
        _rightNode: null,
        _bottomNode: null,
        _midNode: null
    },

    /**
     * 初始化，先初始化数据，后初始化UI
     */
    onLoad: function onLoad() {
        //初始化名字
        if (this._uiName) {
            this.node.name = this._uiName;
        }
        //初始化五个节点
        this._leftNode = this.node.getChildByName('Left');
        this._topNode = this.node.getChildByName('Top');
        this._rightNode = this.node.getChildByName('Right');
        this._bottomNode = this.node.getChildByName('Bottom');
        this._midNode = this.node.getChildByName('Mid');
        //初始化
        this.onUIInit();
        this.onShow();
        this.buttonTravelRegister(this.node);
    },

    //初始化UI
    onUIInit: function onUIInit() {},

    //重新显示的时候会调用这个
    onShow: function onShow() {},

    /**
     * 隐藏UI
     */
    hide: function hide(deleteFlag) {
        this.node.active = false;
        if (deleteFlag) {
            this.node.removeFromParent(true);
            this.node.destroy();
            this.node._tj_isDestroy = true;
            g_SpriteFrameManager.clearDestroyNode();
        }
    },

    /**
     * 销毁UI
     */
    onDestroy: function onDestroy() {},

    /**
     * 这个函数会注册指定结点下所有的结点
     * 需要避免多次时间注册的情况
     * @param node cc.Node
     */
    buttonTravelRegister: function buttonTravelRegister(node) {
        if (!node) {
            return;
        }
        if (node.getComponent(cc.Button)) {
            //注册事件
            node.on('click', this.buttonClickCb, this);
        }
        //遍历执行
        node.children.forEach(function (childNode) {
            this.buttonTravelRegister(childNode);
        }.bind(this));
    },

    /**
     * 这个函数会注册指定结点下所有的结点
     * 需要避免多次时间注册的情况
     * @param node cc.Node
     */
    buttonTravelUnRegister: function buttonTravelUnRegister(node) {
        if (!node) {
            return;
        }
        if (node.getComponent(cc.Button)) {
            //注册事件
            node.off('click', this.buttonClickCb, this);
        }
        //遍历执行
        node.children.forEach(function (childNode) {
            this.buttonTravelUnRegister(childNode);
        }.bind(this));
    },

    /**
     * 按钮点击触发的回调
     * @param clickEvent 点击事件的具体参数
     */
    buttonClickCb: function buttonClickCb(clickEvent) {
        if (this.onButtonClick && typeof this.buttonClickCb === 'function') {
            //解析参数
            //触发事件的结点
            var node = clickEvent.currentTarget;
            //触发事件的按钮组件
            var component = clickEvent.detail;
            //组件的名字
            var name = node.name;
            this.onButtonClick(name, node, component);
        }
    }
});

cc._RF.pop();