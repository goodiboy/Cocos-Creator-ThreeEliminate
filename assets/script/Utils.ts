export default class Utils {
    private constructor() {
    }

    // 行数
    public static ROW_COUNT: number = 8;
    // 列数
    public static COL_COUNT: number = 10;
    // 类型数量
    public static TYPE_COUNT: number = 6;

    public static randomInt(min: number, max: number): number {
        if (min >= max) throw new Error('max must be greater than min');
        return Math.floor(Math.random() * (max - min) + min);
    }
}