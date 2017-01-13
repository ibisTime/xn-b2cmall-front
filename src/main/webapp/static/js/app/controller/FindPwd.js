define([
    'app/controller/base',
    'app/util/ajax',
    'app/module/validate/validate',
    'app/module/smsCaptcha/smsCaptcha'
], function(base, Ajax, Validate, smsCaptcha) {
    var COMPANYCODE;
    init();

    function init() {
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

    function addListeners() {
        $("#findForm").validate({
            'rules': {
                mobile: {
                    required: true,
                    mobile: true
                },
                password: {
                    required: true,
                    maxlength: 16,
                    minlength: 6,
                    isNotFace: true
                },
                verification: {
                    required: true,
                    sms: true
                },
                repassword: {
                    required: true,
                    equalTo: "#password"
                }
            },
            onkeyup: false
        });
        $("#password")
            .on("focus", function() {
                $(this).siblings(".register_verifycon")
                    .css({
                        "display": "block"
                    });
            })
            .on("blur", function() {
                $(this).siblings(".register_verifycon")
                    .css({
                        "display": "none"
                    });
            });
        $("#repassword")
            .on("focus", function() {
                $(this).siblings(".register_verifycon")
                    .css({
                        "display": "block"
                    });
            })
            .on("blur", function() {
                $(this).siblings(".register_verifycon")
                    .css({
                        "display": "none"
                    });
            });
        $("#sbtn").on("click", function() {
            valide();
        });
        smsCaptcha.init({
            bizType: "805171"
        });
    }

    function valide() {
        $("#findForm").valid() && findPassword();
    }

    function findPassword() {
        $("#sbtn").attr("disabled", "disabled").text("设置中...");
        Ajax.post("805171", {
                json: {
                    "mobile": $("#mobile").val(),
                    "smsCaptcha": $("#verification").val(),
                    "newLoginPwd": $("#password").val(),
                    "loginPwdStrength": base.calculateSecurityLevel($("#password").val()),
                    "companyCode": COMPANYCODE
                }
            })
            .then(function(response) {
                if (response.success) {
                    doSuccess();
                } else {
                    $("#sbtn").removeAttr("disabled").text("设置");
                    base.showMsg(response.msg);
                }
            }, function() {
                $("#sbtn").removeAttr("disabled").text("设置");
                base.showMsg("密码设置失败，请稍后重试！");
            });
    }

    function doSuccess() {
        $("#sbtn").text("设置");
        base.showMsg("恭喜您，密码设置成功！");
        setTimeout(function() {
            base.goBackUrl("./login.html");
        }, 1000);
    }
});