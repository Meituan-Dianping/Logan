export const getDayOffset = (date: Date): number => {
    return date.getHours() * 60 + date.getMinutes() + date.getSeconds() / 60 + date.getMilliseconds() / 1000 / 60;
};

export const getTimeOffset = (hourAndMunite: string, defaultOffset: number = 0): number => {
    if (!hourAndMunite) {
        return defaultOffset;
    }
    const array = hourAndMunite.split(':');
    if (!array || array.length !== 2) {
        return defaultOffset;
    }
    return parseInt(array[0]) * 60 + parseInt(array[1]);
};