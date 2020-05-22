/**
 * @file This file is to arrange logan operations in queue, in order to avoid parallel async writing operations on db which may cause race condition problems.
 * 
 * 由于Logan的log方法涉及LoganDB日志存储空间大小的改写、report方法在做增量上报时涉及本地日志数据的删除，这些方法被异步执行时可能会发生竞态条件导致DB内数据不准确，进而导致已存储的日志大小远超过存储空间限制、在触发上报时段写入的日志被删除这类问题，因此Logan需要内部维护该执行列表，确保这些异步方法按序一一执行。
 * 
 */
const loganOperationQueue: PromiseItem[] = [];
let operationRunning: boolean = false;
interface PromiseItem {
    asyncF: Function;
    resolution: Function;
    rejection: Function;
}
async function loganOperationsRecursion (): Promise<void> {
    while (loganOperationQueue.length > 0 && !operationRunning) {
        const nextOperation = loganOperationQueue.shift() as PromiseItem;
        operationRunning = true;
        try {
            const result = await nextOperation.asyncF();
            nextOperation.resolution(result);
        } catch (e) {
            nextOperation.rejection(e);
        }
        operationRunning = false; /* eslint-disable-line */ // No need to worry require-atomic-updates here.
        loganOperationsRecursion();
    }
}
export function invokeInQueue (asyncF: Function): Promise<any> {
    return new Promise((resolve, reject) => {
        loganOperationQueue.push({
            asyncF,
            resolution: resolve,
            rejection: reject
        });
        loganOperationsRecursion();
    });
}