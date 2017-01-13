define([
    'app/controller/base',
    'app/util/ajax'
], function(base, Ajax) {
    init();

    function init() {
        var code = base.getUrlParam("c");
        if (!base.isLogin()) {
            base.showMsg("请先进行登录");
            setTimeout(function() {
                location.href = "../user/login.html?return=" + base.makeReturnUrl();
            }, 1500);
        } else if (!code) {
            base.showMsg("充值失败，未传入二维码编号");
            $("#loading").remove();
            setTimeout(function() {
                location.href = "../index.html";
            }, 1500);
        } else {
            Ajax.post("805321", {
                    json: { couponCode: code }
                })
                .then(function(res) {
                    $("#loading").remove();
                    if (res.success) {
                        $("#sucessDiv").removeClass("hidden");
                    } else {
                        base.showMsg(res.msg);
                    }
                }, function() {
                    base.showMsg("非常抱歉，充值失败");
                    $("#loading").remove();
                });
        }
    }
});