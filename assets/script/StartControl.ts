const {ccclass, property} = cc._decorator;

@ccclass
export default class StartControl extends cc.Component {


    public goGameMain = (): void => {
        this.getComponent(cc.AudioSource).play();
        cc.director.loadScene('main');
    }
}
