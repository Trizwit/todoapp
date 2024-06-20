/*
* fastn's ftd.http modified to take in an extra @module
*/
function http2(url, method, module, headers, ...body) {
    console.assert(typeof module == "string");
    if (url instanceof fastn.mutableClass) url = url.get();
    if (method instanceof fastn.mutableClass) method = method.get();
    method = method.trim().toUpperCase();
    const init = {
        method,
        headers: { "Content-Type": "application/json" },
    };
    if (headers && headers instanceof fastn.recordInstanceClass) {
        Object.assign(init.headers, headers.toObject());
    }
    if (method !== "GET") {
        init.headers["Content-Type"] = "application/json";
    }
    if (
        body &&
        body instanceof fastn.recordInstanceClass &&
        method !== "GET"
    ) {
        init.body = JSON.stringify(body.toObject());
    } else if (body && method !== "GET") {
        let json = body[0];
        if (
            body.length !== 1 ||
            (body[0].length === 2 && Array.isArray(body[0]))
        ) {
            let new_json = {};
            // @ts-ignore
            for (let [header, value] of Object.entries(body)) {
                let [key, val] =
                    value.length == 2 ? value : [header, value];

                new_json[key] = fastn_utils.getFlattenStaticValue(val);
            }
            json = new_json;
        }
        init.body = JSON.stringify(json);
    }

    let json;

    fetch(url, init)
        .then((res) => {
            if (!res.ok) {
                return new Error("[http]: Request failed: " + res);
            }

            return res.json();
        })
        .then((response) => {
            console.log("[http]: Response OK", response);
            if (response.redirect) {
                window.location.href = response.redirect;
            } else if (!!response && !!response.reload) {
                window.location.reload();
            } else {
                let data = {};
                if (!!response.errors) {
                    for (let key of Object.keys(response.errors)) {
                        let value = response.errors[key];
                        if (Array.isArray(value)) {
                            // django returns a list of strings
                            value = value.join(" ");
                            // also django does not append `-error`
                            key = key + "-error";
                            key = module + "#" + key;
                        }
                        // @ts-ignore
                        data[key] = value;
                    }
                }
                if (!!response.data) {
                    if (Object.keys(data).length !== 0) {
                        console.log(
                            "both .errors and .data are present in response, ignoring .data",
                        );
                    } else {
                        for (let key of Object.keys(response.data)) {
                            const value = response.data[key];
                            key = module + "#" + key;
                            data[key] = value;
                        }
                    }
                }
                console.log(response);
                for (let ftd_variable of Object.keys(data)) {
                    // @ts-ignore
                    window.ftd.set_value(ftd_variable, data[ftd_variable]);
                }
            }
        })
        .catch(console.error);
    return json;
};