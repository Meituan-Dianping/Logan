import XHR from './xhr';
export default async (url: string, data?: any, withCredentials?: boolean, type?: 'GET' | 'POST' | string, headers?: Record<string, any>): Promise<any> => {
    return new Promise((resolve, reject) => {
        XHR({
            url,
            type: type || 'GET',
            data,
            withCredentials: !!withCredentials,
            headers: headers,
            success: (responseText: any) => {
                resolve(responseText);
            },
            fail: (err: string) => {
                reject(new Error(err || 'Request failed'));
            }
        });
    });
};
