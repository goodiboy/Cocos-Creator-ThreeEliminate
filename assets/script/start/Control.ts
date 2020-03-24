const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    public  goGameMain(): void {
        cc.director.loadScene('main');
    }
}
