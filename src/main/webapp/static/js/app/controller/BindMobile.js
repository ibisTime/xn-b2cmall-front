define([
    'app/controller/base',
    'app/util/ajax',
    'app/module/validate/validate',
    'app/module/smsCaptcha/smsCaptcha'
], function(base, Ajax, Validate, smsCaptcha) {
    init();
    var COMPANYCODE;

    function init() {
        if (!base.isLogin()) {
            location.href = "./login.html?return=" + base.makeReturnUrl();
        } else {
            if (COMPANYCODE = sessionStorage.getItem("compCode")) {
                addListeners();
            } else {
                base.getCompanyByUrl()
                    .then(function(res) {
                        if (COMPANYCODE = sessionStorage.getItem("compCode")) {
                            addListeners();
                        } else {
                            base.showMsg(res.msg);
                        }
                    }, function() {
                        base.showMsg("非常抱歉，暂时无法获取公司信息!");
                    });
            }
        }
    }

    function addListeners() {
        $("#bindForm").validate({
            'rules': {
                mobile: {
                    required: true,
                    mobile: true
                },
                verification: {
                    required: true,
                    sms: true
                }
            },
            onkeyup: false
        });
        $("#sbtn").on("click", function(e) {
            bindMobile();
        });
        smsCaptcha.init({
            bizType: "805153"
        });
    }

    function doSuccess() {
        $("#sbtn").text("设置");
        base.showMsg("手机号绑定成功！");
        setTimeout(function() {
            location.href = './user_info.html';
        }, 1000);
    }

    function finalBindMobile() {
        $("#sbtn").attr("disabled", "disabled").text("设置中...");
        var param = {
            "mobile": $("#mobile").val(),
            "smsCaptcha": $("#verification").val(),
            "companyCode": COMPANYCODE
        };
        Ajax.post('805153', { json: param })
            .then(function(response) {
                if (response.success) {
                    doSuccess();
                } else {
                    $("#sbtn").removeAttr("disabled").text("设置");
                    base.showMsg(response.msg);
                }
            }, function() {
                $("#sbtn").removeAttr("disabled").text("设置");
                base.showMsg("手机号绑定失败，请稍后重试");
            });
    }

    function bindMobile() {
        $("#bindForm").valid() && finalBindMobile();
    }
});