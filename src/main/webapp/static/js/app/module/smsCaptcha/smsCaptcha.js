define([
    'app/controller/base',
    'app/util/ajax',
    'jquery'
], function (base, Ajax, $) {
    var defaultOptions = {
        id: "getVerification",
        mobile: "mobile",
        checkInfo: function () {
            return $("#" + this.mobile).valid();
        },
        sendCode: '805904',
        //errorFn: function () {}
    };
    function handleSendVerifiy() {
        var verification = $("#" + defaultOptions.id);
        verification.attr("disabled", "disabled");
        Ajax.post(defaultOptions.sendCode, {
            json: {
                "bizType": defaultOptions.bizType,
                "kind": "f1",
                "mobile": $("#" + defaultOptions.mobile).val()
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
                defaultOptions.errorFn && defaultOptions.errorFn();
                base.showMsg(response.msg);
                verification.val("获取验证码").removeAttr("disabled");
            }
        }, function() {
            defaultOptions.errorFn && defaultOptions.errorFn();
            base.showMsg("验证码获取失败");
            verification.val("获取验证码").removeAttr("disabled");
        });
    }

    return {
        init: function (options) {
            $.extend(defaultOptions, options);
            $("#" + defaultOptions.id).on("click", function() {
                defaultOptions.checkInfo() && handleSendVerifiy();
            });
        }
    }
});