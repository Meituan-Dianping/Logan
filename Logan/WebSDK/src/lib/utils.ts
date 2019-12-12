type MiliSeconds = number;
export const K_BYTE = 1024;
export const M_BYTE = 1024 * K_BYTE;
export function sizeOf(str: string): number {
    let total = 0;
    for (let i = 0, len = str.length; i < len; i++) {
        let charCode = str.charCodeAt(i);
        if (charCode <= 0x007f) {
            total += 1;
        } else if (charCode <= 0x07ff) {
            total += 2;
        } else if (charCode <= 0xffff) {
            total += 3;
        } else {
            total += 4;
        }
    }
    return total;
}

export function isValidDay(day: string): boolean {
    const dayParts = day.split('-');
    const M = parseInt(dayParts[1]);
    const D = parseInt(dayParts[2]);
    return (
        M > 0 &&
        M <= 12 &&
        D > 0 &&
        D <= 31 &&
        new Date(day).toString() !== 'Invalid Date'
    );
}

export function dateFormat2Day(date: Date): string {
    const Y = date.getFullYear();
    const M = date.getMonth() + 1;
    const D = date.getDate();
    return `${Y}-${M < 10 ? '0' + M : M}-${D < 10 ? '0' + D : D}`;
}

export function getStartOfDay(date: Date): MiliSeconds {
    return new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
    ).getTime();
}

export function dayFormat2Date(day: string): Date {
    return new Date(`${day} 00:00:00`);
}

export const ONE_DAY_TIME_SPAN = 24 * 60 * 60 * 1000;
