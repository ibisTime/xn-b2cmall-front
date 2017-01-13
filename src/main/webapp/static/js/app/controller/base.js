define([
    'jquery',
    'app/util/ajax',
    'app/util/dialog'
], function($, Ajax, dialog) {

    if (Number.prototype.toFixed) {
        var ori_toFixed = Number.prototype.toFixed;
        Number.prototype.toFixed = function() {
            var num = ori_toFixed.apply(this, arguments);
            if (num == 0 && num.indexOf('-') == 0) { // -0 and 0
                num = num.slice(1);
            }
            return num;
        }
    }

    String.prototype.temp = function(obj) {
        return this.replace(/\$\w+\$/gi, function(matchs) {
            var returns = obj[matchs.replace(/\$/g, "")];
            return (returns + "") == "undefined" ? "" : returns;
        });
    };

    Date.prototype.format = function(format) {
        var o = {
            "M+": this.getMonth() + 1, //month
            "d+": this.getDate(), //day
            "h+": this.getHours(), //hour
            "m+": this.getMinutes(), //minute
            "s+": this.getSeconds(), //second
            "q+": Math.floor((this.getMonth() + 3) / 3), //quarter
            "S": this.getMilliseconds() //millisecond
        };
        if (/(y+)/.test(format)) {
            format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        }

        for (var k in o) {
            if (new RegExp("(" + k + ")").test(format)) {
                format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
            }
        }
        return format;
    };

    $.prototype.serializeObject = function() {
        var a, o, h, i, e;
        a = this.serializeArray();
        o = {};
        h = o.hasOwnProperty;
        for (i = 0; i < a.length; i++) {
            e = a[i];
            if (!h.call(o, e.name)) {
                o[e.name] = e.value;
            }
        }
        return o;
    };
    var Base = {
        encodeInfo: function(info, headCount, tailCount, space) {
            headCount = headCount || 0;
            tailCount = tailCount || 0;
            info = info.trim();
            var header = info.slice(0, headCount),
                len = info.length,
                tailer = info.slice(len - tailCount),
                mask = '**************************************************', // allow this length
                maskLen = len - headCount - tailCount;
            if (space) {
                mask = '**** **** **** **** **** **** **** **** **** **** **** ****';
            }
            return maskLen > 0 ? (header + mask.substring(0, maskLen + (space ? maskLen / 4 : 0)) + (space ? ' ' : '') + tailer) : info;
        },
        getUrlParam: function(name) {
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
            var r = window.location.search.substr(1).match(reg);
            if (r != null) return decodeURIComponent(r[2]);
            return '';
        },
        findObj: function(array, key, value, key2, value2) {
            var i = 0,
                len = array.length,
                res;
            for (i; i < len; i++) {
                if (array[i][key] == value && !key2) {
                    return array[i];
                } else if (key2 && array[i][key] == value && array[i][key2] == value2) {
                    return array[i];
                }
            }
        },
        fmoney: function(s, n) {
            if (typeof s == 'undefined') {
                return '0.00';
            }
            n = n > 0 && n <= 20 ? n : 0;
            s = +((s / 1000).toFixed(n));
            var unit = '';
            if (('' + s).split('.')[0].length >= 5) {
                s = +((s / 10000).toFixed(n));
                unit = '万';
            }

            s = parseFloat((s + "").replace(/[^\d\.-]/g, "")).toFixed(n) + "";
            var l = s.split(".")[0].split("").reverse(),
                r = s.split(".")[1] || '';
            t = "";
            for (i = 0; i < l.length; i++) {
                t += l[i] + ((i + 1) % 3 == 0 && (i + 1) != l.length ? "," : "");
            }
            return t.split("").reverse().join("") + (n == 0 ? "" : ("." + r)) + unit;
        },
        isNotFace: function(value) {
            var pattern = /^[\s0-9a-zA-Z\u4e00-\u9fa5\u00d7\u300a\u2014\u2018\u2019\u201c\u201d\u2026\u3001\u3002\u300b\u300e\u300f\u3010\u3011\uff01\uff08\uff09\uff0c\uff1a\uff1b\uff1f\uff0d\uff03\uffe5\x21-\x7e]*$/;
            return pattern.test(value)
        },
        calculateSecurityLevel: function(password) {
            var strength_L = 0;
            var strength_M = 0;
            var strength_H = 0;

            for (var i = 0; i < password.length; i++) {
                var code = password.charCodeAt(i);
                // 数字
                if (code >= 48 && code <= 57) {
                    strength_L++;
                    // 小写字母 大写字母
                } else if ((code >= 65 && code <= 90) ||
                    (code >= 97 && code <= 122)) {
                    strength_M++;
                    // 特殊符号
                } else if ((code >= 32 && code <= 47) ||
                    (code >= 58 && code <= 64) ||
                    (code >= 94 && code <= 96) ||
                    (code >= 123 && code <= 126)) {
                    strength_H++;
                }
            }
            // 弱
            if ((strength_L == 0 && strength_M == 0) ||
                (strength_L == 0 && strength_H == 0) ||
                (strength_M == 0 && strength_H == 0)) {
                return "1";
            }
            // 强
            if (0 != strength_L && 0 != strength_M && 0 != strength_H) {
                return "3";
            }
            // 中
            return "2";
        },
        showMsg: function(msg, time) {
            var d = dialog({
                content: msg,
                quickClose: true
            });
            d.show();
            setTimeout(function() {
                d.close().remove();
            }, time || 1500);
        },
        makeReturnUrl: function() {
            return encodeURIComponent(location.pathname + location.search);
        },
        getReturnParam: function() {
            var re = Base.getUrlParam("return");
            if (re) {
                return encodeURIComponent(re);
            }
            return "";
        },
        goBackUrl: function(url) {
            var rUrl = Base.getUrlParam("return");
            if (rUrl) {
                location.href = rUrl;
            } else {
                location.href = url || "../index.html";
            }
        },
        addIcon: function() {
            var icon = sessionStorage.getItem("icon");
            if (icon && icon != "undefined") {
                $("head").append('<link rel="shortcut icon" type="image/ico" href="' + icon + '">');
            }
        },
        isWxLogin: function() {
            if (Base.isLogin() && sessionStorage.getItem("kind") == "wx") {
                return true;
            }
            return false;
        },
        isLogin: function() {
            return sessionStorage.getItem("user") ? true : false;
        },
        getUser: function() {
            return Ajax.get("805056");
        },
        getUserId: function() {
            return sessionStorage.getItem("user");
        },
        setCommonSessionUser: function(res) {
            sessionStorage.setItem("user", res.data.userId);
            sessionStorage.setItem("tk", res.data.token);
            sessionStorage.removeItem("kind");
        },
        setWxSessionUser: function(res) {
            sessionStorage.setItem("user", res.data.userId);
            sessionStorage.setItem("tk", res.data.token);
            sessionStorage.setItem("kind", "wx");
        },
        //清除sessionStorage中和用户相关的数据
        clearSessionUser: function() {
            sessionStorage.removeItem("user"); //userId
            sessionStorage.removeItem("tk"); //token
            sessionStorage.removeItem("kind"); //是否微信登录
            sessionStorage.removeItem("m"); //手机号
        },
        //登出
        logout: function() {
            Base.clearSessionUser();
        },
        getBanner: function(code, location) {
            return Ajax.get("806051", { "companyCode": code, "location": location, "type": "2" });
        },
        getDomain: function() {
            // var url = location.href;
            // var idx = url.indexOf("/m/");
            // if (idx != -1) {
            //     url = url.substring(0, idx);
            // }
            var url = location.protocol + "//" + location.host;
            return url
        },
        getCompanyByUrl: function() {
            var url = Base.getDomain();
            return Ajax.get("806015", { "domain": url })
                .then(function(res) {
                    if (res.success && !$.isEmptyObject(res.data)) {
                        sessionStorage.setItem("compCode", res.data.code);
                        sessionStorage.setItem("icon", res.data.icon || "");
                        sessionStorage.setItem("sTime", res.data.remark || "");
                        sessionStorage.setItem("sMobile", res.data.mobile || "");
                        Base.addIcon();
                    }
                    return res;
                });
        },
        getAboutus: function() {
            return this.getCompanyByUrl();
        },
        getGgContent: function(code) {
            return Ajax.get("805132", { code: code });
        }
    };
    Base.addIcon();
    return Base;
});