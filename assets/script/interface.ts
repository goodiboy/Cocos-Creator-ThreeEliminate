export enum State {
    NORMAL = 1,
    MOVE = 2,
    PRECANCEL = 3,
    PRECANCEL2 = 4,
    CANCEL = 5,
    CANCELED = 6
}

export interface IconData {
    state: State,
    iconType: number,
    anim: cc.Animation
}