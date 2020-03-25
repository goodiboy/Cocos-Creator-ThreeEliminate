import Utils from "./Utils";
import {IconData, State} from "./interface";

const {ccclass, property} = cc._decorator;

@ccclass
export default class GameControl extends cc.Component {

    // Canvas节点
    @property(cc.Node)
    MyCanvas: cc.Node = null;

    // 音效节点
    @property(cc.Node)
    SoundNode: cc.Node = null;

    // 游戏元素预制体
    @property(cc.Prefab)
    IconPrefab: cc.Prefab = null;

    // 是否正在控制
    public control: boolean = false;

    // 正在控制的方块的位置
    public chooseIconPos: cc.Vec2 = cc.Vec2.ZERO;

    // 成绩
    public score: number = 0;

    // 方块的表格数据
    public iconsDataTable: IconData[][] = [];

    // 存储方块的节点数组
    public iconsTable: cc.Node[][] = [];

    // 存储方块位置的数组
    public iconsPosTable: cc.Vec2[][] = [];

    // 存储方块动画数组
    public iconsAnimTable: cc.Animation[][] = [];

    // 方块对象池
    public iconNodePool: cc.NodePool = new cc.NodePool();


    protected onLoad(): void {
        this._initGameData();
        this._initGameBoard();
    }

    private _initGameData(): void {
        for (let i = 0; i < Utils.ROW_COUNT; i++) {
            this.iconsDataTable[i] = [];
            for (let j = 0; j < Utils.COL_COUNT; j++) {
                const type = this.getNewIconType(i, j);
                this.iconsDataTable[i][j] = {state: State.NORMAL, iconType: type, anim: null}
            }
        }
    }

    // 初始化方块
    private _initGameBoard(): void {
        for (let i = 0; i < Utils.ROW_COUNT; i++) {
            this.iconsTable[i] = [];
            this.iconsPosTable[i] = [];
            this.iconsAnimTable[i] = [];
            for (let j = 0; j < Utils.COL_COUNT; j++) {
                const node: cc.Node = this.getIconNode();
                this.iconsTable[i][j] = node;
                node.setPosition(cc.v2(-320 + 71 * (i + 1), -360 + 71 * (j + 1)));
                this.iconsPosTable[i][j] = node.getPosition();
                this.iconsAnimTable[i][j] = node.getComponent(cc.Animation);
                node.parent = this.node;

                this.iconsDataTable[i][j].anim = this.iconsAnimTable[i][j];
                this.setIconNormalAnim(i, j)
            }
        }
    }

    /**
     * 设置静态的方块
     * @param i 存储动画组件数组的i下标
     * @param j 存储动画组件数组的j下标
     */
    public setIconNormalAnim(i: number, j: number): void {
        GameControl.setIconAnimObj(this.iconsAnimTable[i][j], "normal0" + this.iconsDataTable[i][j].iconType)
    }

    /**
     * 播放动画
     * @param anim 动画组件
     * @param name 需要播放的动画名称
     */
    public static setIconAnimObj(anim: cc.Animation, name: string): void {
        anim.play(name)
    }

    /**
     * 生成小方块类型的数据
     * @param i 二维数组的下标i 行
     * @param j 二维数组的下标j 列
     */
    public getNewIconType(i: number, j: number): number {
        // 存储当前元素的左边和上边的元素类型
        const exTypeTable: number[] = [-1, -1];
        // 如果当前方块的行数大于1，获取它前一行的类型
        if (i > 0)
            exTypeTable[0] = this.iconsDataTable[i - 1][j].iconType;
        // 如果当前方块的列数大于1，获取它前一列的类型
        if (j > 0)
            exTypeTable[1] = this.iconsDataTable[i][j - 1].iconType;

        // 存储需要随机的方块类型
        const typeTable: number[] = [];
        for (let n = 1; n <= Utils.TYPE_COUNT; n++) {
            // 把不等于当前元素的左边和上边的类型记录下来，进行随机
            if (n !== exTypeTable[0] && n !== exTypeTable[1]) {
                typeTable.push(n);
            }
        }
        return typeTable[Utils.randomInt(0, typeTable.length)];
    }


    // 从节点对象池中获取节点
    public getIconNode(): cc.Node {
        if (this.iconNodePool.size() > 0)
            return this.iconNodePool.get();
        return cc.instantiate(this.IconPrefab);
    }

}
