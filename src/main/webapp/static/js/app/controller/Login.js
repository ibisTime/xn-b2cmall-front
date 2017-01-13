define([
    'app/controller/base',
    'app/util/ajax',
    'app/module/validate/validate',
    'app/module/foot/foot'
], function(base, Ajax, Validate, Foot) {
    var returnUrl, COMPANYCODE;

    init();

    function init() {
        Foot.addFoot();
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
        returnUrl = base.getReturnParam();
        if (returnUrl) {
            $("#toRegister").attr("href", './register.html?return=' + returnUrl);
            $("#fdPwd").attr("href", './findPwd.html?return=' + returnUrl);
        } else {
            $("#toRegister").attr("href", './register.html');
            $("#fdPwd").attr("href", './findPwd.html');
        }
    }

    function addListeners() {
        $("#loginForm").validate({
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
                }
            },
            onkeyup: false
        });

        $("#loginBtn").on('click', loginAction);

        $("#wechat").on("click", function() {
            $("#loading").removeClass("hidden");
            Ajax.get("806031", {
                    companyCode: COMPANYCODE,
                    account: "AppID"
                })
                .then(function(res) {
                    if (res.success && res.data.length) {
                        var appid = res.data[0].password,
                            redirect_uri = base.getDomain() + "/m/user/redirect.html";
                        location.href = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=" + appid + "&redirect_uri=" + redirect_uri + "&response_type=code&scope=snsapi_userinfo#wechat_redirect";
                    } else {
                        $("#loading").addClass("hidden");
                        base.showMsg("非常抱歉，微信登录失败");
                    }
                }, function() {
                    $("#loading").addClass("hidden");
                    base.showMsg("非常抱歉，微信登录失败");
                });
        });
    }

    function loginAction() {
        if ($("#loginForm").valid()) {
            $("#loginBtn").attr("disabled", "disabled").val("登录中...");
            var param = {
                "loginName": $("#mobile").val(),
                "loginPwd": $("#password").val(),
                "companyCode": COMPANYCODE,
                "kind": "f1"
            };

            Ajax.post("805043", { json: param })
                .then(function(res) {
                    if (res.success) {
                        base.setCommonSessionUser(res);
                        base.goBackUrl("./user_info.html");
                    } else {
                        base.clearSessionUser();
                        $("#loginBtn").removeAttr("disabled").val("登录");
                        base.showMsg(res.msg);
                    }
                }, function() {
                    base.clearSessionUser();
                    $("#loginBtn").removeAttr("disabled").val("登录");
                    base.showMsg("登录失败");
                });
        }
    }
});