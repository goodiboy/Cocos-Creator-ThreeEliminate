import GameControl from "./GameControl";
import Utils from "./Utils";
import {Dir, Execute, IconData, State} from "./interface";

// GameControl的this
let GameThis: GameControl = null;
const {ccclass, property} = cc._decorator;

@ccclass
export default class TouchManager extends cc.Component {

    // 是否正在控制方块
    private _isControl: boolean = false;

    // 正在控制的方块的位置
    private _chooseIconPos: cc.Vec2 = cc.Vec2.ZERO;

    // 消除的数量
    private _cancelNum: number = 0;

    // 需要移动的数量
    private _moveNum: number = 0;

    protected start(): void {
        GameThis = GameControl.getThis;
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
        }

        const startPos: cc.Vec2 = event.getStartLocation();
        const pos: cc.Vec2 = event.getLocation();
        const {x: px, y: py} = pos.sub(startPos);

        /**
         * 由两个方块之间建立是直角坐标系，通过勾股定理得出a^2 + b^2 = c^2
         * 当a^2 + b^2 > c^2的时候证明当前活动的长度已经由一个方块的宽度了
         */
        if (px * px + py * py > 4900) {
            this._backOrigin(x, y);
            this._handleMassage(Execute.EXCHANGE, pos, dir);
        } else {
            GameThis.iconsTable[x][y].position = GameThis.iconsTable[x][y].position.add(event.getDelta());
        }
        //是否是边界的方块
    };

    /**
     * 方块超出界限，返回原位
     * @param x 原来位置的数组下标
     * @param y 原来位置的数组下标
     * @private
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
        if (!dir) return;
        const pos: cc.Vec2 = event.getLocation();

        // 当前的下标
        const {x, y} = this._chooseIconPos;
        GameThis.iconsTable[x][y].setPosition(GameThis.iconsPosTable[x][y]);
        this._isControl = false;
        this._handleMassage(Execute.EXCHANGE, pos, dir);
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
    private _handleMassage(message: Execute, pos?: cc.Vec2, dir?: Dir): void {
        switch (message) {
            case Execute.EXCHANGE:
                if (this._testExchange(dir)) {
                    this._handleMassage(Execute.CANCEL)
                } else {
                    console.log('返回');
                    console.log(GameThis.iconsDataTable);
                }
                break;
            case Execute.CANCEL:
                this._exCancel();
                break;
            case Execute.PRODUCE:
                this._exProduce();
                break;
            case Execute.MOVE:
                this._exMove();
                break
        }
    }


    private _exMove(): void {
        for (let i = 0; i < Utils.COL_COUNT; i++) {
            for (let j = 0; j < Utils.ROW_COUNT; j++) {
                if (GameThis.iconsDataTable[i][j].state === State.MOVE) {
                    GameThis.setIconNormalAnimObj(GameThis.iconsDataTable[i][j]);
                    const pos = GameThis.iconsTable[i][j].getPosition();
                    const num = GameThis.iconsDataTable[i][j].moveNum;
                    GameThis.iconsTable[i][j].setPosition(GameThis.iconsTable[i][j + num].getPosition());
                    cc.tween(GameThis.iconsTable[i][j])
                        .to(0.1 * num, {position: pos})
                        .start();
                }
            }
        }
    }

    private _exProduce(): void {
        this._moveNum = 0;
        for (let i = 0; i<Utils.COL_COUNT; i++) {
            for (let j = 0; j < Utils.ROW_COUNT; j++) {
                const icon = GameThis.iconsDataTable[i][j];
                if (icon.state === State.CANCELED) {
                    this._moveNum++;
                    this.setIconState(i, j, State.MOVE);
                    icon.moveNum = 0;
                    if (j !== Utils.ROW_COUNT) {
                        for (let k = j + 1; k < Utils.ROW_COUNT ; k++) {
                            icon.moveNum++;
                            const itemIcon = GameThis.iconsDataTable[i][k];
                            if (itemIcon.state !== State.CANCELED) {
                                itemIcon.state = State.CANCELED;
                                icon.iconType = itemIcon.iconType;
                                break;
                            }
                        }
                    }
                }
            }
        }
        this._handleMassage(Execute.MOVE);
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
        // 对调数据之后也要调整方块的显示
        GameThis.setIconNormalAnimObj(controlIconData);
        GameThis.setIconNormalAnimObj(dirIconData);
        // 是否消除
        const isCancel: boolean[] = [false, false, false];
        // 对水平方向进行对比
        isCancel[0] = this.checkCancelH(x);
        // 对比完之后，要立刻把相同的方块设置成可以消除状态
        this.setCancelEnsure();
        isCancel[1] = this.checkCancelV(y);
        this.setCancelEnsure();
        switch (dir) {
            case Dir.LEFT:
                isCancel[2] = this.checkCancelH(x - 1);
                break;
            case Dir.RIGHT:
                isCancel[2] = this.checkCancelH(x + 1);
                break;
            case Dir.UP:
                isCancel[2] = this.checkCancelV(y + 1);
                break;
            case Dir.DOWN:
                isCancel[2] = this.checkCancelV(y - 1);
                break;
        }
        this.setCancelEnsure();
        return (isCancel[0] || isCancel[1] || isCancel[2])
    }

    /**
     * 对元素进行消除
     * @private
     */
    private _exCancel(): void {
        this._cancelNum = 0;
        for (let i = 0; i < Utils.COL_COUNT; i++) {
            for (let j = 0; j < Utils.ROW_COUNT; j++) {
                // 遍历全部的方块，把状态是可以消除的进行消除
                if (GameThis.iconsDataTable[i][j].state === State.PRECANCEL2) {
                    this._cancelNum++;
                    this.setIconState(i, j, State.CANCEL);
                }
            }
        }
    }

    /**
     *  把之前判断为相同的方块设置成可消除状态
     */
    public setCancelEnsure(): void {
        for (let i = 0; i < Utils.COL_COUNT; i++) {
            for (let j = 0; j < Utils.ROW_COUNT; j++) {
                if (GameThis.iconsDataTable[i][j].state == State.PRECANCEL) {
                    this.setIconState(i, j, State.PRECANCEL2)
                }
            }
        }
    }


    /**
     * 检测垂直
     * @param col 第几列
     */
    public checkCancelV(col: number): boolean {
        let cancelNum: number = 1;
        let iconType: number = GameThis.iconsDataTable[0][col].iconType;
        let isCancel: boolean = false;
        this.setIconState(0, col, State.PRECANCEL);
        for (let i = 1; i < Utils.COL_COUNT; i++) {
            // 把相同类型的方块状态设置为PRECANCEL
            if (iconType === GameThis.iconsDataTable[i][col].iconType) {
                // 计算相同的数量
                cancelNum++;
                this.setIconState(i, col, State.PRECANCEL);
                // 如果相同的数量大于3 则进行消除
                if (cancelNum >= 3) {
                    isCancel = true;
                    //todo 分数
                }
            } else {
                /**
                 * 该方块的不与目标类型相同，且相同类型总数小于3，则把原来的方块还原类型
                 * 1 1
                 * 2 2
                 * 3
                 */
                if (cancelNum < 3) {
                    // 从上一个开始，还原NORMAL状态
                    for (let k = i - 1; k >= 0; k--) {
                        // 把相同的都状态都设置为normal状态，理论上都是相同，写个判断稳点
                        if (iconType === GameThis.iconsDataTable[k][col].iconType) {
                            this.setIconState(k, col, State.NORMAL);
                        } else {
                            break;
                        }
                    }
                }
                // 如果该垂直方向上还没检测的的方块大于 3个，则设置当前方块类型为对比类型，和剩下的进行对比，否则退出循环
                if (i < (Utils.COL_COUNT - 2)) {
                    cancelNum = 1;
                    iconType = GameThis.iconsDataTable[i][col].iconType;
                    this.setIconState(i, col, State.PRECANCEL);
                } else {
                    break
                }
            }
        }
        return isCancel;
    }

    /**
     * 检测水平，逻辑和检测垂直一样，参考垂直注释
     * @param row 第几行
     */
    public checkCancelH(row: number): boolean {
        let cancelNum: number = 1;
        let iconType: number = GameThis.iconsDataTable[row][0].iconType;
        let isCancel: boolean = false;
        this.setIconState(row, 0, State.PRECANCEL);
        for (let i = 1; i < Utils.ROW_COUNT; i++) {
            // 把相同类型的方块状态设置为PRECANCEL
            if (iconType === GameThis.iconsDataTable[row][i].iconType) {
                cancelNum++;
                this.setIconState(row, i, State.PRECANCEL);
                // 如果相同的数量大于3 则进行消除
                if (cancelNum >= 3) {

                    isCancel = true;
                    //todo 分数
                }
            } else {
                /**
                 * 如果相同的类型小于3，则把原来的方块还原类型
                 * 1 1
                 * 2 2
                 * 3
                 */
                if (cancelNum < 3) {
                    for (let k = i - 1; k >= 0; k--) {
                        if (iconType === GameThis.iconsDataTable[row][k].iconType) {
                            this.setIconState(row, k, State.NORMAL);
                        } else {
                            break;
                        }
                    }
                }
                if (i < (Utils.ROW_COUNT - 2)) {
                    cancelNum = 1;
                    iconType = GameThis.iconsDataTable[row][i].iconType;
                    this.setIconState(row, i, State.PRECANCEL);
                } else {
                    break
                }
            }
        }
        return isCancel;
    }

    private setIconState(i: number, j: number, state: State): void {
        const data = GameThis.iconsDataTable[i][j];
        // 如果状态一样，不做任何操作
        if (data.state === state) return;
        if ((data.state === State.PRECANCEL2) && (state === State.NORMAL || state === State.PRECANCEL)) {
            return
        }
        data.state = state;
        // 如果是消除状态，进行消除，消除完毕之后设置状态为消除后
        if (state == State.CANCEL) {

            const callBack = (): void => {
                data.anim.targetOff(this);
                this.setIconState(i, j, State.CANCELED);

                this._cancelNum--;
                // 把全部方块消除完成之后，进行生成新的方块
                if (this._cancelNum === 0) {
                    this._handleMassage(Execute.PRODUCE)
                }
            };

            data.anim.on('finished', callBack, this);
            GameThis.setIconCancelAnimObj(data)
        }

    }

}
