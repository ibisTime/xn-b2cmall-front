define([
    'app/controller/base',
    'app/util/ajax',
    'app/util/validate'
], function(base, Ajax, Validate) {
    init();

    function init() {
        if (!base.isLogin()) {
            location.href = "./login.html?return=" + base.makeReturnUrl();
        } else {
            addListeners();
        }
    }

    function addListeners() {
        $("#resetForm").validate({
            'rules': {
                origPassword: {
                    required: true,
                    maxlength: 16,
                    minlength: 6,
                    isNotFace: true
                },
                password: {
                    required: true,
                    maxlength: 16,
                    minlength: 6,
                    isNotFace: true
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
    }

    function valide() {
        $("#resetForm").valid() && resetPassword();
    }

    function resetPassword() {
        $("#sbtn").attr("disabled", "disabled").text("设置中...");
        Ajax.post('805049', {
                json: {
                    "oldLoginPwd": $("#origPassword").val(),
                    "newLoginPwd": $("#password").val(),
                    "loginPwdStrength": base.calculateSecurityLevel($("#password").val())
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
                base.showMsg("非常抱歉，登录密码修改失败");
            });
    }

    function doSuccess() {
        $("#sbtn").text("设置");
        base.showMsg("登录密码修改成功!");
        setTimeout(function() {
            base.logout();
            location.href = './login.html';
        }, 1000);
    }
});