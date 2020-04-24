const NOOP = function (): void { /* Noop */ };
interface XHROpts {
    url: string;
    type: 'GET' | 'POST' | string;
    withCredentials: boolean;
    success?: Function;
    fail?: Function;
    headers?: any;
    data?: any;
}
export default function (opts: XHROpts): XMLHttpRequest {
    const useXDomainRequest: boolean = 'XDomainRequest' in window;
    const req = useXDomainRequest
        ? new (window as any).XDomainRequest()
        : new XMLHttpRequest();
    req.open(opts.type || 'GET', opts.url, true);
    req.success = opts.success || NOOP;
    req.fail = opts.fail || NOOP;
    req.withCredentials = opts.withCredentials;
    if (useXDomainRequest) {
        req.onload = opts.success || NOOP;
        req.onerror = opts.fail || NOOP;
        req.onprogress = NOOP;
    } else {
        req.onreadystatechange = function (): void {
            if (req.readyState === 4) {
                const status = req.status;
                if (status >= 200) {
                    opts.success && opts.success(req.responseText);
                } else {
                    opts.fail && opts.fail(`Request failed, status: ${status}, responseText: ${req.responseText}`);
                }
            }
        };
    }
    if (opts.type === 'POST') {
        if (opts.headers && !useXDomainRequest) {
            for (const key in opts.headers) {
                req.setRequestHeader(key, opts.headers[key]);
            }
        }
        req.send(opts.data);
    } else {
        req.send();
    }
    return req;
}
