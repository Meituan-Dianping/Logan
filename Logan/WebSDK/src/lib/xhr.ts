var noop = () => {};
interface XHROpts {
    url: string;
    type: 'GET' | 'POST';
    success?: Function;
    fail?: Function;
    withCredentials: boolean;
    header?: any;
    data?: Object;
}
export default function(opts: XHROpts) {
    const useXDomainRequest: boolean = window.hasOwnProperty('XDomainRequest');
    let req = useXDomainRequest
        ? new (window as any).XDomainRequest()
        : new XMLHttpRequest();
    req.open(opts.type || 'GET', opts.url, true);
    req.success = opts.success || noop;
    req.fail = opts.fail || noop;
    req.withCredentials = !!opts.withCredentials;
    if (useXDomainRequest) {
        req.onload = opts.success || noop;
        req.onerror = opts.fail || noop;
        req.onprogress = noop;
    } else {
        req.onreadystatechange = () => {
            if (req.readyState == 4) {
                let status = req.status;
                if (status >= 200) {
                    try {
                        let response = JSON.parse(req.responseText);
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
            for (let key in opts.header) {
                if (opts.header.hasOwnProperty(key)) {
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
