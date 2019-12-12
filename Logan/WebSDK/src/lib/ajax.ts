import XHR from './xhr';
export async function ajaxPost(url: string, data: Object) {
    return new Promise((resolve, reject) => {
        XHR({
            url: url,
            type: 'POST',
            data: JSON.stringify(data),
            withCredentials: true,
            header: {
                'Content-Type': 'application/json',
                Accept: 'application/json,text/javascript'
            },
            success: (res: any) => {
                resolve(res);
            },
            fail: (err: any) => {
                reject(err || new Error('Ajax error'));
            }
        });
    });
}
