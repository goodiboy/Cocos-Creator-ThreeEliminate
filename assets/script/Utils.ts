export default class Utils {
    private constructor() {
    }

    public static ROW_COUNT: number = 9;
    public static COL_COUNT: number = 9;

    public static randomInt(min: number, max: number): number {
        if (min >= max) throw new Error('max must be greater than min');
        return Math.floor(Math.random() * (max - min) + min);
    }
}