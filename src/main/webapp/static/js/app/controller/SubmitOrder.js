define([
    'app/controller/base',
    'app/util/ajax',
    'Handlebars'
], function(base, Ajax, Handlebars) {
    var code = base.getUrlParam("code") || "",
        type = base.getUrlParam("type") || "1",
        q = base.getUrlParam("q") || "1",
        contentTmpl = __inline("../ui/submit-order-imgs.handlebars");
    init();

    function init() {
        if (!base.isLogin()) {
            location.href = "../user/login.html?return=" + base.makeReturnUrl();
        } else {
            getAddress();
            //单件商品购买
            if (type == 1) {
                getModel();
                //购物车提交订单
            } else if (type == 2) {
                code = code.split(/_/);
                getModel1();
            }
            addListeners();
        }
    }

    function getAddress() {
        var code = "805165",
            config = {
                "isDefault": ""
            },
            addressTmpl = __inline("../ui/submit-order-address.handlebars");
        Ajax.get(code, config)
            .then(function(response) {
                $("#cont").hide();
                if (response.success) {
                    var data = response.data,
                        len = data.length;
                    if (len) {
                        for (var i = 0; i < len; i++) {
                            if (data[i].isDefault == "1") {
                                break;
                            }
                        }
                        i = i == len ? 0 : i;
                        var content = addressTmpl(data[i]);
                        $("#addressDiv").append(content);
                        $("#addressRight").removeClass("hidden");
                    } else {
                        $("#noAddressDiv").removeClass("hidden");
                    }
                } else {
                    $("#noAddressDiv").removeClass("hidden");
                }
            }, function() {
                $("#cont").hide();
                base.showMsg("地址信息获取失败");
                $("#noAddressDiv").removeClass("hidden");
            });
    }

    function doError(cc) {
        $(cc).html('<div class="bg_fff" style="text-align: center;line-height: 150px;">暂时无法获取数据</div>');
    }

    function getModel1() {
        var postCode = "808041";
        Ajax.get(postCode)
            .then(function(response) {
                if (response.success) {
                    var data = response.data,
                        totalCount = 0;
                    if (data.length) {
                        var items = [];
                        for (var i = 0, len = code.length; i < len; i++) {
                            var d = data[code[i]];
                            var eachCount = (+d.salePrice) * (+d.quantity);
                            d.product = {};
                            d.product.name = d.productName;
                            d.product.advPic = d.advPic;
                            d.product.productCode = d.productCode;
                            d.product.discountPrice = (+d.salePrice / 1000).toFixed(2);
                            totalCount += eachCount;
                            items.push(d);
                        }
                        var html = contentTmpl({ items: items });
                        $("#cont").hide();
                        $("#items-cont").append(html);
                        $("#totalAmount").html((totalCount / 1000).toFixed(2));
                    } else {
                        $("#cont").hide();
                        doError("#items-cont");
                    }
                } else {
                    $("#cont").hide();
                    doError("#items-cont");
                }
            }, function() {
                $("#cont").hide();
                doError("#items-cont");
            });
    }

    function getModel() {
        var postCode = "808022",
            config = {
                "code": code
            };
        Ajax.get(postCode, config)
            .then(function(response) {
                if (response.success) {
                    var data = response.data,
                        items = [];
                    var eachCount = +data.discountPrice * +q;
                    data.product = {};
                    data.product.discountPrice = (+data.discountPrice / 1000).toFixed(2);
                    data.quantity = q;
                    data.product.name = data.name;
                    data.product.advPic = data.advPic;
                    data.product.productCode = data.code;
                    items.push(data);
                    var html = contentTmpl({ items: items });
                    $("#items-cont").append(html);
                    $("#totalAmount").html((eachCount / 1000).toFixed(2));
                    $("#cont").hide();
                } else {
                    doError("#items-cont");
                }
            }, function() {
                doError("#items-cont");
            });
    }

    function addListeners() {
        $("#addressDiv").on("click", "a", function() {
            location.href = "./address_list.html?c=" + $(this).attr("code") + "&return=" + base.makeReturnUrl();
        });
        $("#noAddressDiv").on("click", function(e) {
            location.href = "./add_address.html?return=" + base.makeReturnUrl();
        });
        $("#sbtn").on("click", function() {
            var $a = $("#addressDiv>a");
            if ($a.length) {
                var applyVal = $("#apply_note").val();
                if(applyVal){
                    if (applyVal.length > 255) {
                        base.showMsg("买家嘱咐字数必须少于255位");
                        return;
                    }else if(!base.isNotFace(applyVal)){
                        base.showMsg("买家嘱咐不能包含特殊字符");
                        return;
                    }
                }
                var postCode = "808050",
                    config;
                if (type == 1) {
                    config = {
                        "productCode": code,
                        "quantity": q,
                        "receiver": $a.find(".a-addressee").text(),
                        "reMobile": $a.find(".a-mobile").text(),
                        "reAddress": $a.find(".a-province").text() + $a.find(".a-city").text() + $a.find(".a-district").text() + $a.find(".a-detailAddress").text(),
                        "applyNote": $("#apply_note").val() || ""
                    };
                } else if (type == 2) {
                    var cartList = [],
                        $lis = $("#items-cont > ul > li");
                    for (var i = 0, len = $lis.length; i < len; i++) {
                        cartList.push($($lis[i]).attr("modelCode"));
                    }
                    config = {
                        "receiver": $a.find(".a-addressee").text(),
                        "reMobile": $a.find(".a-mobile").text(),
                        "reAddress": $a.find(".a-province").text() + $a.find(".a-city").text() + $a.find(".a-district").text() + $a.find(".a-detailAddress").text(),
                        "applyNote": $("#apply_note").val() || "",
                        "cartCodeList": cartList
                    };
                    postCode = "808051";
                } else {
                    base.showMsg("类型错误，无法提交订单");
                    return;
                }
                doSubmitOrder(config, postCode);
            } else {
                base.showMsg("未选择地址");
            }
        });
    }

    function doSubmitOrder(config, postCode) {
        Ajax.post(postCode, { json: config })
            .then(function(response) {
                if (response.success) {
                    var code = response.data || response.data.code;
                    location.href = './pay_order.html?code=' + code;
                } else {
                    base.showMsg(response.msg);
                }
            }, function() {
                base.showMsg("非常抱歉，订单提交失败");
            });
    }
});