define([
    'app/controller/base',
    'app/util/ajax',
    'Handlebars'
], function(base, Ajax, Handlebars) {
    var code = base.getUrlParam("code") || "",
        addressTmpl = __inline("../ui/pay-order-address.handlebars");
    init();

    function init() {
        if (!base.isLogin()) {
            location.href = "../user/login.html?return=" + base.makeReturnUrl();
        } else {
            queryOrder();
            addListener();
        }
    }

    function queryOrder() {
        var postCode = "808072",
            config = {
                "code": code
            };
        Ajax.get(postCode, { json: config })
            .then(function(response) {
                if (response.success) {
                    var data = response.data,
                        invoiceModelLists = data.productOrderList;
                    if (data.status !== "1") {
                        location.href = "../user/order_list.html";
                    }
                    $("#cont").remove();
                    //收货信息编号
                    if (invoiceModelLists.length) {
                        $("#cont").remove();
                        data.totalAmount = ((+data.amount + (+data.yunfei)) / 1000).toFixed(2);
                        $("#addressDiv").html(addressTmpl(data));
                    } else {
                        $("#cont").remove();
                        doError("#container");
                    }
                } else {
                    $("#cont").remove();
                    doError("#container");
                }
            }, function() {
                $("#cont").remove();
                doError("#container");
            });
    }

    function doError(cc) {
        $(cc).html('<div class="bg_fff" style="text-align: center;line-height: 150px;">暂时无法获取订单信息</div>');
    }

    function addListener() {
        $("#sbtn").on("click", function(e) {
            e.stopPropagation();
            $("#loaddingIcon").removeClass("hidden");
            Ajax.post('808052', {
                json: {
                    code: code
                }
            }).then(function(response) {
                if (response.success) {
                    location.href = "./pay_success.html";
                } else {
                    $("#loaddingIcon").addClass("hidden");
                    base.showMsg(response.msg);
                }
            }, function() {
                $("#loaddingIcon").addClass("hidden");
                base.showMsg("非常抱歉，订单支付失败");
            });
        });
    }
});