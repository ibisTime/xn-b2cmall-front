define([
    'app/controller/base',
    'app/util/ajax',
    'app/util/validate'
], function(base, Ajax, Validate) {
    var COMPANYCODE = "",
        captchaCode;
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
            var returnVal = false;
            var pattern = new RegExp("^" + captchaCode + "$", "i");
            if (pattern.test(value)) {
                returnVal = true;
            }
            !returnVal && createCaptcha();
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
        $("#getVerification").on("click", function() {
            if ($("#mobile").valid() && $("#captcha").valid()) {
                $(this).attr("disabled", "disabled");
                handleSendVerifiy();
            }
        });
        $("#registerBtn").on("click", function(e) {
            register();
        });
        $("#captchaImg").on("click", function() {
            createCaptcha();
        });
    }

    function createCaptcha() {
        var selectChar = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
            'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k',
            'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v',
            'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G',
            'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R',
            'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
        captchaCode = "";
        for (var i = 0; i < 4; i++) {
            captchaCode += selectChar[Math.floor(Math.random() * 60)];
        }
        $("#captchaImg").text(captchaCode);
    }

    function handleSendVerifiy() {
        Ajax.post('805904', {
                json: {
                    "bizType": "805076",
                    "kind": "f1",
                    "mobile": $("#mobile").val()
                }
            })
            .then(function(response) {
                if (response.success) {
                    for (var i = 0; i <= 60; i++) {
                        (function(i) {
                            setTimeout(function() {
                                if (i < 60) {
                                    $("#getVerification").val((60 - i) + "s");
                                } else {
                                    $("#getVerification").val("获取验证码").removeAttr("disabled");
                                }
                            }, 1000 * i);
                        })(i);
                    }
                } else {
                    $("#captchaImg").click();
                    base.showMsg(response.msg);
                    $("#getVerification").val("获取验证码").removeAttr("disabled");
                }
            }, function() {
                $("#captchaImg").click();
                base.showMsg('验证码获取失败');
                $("#getVerification").val("获取验证码").removeAttr("disabled");
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