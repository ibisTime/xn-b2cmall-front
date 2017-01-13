define([
    'app/controller/base',
    'app/util/ajax',
    'app/module/validate/validate'
], function (base, Ajax, Validate) {
    var code = base.getUrlParam("c"),
        type = base.getUrlParam("t") || 0;
    init();

    function init() {
        if (!base.isLogin()) {
            location.href = "../user/login.html?return=" + base.makeReturnUrl();
        } else {
            if (code) {
                getAddress();
                $("#sbtn").text("保存修改");
                document.title = "修改地址";
            } else {
                $("#loaddingIcon").addClass("hidden");
                addListeners();
            }
        }
    }

    function getAddress() {
        Ajax.get("805166", {code: code})
            .then(function (res) {
                $("#loaddingIcon").addClass("hidden");
                if (res.success) {
                    var data = res.data;
                    $("#accept_name").val(data.addressee);
                    $("#mobile").val(data.mobile);
                    $("#provinceCode").val(data.province);
                    $("#cityCode").val(data.city);
                    $("#districtCode").val(data.district);
                    $("#street").val(data.detailAddress);
                    addListeners();
                } else {
                    base.showMsg("暂时无法获取地址信息");
                }
            }, function () {
                $("#loaddingIcon").addClass("hidden");
                base.showMsg("暂时无法获取地址信息");
            });
    }

    function addListeners() {
        $("#addForm").validate({
            'rules': {
                accept_name: {
                    required: true,
                    maxlength: 20,
                    isNotFace: true
                },
                mobile: {
                    required: true,
                    mobile: true
                },
                provinceCode: {
                    required: true,
                    maxlength: 20,
                    isNotFace: true
                },
                cityCode: {
                    required: true,
                    maxlength: 20,
                    isNotFace: true
                },
                districtCode: {
                    required: true,
                    maxlength: 20,
                    isNotFace: true
                },
                street: {
                    required: true,
                    maxlength: 128,
                    isNotFace: true
                }
            },
            onkeyup: false
        });
        $("#sbtn").on("click", function () {
            if ($("#addForm").valid()) {
                var config = {
                    "addressee": $("#accept_name").val(),
                    "mobile": $("#mobile").val(),
                    "province": $("#provinceCode").val(),
                    "city": $("#cityCode").val(),
                    "district": $("#districtCode").val(),
                    "detailAddress": $("#street").val(),
                    "isDefault": "1"
                };
                if (code) {
                    config.code = code;
                    editNewAddr(config)
                } else {
                    addNewAddr(config);
                }
            }
        });
    }

    function addNewAddr(config) {
        $("#loaddingIcon").removeClass("hidden");
        Ajax.post("805160", {json: config})
            .then(function (response) {
                $("#loaddingIcon").addClass("hidden");
                if (response.success) {
                    if(type == 0){
                        base.goBackUrl("./address_list.html?t=1");
                    }else{
                        history.back();
                    }
                } else {
                    base.showMsg(response.msg);
                }
            }, function () {
                $("#loaddingIcon").addClass("hidden");
                base.showMsg("收货地址添加失败！");
            });
    }

    function editNewAddr(config) {
        $("#loaddingIcon").removeClass("hidden");
        Ajax.post("805162", {json: config})
            .then(function (response) {
                $("#loaddingIcon").addClass("hidden");
                if (response.success) {
                    if(type == 0){
                        base.goBackUrl("./address_list.html?t=1");
                    }else{
                        history.back();
                    }
                } else {
                    base.showMsg(response.msg);
                }
            }, function () {
                $("#loaddingIcon").addClass("hidden");
                base.showMsg("收货地址修改失败！");
            });
    }
});