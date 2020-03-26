import GameControl from "./GameControl";
import Utils from "./Utils";
import {Dir, IconData, TouchMessage} from "./interface";

// GameControl的this
let GameThis: GameControl = null;
const {ccclass, property} = cc._decorator;

@ccclass
export default class TouchManager extends cc.Component {

    // 是否正在控制方块
    private _isControl: boolean = false;

    // 正在控制的方块的位置
    private _chooseIconPos: cc.Vec2 = cc.Vec2.ZERO;

    protected start(): void {
        GameThis = GameControl.getThis;
        console.log(GameThis.iconsTable);
        // 关闭多点触摸
        cc.macro.ENABLE_MULTI_TOUCH = false;

        this.node.on(cc.Node.EventType.TOUCH_START, this._touchstart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this._touchmove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this._touchend, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this._touchend, this);
    };

    /**
     * 手指按下，判断是否点中方块,记录点击的方块位置
     * @param event 事件对象
     * @private
     */
    private _touchstart = (event): void => {
        const pos: cc.Vec2 = event.getLocation();
        console.log(pos);
        for (let i = 0; i < Utils.COL_COUNT; i++) {
            for (let j = 0; j < Utils.ROW_COUNT; j++) {
                if (GameThis.iconsTable[i][j].getBoundingBoxToWorld().contains(pos)) {
                    // 记录点击的方块
                    this._chooseIconPos.x = i;
                    this._chooseIconPos.y = j;
                    GameThis.iconsTable[i][j].zIndex = 1;
                    this._isControl = true;
                    break;
                }
            }
        }
    };

    private _touchmove(event): void {
        if (!this._isControl) return;
        // 划动的方向
        const dir = this._getTouchDir(event);

        // 限制边界
        const {x, y} = this._chooseIconPos;
        //是否是边界的方块
        if (
            (x === 0 && dir === Dir.LEFT) ||
            (x === Utils.COL_COUNT - 1 && dir === Dir.RIGHT) ||
            (y === 0 && dir === Dir.DOWN) ||
            (y === Utils.ROW_COUNT - 1 && dir === Dir.UP)
        ) {
            this._backOrigin(x, y);
        } else {
            GameThis.iconsTable[x][y].position = GameThis.iconsTable[x][y].position.add(event.getDelta());
        }
        //是否是边界的方块
    };

    /**
     * 方块超出界限，返回原位
     * @param x 原来位置的数组下标
     * @param y 原来位置的数组下标
     */
    private _backOrigin = (x: number, y: number): void => {
        const node = GameThis.iconsTable[x][y];
        node.setPosition(GameThis.iconsPosTable[x][y]);
        node.zIndex = 0;
        this._isControl = false;
        return;
    };

    private _touchend(event): void {
        if (!this._isControl) return;
        // 划动的方向
        const dir = this._getTouchDir(event);
        const pos: cc.Vec2 = event.getLocation();

        // 当前的下标
        const {x, y} = this._chooseIconPos;
        GameThis.iconsTable[x][y].setPosition(GameThis.iconsPosTable[x][y]);
        this._isControl = false;
        this._handleMassage(TouchMessage.EXCHANGE, pos, dir);
    };

    private _getTouchDir = (event: cc.Touch): Dir => {
        let dir: Dir;
        // 手指按下的位置
        const startPos: cc.Vec2 = event.getStartLocation();
        // 手指移动的位置
        const pos: cc.Vec2 = event.getLocation();

        // 判断方向
        const {x: px, y: py} = pos.sub(startPos);
        const absPx: number = Math.abs(px);
        const absPy: number = Math.abs(py);

        // 如果滑动的距离小于5，不执行移动
        if (absPx < 5 && absPy < 5) return;
        if (absPx > absPy) {
            if (px > 0)
                dir = Dir.RIGHT;
            else
                dir = Dir.LEFT;
        } else {
            if (py > 0)
                dir = Dir.UP;
            else
                dir = Dir.DOWN;
        }
        return dir;
    };


    /**
     * 处理触摸之后的事件
     * @param message 需要进行的操作
     * @param pos 手指抬起的位置
     * @param dir 方向
     * @private 私有的
     */
    private _handleMassage(message: TouchMessage, pos: cc.Vec2, dir: Dir): void {
        switch (message) {
            case TouchMessage.EXCHANGE:
                break;
        }
    }


    /**
     * 方块交换
     * @param dir 方向
     * @private
     */
    private _testExchange(dir: Dir): boolean {
        const {x, y} = this._chooseIconPos;

        // 当前操控的方块
        const controlIconData: IconData = GameThis.iconsDataTable[x][y];
        // 目标方向上的节点
        let dirIconData: IconData;
        switch (dir) {
            case Dir.LEFT:
                dirIconData = GameThis.iconsDataTable[x - 1][y];
                break;
            case Dir.RIGHT:
                dirIconData = GameThis.iconsDataTable[x + 1][y];
                break;
            case Dir.UP:
                dirIconData = GameThis.iconsDataTable[x][y + 1];
                break;
            case Dir.DOWN:
                dirIconData = GameThis.iconsDataTable[x][y - 1];
        }

        // 对调数据
        let tempVal = controlIconData.iconType;
        controlIconData.iconType = dirIconData.iconType;
        dirIconData.iconType = tempVal;

        // 是否消除
        const isCancel = [false, false, false];

        return;
    }


}
