const {ccclass, property} = cc._decorator;

@ccclass
export default class StartControl extends cc.Component {

    protected onLoad(): void {
        // 预加载main场景
        cc.director.preloadScene('main');
    }

    public goGameMain = (): void => {
        this.getComponent(cc.AudioSource).play();
        cc.director.loadScene('main');
    }
}
