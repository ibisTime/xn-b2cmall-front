define([
    'app/controller/base',
    'app/util/ajax',
    'app/module/validate/validate',
    'app/module/smsCaptcha/smsCaptcha',
    'app/module/imgCaptcha/imgCaptcha'
], function(base, Ajax, Validate, smsCaptcha, imgCaptcha) {
    var COMPANYCODE = "";
    init();

    function init() {
        if (COMPANYCODE = sessionStorage.getItem("compCode")) {
            addListeners();
            $("#captchaImg").click();
        } else {
            base.getCompanyByUrl()
                .then(function(res) {
                    if (COMPANYCODE = sessionStorage.getItem("compCode")) {
                        addListeners();
                        $("#captchaImg").click();
                    } else {
                        base.showMsg(res.msg);
                    }
                }, function() {
                    base.showMsg("非常抱歉，暂时无法获取公司信息!");
                });
        }
        var url = "./login.html?return=" + base.getReturnParam();
        $("#toLogin").attr("href", url);
    }

    function addListeners() {
        $.validator.addMethod("equalTo3", function(value, element) {
            var returnVal = imgCaptcha.checkCaptcha(value);
            !returnVal && $("#captchaImg").click();
            return this.optional(element) || returnVal;
        }, "验证码错误");
        $("#registForm").validate({
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
                captcha: {
                    required: true,
                    equalTo3: true
                }
            },
            onkeyup: false
        });
        $("#password")
            .on("focus", function() {
                $(this).parent().find(".register_verifycon")
                    .css({
                        "display": "block"
                    });
            })
            .on("blur", function() {
                $(this).parent().find(".register_verifycon")
                    .css({
                        "display": "none"
                    });
            });
        smsCaptcha.init({
            checkInfo: function () {
                return $("#mobile").valid() && $("#captcha").valid();
            },
            bizType: "805076",
            errorFn: function () {
                $("#captchaImg").click();
            }
        });
        $("#registerBtn").on("click", function(e) {
            register();
        });
        $("#captchaImg").on("click", function() {
            $(this).text( imgCaptcha.createCaptcha() );
        });
    }

    function finalRegister() {
        var param = {
            "mobile": $("#mobile").val(),
            "loginPwd": $("#password").val(),
            "smsCaptcha": $("#verification").val(),
            "loginPwdStrength": base.calculateSecurityLevel($("#password").val()),
            "companyCode": COMPANYCODE
        };
        Ajax.post("805076", { json: param })
            .then(function(response) {
                if (response.success) {
                    loginUser({
                        "loginName": param.mobile,
                        "loginPwd": param.loginPwd,
                        "companyCode": COMPANYCODE,
                        "kind": "f1"
                    });
                } else {
                    createCaptcha();
                    base.showMsg(response.msg);
                    $("#registerBtn").removeAttr("disabled").val("注册");
                }
            }, function() {
                base.showMsg("非常抱歉，注册失败");
                createCaptcha();
                $("#registerBtn").removeAttr("disabled").val("注册");
            });
    }

    function loginUser(param) {
        Ajax.post("805043", { json: param })
            .then(function(response) {
                if (response.success) {
                    base.setCommonSessionUser(response);
                    base.goBackUrl("./user_info.html");
                } else {
                    base.showMsg("注册成功！");
                    base.clearSessionUser();
                    setTimeout(function() {
                        location.href = "./login.html?return=" + base.getReturnParam();
                    }, 1000);
                }
            }, function() {
                base.showMsg("注册成功！");
                base.clearSessionUser();
                setTimeout(function() {
                    location.href = "./login.html?return=" + base.getReturnParam();
                }, 1000);
            });
    }

    function register() {
        if ($("#registForm").valid()) {
            $("#registerBtn").attr("disabled", "disabled").val("注册中...");
            finalRegister();
        }
    }
});