import GameControl from "./GameControl";
import Utils from "./Utils";
import {Dir} from "./interface";

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

        // 限制边界
        const {x, y} = this._chooseIconPos;
        //是否是边界的方块
        if (
            (x === 0 && dir === Dir.LEFT) ||
            (x === Utils.COL_COUNT - 1 && dir === Dir.RIGHT) ||
            (y === 0 && dir === Dir.DOWN) ||
            (y === Utils.ROW_COUNT - 1 && dir === Dir.UP)
        ) {
            this.backOrigin(x, y);
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
    private backOrigin = (x: number, y: number): void => {
        const node = GameThis.iconsTable[x][y];
        node.setPosition(GameThis.iconsPosTable[x][y]);
        node.zIndex = 0;
        this._isControl = false;
        return;
    };

    private _touchend(event): void {

    }


}
