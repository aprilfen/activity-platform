const longStr = require('./longStr')

const $URL = function () {
    var e = {}
        , t = {};
    return function (n) {
        var r = 0;
        n = n.match(/..../g);
        for (var i = 129; i <= 254; i++)
            for (var o = 64; o <= 254; o++)
                e[n[r++]] = ("%" + i.toString(16) + "%" + o.toString(16)).toUpperCase();
        for (var a in e)
            t[e[a]] = a
    }(longStr.replace(/#(\d+)\$/g, function (e, t) {
        return Array(+t + 3).join("#")
    }).replace(/#/g, "####").replace(/(\w\w):([\w#]+)(?:,|$)/g, function (e, t, n) {
        return n.replace(/../g, function (e) {
            return "##" != e ? t + e : e
        })
    })),
    {
        encode: function (t) {
            return t.replace(/./g, function (t) {
                var n = t.charCodeAt(0);
                if (8364 == (r = n) || r <= 127 && r >= 0)
                    return encodeURIComponent(t);
                var r, i = n.toString(16);
                return 4 != i.length && (i = ("000" + i).match(/....$/)[0]),
                    e[i] || t
            })
        },
        decode: function (e) {
            return e.replace(/%[0-9A-F]{2}%[0-9A-F]{2}/g, function (e) {
                return e in t ? String.fromCharCode("0x" + t[e]) : e
            }).replace(/%[\w]{2}/g, function (e) {
                return decodeURIComponent(e)
            })
        }
    }
}();

function toGbkBytes(e) {
    e = $URL.encode(e);
    for (var t = new Array, n = 0; n < e.length; n++) {
        var r = e.charAt(n);
        if ("%" == r) {
            var i = e.charAt(n + 1) + e.charAt(n + 2);
            i = parseInt(i, 16),
                i |= -256,
                t.push(i),
                n += 2
        } else
            t.push(r.charCodeAt())
    }
    return t
}


module.exports = {
    toGbkBytes
}