const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    // Canvas节点
    @property(cc.Node)
    MyCanvas: cc.Node = null;

    // 音效节点
    @property(cc.Node)
    SoundNode: cc.Node = null;

    // 游戏主场
    @property(cc.Node)
    BoardLayer: cc.Node = null;

    // 游戏元素预制体
    @property(cc.Prefab)
    IconPrefab: cc.Prefab = null;


}
