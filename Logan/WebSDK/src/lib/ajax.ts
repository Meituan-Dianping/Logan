import XHR from './xhr';
export async function ajaxPost (url: string, data: any, withCredentials: boolean, header?: Record<string, any>): Promise<any> {
    return new Promise((resolve, reject) => {
        XHR({
            url,
            type: 'POST',
            data,
            withCredentials,
            header: Object.assign({
                'Content-Type': 'application/json',
                'Accept': 'application/json,text/javascript'
            }, header),
            success: (res: any) => {
                resolve(res);
            },
            fail: (err: any) => {
                reject(err || new Error('Ajax error'));
            }
        });
    });
}
