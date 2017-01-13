define([
    'app/controller/base',
    'app/util/ajax',
    'app/module/validate/validate',
    'app/module/smsCaptcha/smsCaptcha'
], function (base, Ajax, Validate, smsCaptcha) {
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
        smsCaptcha.init({
            bizType: "805047"
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