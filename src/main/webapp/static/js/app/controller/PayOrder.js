define([
    'app/controller/base',
    'app/util/ajax',
    'Handlebars'
], function(base, Ajax, Handlebars) {
    var code = base.getUrlParam("code") || "",
        //receiptType = Dict.get("receiptType"),
        // contentTmpl = __inline("../ui/pay-order-imgs.handlebars"),
        addressTmpl = __inline("../ui/pay-order-address.handlebars"),
        wxConfig = {},
        channel ="";

    init();

    function init() {
        if (!base.isLogin()) {
            location.href = "../user/login.html?return=" + base.makeReturnUrl();
        } else {
            queryOrder();
            addListeners();
            // getUserInfo();
        }
    }

    function getUserInfo() {
        Ajax.get(APIURL + '/user', {})
            .then(function(response) {
                $("#loadI").hide();
                if (response.success) {
                    var data = response.data;
                    console.log(data.openId)
                    var html = "";
                    if (data.openId == "") {
                        html+='<div class="wp100 ptb10 plr10 p_r t_323232 s_14 bg_fff" id="wxPay">'+
                             '<div class="wp100 clearfix" id="wxSbtn">'+
                             '<img class="fl w60p" src="../../images/wechat.png">'+
                             '<div class="pl10 fl">'+
                             '<div class="mtb4">微信账户</div>'+
                             '<div class="mtb4">微信支付</div>'+
                             '</div>'+
                             '<i class="r-tip"></i>'+
                             ' </div>'+
                             '</div>';
                         $("#content").html(html);
                    } 
                } 
            })
     }       

    function queryOrder() {
        var url = APIURL + '/operators/queryOrder',
            config = {
                "code": code
            };
        var quantity, salePrice;
        Ajax.get(url, config)
            .then(function(response) {
                if (response.success) {
                    var data = response.data,
                        invoiceModelLists = data.productOrderList;
                    if (data.status !== "1") {
                        location.href = "../user/order_list.html";
                    }
                    $("#cont").remove();
                    // $("#od-rtype").html(getReceiptType(data.receiptType));
                    // $("#od-rtitle").html(data.receiptTitle || "无");
                    //收货信息编号
                    if (invoiceModelLists.length) {
                        // invoiceModelLists.forEach(function(invoiceModelList) {
                        //     quantity = invoiceModelList.quantity;
                        //     salePrice = invoiceModelList.salePrice;
                        //     invoiceModelList.totalAmount = ((+salePrice) * (+quantity) / 1000).toFixed(2);
                        // });
                        $("#cont").remove();
                        // $("#items-cont").append(contentTmpl({ items: invoiceModelLists }));
                        // $("#po-total").html("￥" + (+data.totalAmount / 1000).toFixed(2));

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

    // function getReceiptType(data) {
    //     return data == "" ? "无" : receiptType[data];
    // }
    function onBridgeReady() {
        WeixinJSBridge.invoke(
            'getBrandWCPayRequest', {
                "appId": wxConfig.appId, //公众号名称，由商户传入
                "timeStamp": wxConfig.timeStamp, //时间戳，自1970年以来的秒数
                "nonceStr": wxConfig.nonceStr, //随机串
                "package": wxConfig.wechatPackage,
                "signType": wxConfig.signType, //微信签名方式：
                "paySign": wxConfig.paySign //微信签名
            },
            function(res) {
                // loading.hideLoading();
                // 使用以上方式判断前端返回,微信团队郑重提示：res.err_msg将在用户支付成功后返回    ok，但并不保证它绝对可靠。
                if (res.err_msg == "get_brand_wcpay_request:ok") {
                    base.showMsg("支付成功");
                    setTimeout(function(){
                        location.href = "./pay_success.html";
                    }, 1000);
                } else {
                    base.showMsg("支付失败");
                }
            }
        );
    }
    function wxPay(data){
        wxConfig = data;
        if (data && data.signType) {
            if (typeof WeixinJSBridge == "undefined") {
                if (document.addEventListener) {
                    document.removeEventListener("WeixinJSBridgeReady", onBridgeReady);
                    document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false);
                } else if (document.attachEvent) {
                    document.detachEvent('WeixinJSBridgeReady', onBridgeReady);
                    document.detachEvent('onWeixinJSBridgeReady', onBridgeReady);
                    document.attachEvent('WeixinJSBridgeReady', onBridgeReady);
                    document.attachEvent('onWeixinJSBridgeReady', onBridgeReady);
                }
            } else {
                onBridgeReady();
            }
        } else {
            loading.hideLoading();
            base.showMsg(data.msg || "微信支付失败");
        }
    }

    function pay(e,channel) {
        e.stopPropagation();
        $("#loaddingIcon").removeClass("hidden");
        Ajax.post(APIURL + '/operators/payOrder', {
            code: code,
            channel: channel
        }).then(function(response) {
            if (response.success) {
                // $("#wxPay").
                if (channel == "01") {
                    $("#loaddingIcon").addClass("hidden");
                    setTimeout(function(){
                        location.href = "./pay_success.html";
                    }, 1000);
                }else{
                    $("#loaddingIcon").addClass("hidden");
                    wxPay(response.data);
                }
            } else {
                $("#loaddingIcon").addClass("hidden");
                base.showMsg(response.msg);
            }
        }, function() {
            $("#loaddingIcon").addClass("hidden");
            base.showMsg("非常抱歉，订单支付失败");
        });
    }

    function addListeners() {
        $("#jfSbtn").on("click", function(e) {
           pay(e,"01");
       });
       $("#wxSbtn").on("click", function(e) {
           pay(e,"02")
        });
    }

});