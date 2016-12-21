define([
    'app/controller/base',
    'app/util/ajax'
], function(base, Ajax) {
    init();

    function init() {
        var code = base.getUrlParam("code"),
            companyCode = "";
        if (companyCode = sessionStorage.getItem("compCode")) {
            if (code) {
                wxLogin({
                    code: code,
                    companyCode: companyCode
                });
            } else {
                base.showMsg("非常抱歉，微信授权失败!");
                error();
            }
        } else {
            base.getCompanyByUrl()
                .then(function(res) {
                    if (companyCode = sessionStorage.getItem("compCode")) {
                        wxLogin({
                            code: code,
                            companyCode: companyCode
                        });
                    } else {
                        base.showMsg(res.msg);
                        error();
                    }
                }, function() {
                    base.showMsg("非常抱歉，暂时无法获取公司信息!");
                    error();
                });
        }
    }

    function wxLogin(param) {
        Ajax.get(APIURL + "/auth2/login/wx", param)
            .then(function(res) {
                if (res.success) {
                    base.setWxSessionUser(res);
                    location.href = "./user_info.html";
                } else {
                    base.clearSessionUser();
                    $("#loaddingIcon").remove();
                    base.showMsg(res.msg);
                    error();
                }
            }, function() {
                $("#loaddingIcon").remove();
                base.clearSessionUser();
                base.showMsg("非常抱歉，微信授权失败!");
                error();
            });
    }

    function error() {
        setTimeout(function() {
            location.href = "./login.html";
        }, 1500);
    }
});