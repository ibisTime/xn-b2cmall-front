define([
    'app/controller/base',
    'app/util/ajax',
    'app/util/validate'
], function (base, Ajax, Validate) {
    init();

    function init() {
        if (!base.isLogin()) {
            location.href = "./login.html?return=" + base.makeReturnUrl();
        } else {
            addListeners();
        }
    }

    function addListeners() {
        $("#changeForm").validate({
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
        $("#sbtn").on("click", function () {
            changeMobile();
        });
        $("#getVerification").on("click", function () {
            $("#mobile").valid() && handleSendVerifiy();
        });
    }

    function handleSendVerifiy() {
        var verification = $("#getVerification");
        verification.attr("disabled", "disabled");
        Ajax.post('805904', {
            json: {
                "bizType": "805047",
                "kind": "f1",
                "mobile": $("#mobile").val()
            }
        }).then(function (response) {
            if (response.success) {
                for (var i = 0; i <= 60; i++) {
                    (function (i) {
                        setTimeout(function () {
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
        }, function () {
            base.showMsg("验证码获取失败");
            verification.val("获取验证码").removeAttr("disabled");
        });
    }

    function doSuccess() {
        $("#sbtn").text("设置");
        base.showMsg("手机号修改成功！");
        setTimeout(function () {
            location.href = './user_info.html';
        }, 1000);
    }

    function finalChangeMobile() {
        $("#sbtn").attr("disabled", "disabled").text("设置中...");
        var param = {
            "newMobile": $("#mobile").val(),
            "smsCaptcha": $("#verification").val(),
            "tradePwd": "111111",
            "isMall": "1"
        };
        Ajax.post("805047", {json: param})
            .then(function (response) {
                if (response.success) {
                    doSuccess();
                } else {
                    $("#sbtn").removeAttr("disabled").text("设置");
                    base.showMsg(response.msg);
                }
            }, function () {
                $("#sbtn").removeAttr("disabled").text("设置");
                base.showMsg("手机号修改失败，请稍后重试");
            });
    }

    function changeMobile() {
        $("#changeForm").valid() && finalChangeMobile();
    }
});