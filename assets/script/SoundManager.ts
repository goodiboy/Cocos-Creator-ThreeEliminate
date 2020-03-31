const {ccclass, property} = cc._decorator;

@ccclass
export default class SoundManager extends cc.Component {

    // 背景音乐
    @property(cc.AudioSource)
    BgMusic: cc.AudioSource = null;

    // 下落声音
    @property(cc.AudioSource)
    DropSound: cc.AudioSource = null;

    // 按钮声音
    @property(cc.AudioSource)
    ButtonSound: cc.AudioSource = null;


    // 消除声音
    @property(cc.AudioSource)
    ExplosionSound: cc.AudioSource = null;

    start() {
    }

    // update (dt) {}
}
