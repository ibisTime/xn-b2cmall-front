define(["jquery"], function($) {
    var cache = {};

    function getUrl() {
        return "/api";
    }

    function clearSessionUser() {
        sessionStorage.removeItem("user"); //userId
        sessionStorage.removeItem("tk"); //token
        sessionStorage.removeItem("kind"); //是否微信登录
        sessionStorage.removeItem("m"); //手机号
    }
    return {
        get: function(code, param, cache) {
            if (typeof param == 'undefined' || typeof param == "boolean") {
                cache = param;
                param = {};
            }

            return this.post(code, {
                json: param,
                cache: cache || true,
                close: true
            }, true);
        },

        post: function(code, options) {
            var param = options.json;

            var token = sessionStorage.getItem("tk") || "",
                userId = sessionStorage.getItem("user") || "";

            token && (param["token"] = token);
            userId && (param["userId"] = userId);
            param["systemCode"] = SYSTEM_CODE;

            var sendUrl = getUrl(code);
            var sendParam = {
                code: code,
                json: param
            };
            var cache_url = sendUrl + JSON.stringify(sendParam);
            if (!options.cache) {
                delete cache[cache_url];
            }
            if (!cache[cache_url]) {
                sendParam.json = JSON.stringify(param);
                cache[cache_url] = $.ajax({
                    type: 'post',
                    url: sendUrl,
                    data: sendParam
                });
            }
            return cache[cache_url].then(function(res) {
                if(res.errorCode == "4"){
                    clearSessionUser();
                    location.href = "../user/login.html?return=" + encodeURIComponent(location.pathname + location.search);
                }
                var result = {};
                res.errorCode == "0" ? (result.success = true, result.data = res.data) :
                    (result.success = false, result.msg = res.errorInfo);
                return result;
            }, function(obj, error, msg) {
                console.log(msg);
            });
        }
    };
});