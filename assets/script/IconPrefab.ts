const {ccclass, property} = cc._decorator;

@ccclass
export default class IconPrefab extends cc.Component {

    public init(pos: cc.Vec2): void {
        this.node.setPosition(pos);
        // cc.loader.loadRes()
        // this.getComponent(cc.Sprite).spriteFrame =
    }
}
