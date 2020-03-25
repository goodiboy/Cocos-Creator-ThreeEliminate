export enum State {
    // 静止
    NORMAL = 1,
    // 移动
    MOVE = 2,
    PRECANCEL = 3,
    PRECANCEL2 = 4,
    CANCEL = 5,
    CANCELED = 6
}

export interface IconData {
    // 状态
    state: State,
    // 类型
    iconType: number,
    // 动画节点
    anim: cc.Animation
}

// 滑动的方向
export enum Dir {
    /**左*/
    LEFT = 1,
    /**右*/
    RIGHT = 3,
    /**上*/
    UP = 2,
    /**下*/
    DOWN = 4
}