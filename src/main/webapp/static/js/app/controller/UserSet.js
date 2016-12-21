define([
    'app/controller/base'
], function(base) {
    init();

    function init() {
        if (!base.isLogin()) {
            location.href = "./login.html?return=" + base.makeReturnUrl();
        } else {
            if (base.isWxLogin()) {
                if (sessionStorage.getItem("m")) {
                    $("#xgsjh").removeClass("hidden");
                } else {
                    $("#bdsjh").removeClass("hidden");
                }
            } else {
                $("#dlmm, #xgsjh").removeClass("hidden");
            }
            addListeners();
        }
    }

    function addListeners() {
        $("#loginOut").on("click", function() {
            base.logout();
            location.href = '../home/index.html';
        });
    }
});