define([
    'app/controller/base',
    'app/util/ajax',
    'app/util/dict',
    'Handlebars'
], function (base, Ajax, Dict, Handlebars) {
    $(function () {
        var code = base.getUrlParam('code'),
            receiptType = Dict.get("receiptType"),
            orderStatus = Dict.get("orderStatus"),
            fastMail = Dict.get("fastMail"),
            addrTmpl = __inline("../ui/order-detail-addr.handlebars"),
            contTmpl = __inline("../ui/order-detail-imgs.handlebars");

        init();

        function init() {
            if (!base.isLogin()) {
                location.href = "../user/login.html?return=" + base.makeReturnUrl();
            } else {
                if (code) {
                    Handlebars.registerHelper('formatPrice', function (num) {
                        return (+num / 1000).toFixed(2);
                    });
                    Handlebars.registerHelper('formatPic', function (pic) {
                        return pic.split(/\|\|/)[0];
                    });
                    $("#orderCode").text(code);
                    getOrder();
                } else {
                    base.showMsg("未传入订单编号");
                }
            }
        }

        function getOrder() {
            var config = {
                "code": code
            };
            Ajax.get("808072", config)
                .then(function (response) {
                    $("#loaddingIcon").addClass("hidden");
                    if (response.success) {
                        var data = response.data,
                            invoiceModelLists = data.productOrderList;

                        $("#orderDate").text(getMyDate(data.applyDatetime));
                        $("#orderStatus").text(getStatus(data.status));
                        if (data.status == "1") {
                            $("#zffoot").removeClass("hidden");
                            $("#totalAmount").html(((+data.amount + (+data.yunfei)) / 1000).toFixed(2));
                        } else if (data.status == "2") {
                            $("#chfoot").removeClass("hidden");
                            $("#totalAmount").html((+data.payAmount / 1000).toFixed(2));
                        } else if (data.status == "3") {
                            $("#shfoot").removeClass("hidden");
                            $("#totalAmount").html((+data.payAmount / 1000).toFixed(2));
                        } else {
                            $("#totalAmount").html((+data.payAmount / 1000).toFixed(2));
                        }
                        if (data.applyNote) {
                            $("#applyNoteTitle, #applyNoteInfo").removeClass("hidden");
                            $("#applyNoteInfo").text(data.applyNote);
                        }
                        if (data.remark) {
                            $("#remarkTitle, #remarkInfo").removeClass("hidden");
                            $("#remarkInfo").text(data.remark);
                        }
                        addListeners();
                        if (invoiceModelLists.length) {

                            $("#od-ul").html(contTmpl({items: invoiceModelLists}));

                            $("#addressDiv").html(addrTmpl(data));
                            if (data.logisticsCode) {
                                $("#logisticsTitle, #logisticsInfo").removeClass("hidden");
                                $("#logisticsComp").text(fastMail[data.logisticsCompany]);
                                $("#logisticsNO").text(data.logisticsCode);
                            }
                        } else {
                            base.showMsg("暂时无法获取订单相关商品信息！");
                        }
                    } else {
                        base.showMsg("暂时无法获取订单信息！");
                    }
                }, function () {
                    $("#loaddingIcon").addClass("hidden");
                    base.showMsg("暂时无法获取订单信息！");
                });
        }

        function getMyDate(value) {
            var date = new Date(value);
            return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +
                get2(date.getHours()) + ":" + get2(date.getMinutes()) + ":" + get2(date.getSeconds());
        }

        function get2(val) {
            return val < 10 ? "0" + val : val;
        }

        function addListeners() {
            $("#cbtn").length && $("#cbtn").on("click", function () {
                $("#od-mask, #od-tipbox").removeClass("hidden");
            });
            $("#sbtn").length && $("#sbtn").on("click", function () {
                location.href = '../operator/pay_order.html?code=' + code;
            });
            $("#chbtn").on("click", cuihuo);
            $("#shbtn").on("click", shouhuo);
            $("#odOk").on("click", function () {
                $("#od-mask, #od-tipbox").addClass("hidden");
                if (base.isNotFace($("#remark").val())) {
                    cancelOrder();
                }else{
                    base.showMsg("取消原因中不能包含特殊字符", 2000);
                }
            });
            $("#odCel").on("click", function () {
                $("#od-mask, #od-tipbox").addClass("hidden");
            });
        }

        function cuihuo() {
            Ajax.post("808058", {
                json: {code: code}
            })
                .then(function (res) {
                    if (res.success) {
                        base.showMsg("催货请求发送成功");
                    } else {
                        base.showMsg(res.msg);
                    }
                }, function () {
                    base.showMsg("非常抱歉，催货请求发送失败");
                });
        }

        function shouhuo() {
            Ajax.post("808057", {
                json: {code: code, remark: "确认收货"}
            })
                .then(function (res) {
                    if (res.success) {
                        base.showMsg("收货成功");
                        setTimeout(function () {
                            location.href = "./order_list.html";
                        }, 1500)
                    } else {
                        base.showMsg(res.msg);
                    }
                }, function () {
                    base.showMsg("非常抱歉，确认收货失败");
                });
        }

        function getStatus(status) {
            return orderStatus[status] || "未知状态";
        }

        function cancelOrder() {
            var config = {
                code: code,
                remark: $("#remark").val()
            };
            $("#loaddingIcon").removeClass("hidden");
            Ajax.post("808053", {json: config})
                .then(function (response) {
                    $("#loaddingIcon").addClass("hidden");
                    if (response.success) {
                        base.showMsg("取消订单成功！");
                        setTimeout(function () {
                            location.href = "./order_list.html";
                        }, 1500);
                    } else {
                        base.showMsg(response.msg);
                    }
                }, function () {
                    $("#loaddingIcon").addClass("hidden");
                    base.showMsg("非常抱歉，取消订单失败");
                });
        }
    });
});