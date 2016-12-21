define([
    'app/controller/base',
    'app/util/ajax',
    'app/util/validate'
], function(base, Ajax, Validate) {
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
        $("#getVerification").on("click", function() {
            $("#mobile").valid() && handleSendVerifiy();
        });
    }

    function handleSendVerifiy() {
        var verification = $("#getVerification");
        verification.attr("disabled", "disabled");
        Ajax.post('805904', {
            json: {
                "bizType": "805153",
                "kind": "f1",
                "mobile": $("#mobile").val()
            }
        }).then(function(response) {
            if (response.success) {
                for (var i = 0; i <= 60; i++) {
                    (function(i) {
                        setTimeout(function() {
                            if (i < 60) {
                                verification.val((60 - i) + "s");
                            } else {
                                verification.val("获取验证码").removeAttr("disabled");
                            }
                        }, 1000 * i);
                    })(i);
                }
            } else {
                base.showMsg(response.msg);
                verification.val("获取验证码").removeAttr("disabled");
            }
        }, function() {
            base.showMsg("验证码获取失败");
            verification.val("获取验证码").removeAttr("disabled");
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