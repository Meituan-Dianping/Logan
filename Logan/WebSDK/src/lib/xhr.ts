const NOOP = function (): void { /* Noop */ };
interface XHROpts {
    url: string;
    type: 'GET' | 'POST';
    success?: Function;
    fail?: Function;
    withCredentials: boolean;
    header?: any;
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
    req.withCredentials = !!opts.withCredentials;
    if (useXDomainRequest) {
        req.onload = opts.success || NOOP;
        req.onerror = opts.fail || NOOP;
        req.onprogress = NOOP;
    } else {
        req.onreadystatechange = function (): void {
            if (req.readyState == 4) {
                const status = req.status;
                if (status >= 200) {
                    try {
                        const response = JSON.parse(req.responseText);
                        opts.success && opts.success(response);
                    } catch (e) {
                        opts.fail && opts.fail(e);
                    }
                } else {
                    opts.fail && opts.fail(req.statusText);
                }
            }
        };
    }
    if (opts.type === 'POST') {
        if (opts.header && !useXDomainRequest) {
            for (const key in opts.header) {
                if (key in opts.header) {
                    req.setRequestHeader(key, opts.header[key]);
                }
            }
        }
        req.send(opts.data);
    } else {
        req.send();
    }
    return req;
}
