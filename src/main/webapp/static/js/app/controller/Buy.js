define([
    'app/controller/base',
    'app/util/ajax',
    'swiper'
], function(base, Ajax, Swiper) {
    var quantity = 0,
        code = base.getUrlParam("code") || "";
    init();

    function init() {
        getProduct();
    }

    function getProduct() {
        Ajax.get('808022', { code: code })
            .then(function(res) {
                getKeys();
                if (res.success) {
                    var data = res.data,
                        $swiper = $("#btlImgs"),
                        imgs_html = '<div class="swiper-slide tc"><img src="' + data.pic1 + '"></div>' +
                            '<div class="swiper-slide tc"><img src="' + data.pic2 + '"></div>' +
                            '<div class="swiper-slide tc"><img src="' + data.pic3 + '"></div>' +
                            '<div class="swiper-slide tc"><img src="' + data.pic4 + '"></div>';
                    $swiper.html(imgs_html);
                    swiperImg();
                    $("#btr-name").text(data.name);
                    $("#btr-advTitle").text(data.advTitle);
                    $("#description").html(data.description);
                    $("#unit-price").val(data.discountPrice);
                    $("#btr-price").text("￥" + (+data.discountPrice / 1000).toFixed(2));
                    quantity = +data.quantity;
                    $("#quantity").text(data.quantity);
                    $("#buyBtn").click(function() {
                        if (!$(this).hasClass("no-buy-btn")) {
                            var count = +$("#buyCount").val();
                            if (count > quantity) {
                                base.showMsg("库存不足，无法购买");
                                return;
                            }
                            location.href = "./submit_order.html?code=" + code + "&q=" + $("#buyCount").val();
                        }
                    });
                    $("#addCartBtn").click(function() {
                        if (!$(this).hasClass("no-buy-btn")) {
                            add2Cart();
                        }
                    });
                    addListeners();
                    $("#cont").remove();
                } else {
                    base.showMsg("暂时无法获取商品信息");
                }
            }, function() {
                getKeys();
                base.showMsg("暂时无法获取商品信息");
            });
    }

    function getKeys() {
        var compCode = sessionStorage.getItem("compCode");
        if (compCode) {
            getKcYf(compCode);
        } else {
            base.getCompanyByUrl()
                .then(function() {
                    if (compCode = sessionStorage.getItem("compCode")) {
                        getKcYf(compCode);
                    } else {
                        base.showMsg("库存和运费信息获取失败！");
                    }
                });
        }
    }

    function getKcYf(compCode) {
        Ajax.get("808917", { key: "yunfei", companyCode: compCode })
            .then(function(res) {
                if (res.success) {
                    $("#yunfei").text(res.data);
                } else {
                    base.showMsg("运费信息获取失败！");
                }
            }, function() {
                base.showMsg("运费信息获取失败！");
            });
        Ajax.get("808917", { key: "byje", companyCode: compCode })
            .then(function(res) {
                if (res.success) {
                    $("#byje").text(res.data);
                } else {
                    base.showMsg("包邮金额获取失败！");
                }
            }, function() {
                base.showMsg("包邮金额获取失败！");
            });
    }

    function swiperImg() {
        new Swiper('.swiper-container', {
            direction: 'horizontal',
            pagination: '.swiper-pagination'
        });
    }

    function addListeners() {
        $("#subCount").on("click", function() {
            var orig = $("#buyCount").val();
            if (orig == undefined || orig.trim() == "" || orig == "0" || orig == "1") {
                orig = 2;
            }
            orig = +orig - 1;
            $("#buyCount").val(orig);
            $("#buyCount").change();
        });
        $("#addCount").on("click", function() {
            var orig = $("#buyCount").val();
            if (orig == undefined || orig.trim() == "") {
                orig = 0;
            }
            orig = +orig + 1;
            $("#buyCount").val(orig);
            $("#buyCount").change();
        });
        $("#buyCount").on("keyup", function(e) {
            var keyCode = e.charCode || e.keyCode;
            if (!isSpecialCode(keyCode) && !isNumber(keyCode)) {
                this.value = this.value.replace(/[^\d]/g, "");
            }
        }).on("change", function(e) {
            var keyCode = e.charCode || e.keyCode;
            if (!isSpecialCode(keyCode) && !isNumber(keyCode)) {
                this.value = this.value.replace(/[^\d]/g, "");
            }
            if (!$(this).val()) {
                this.value = "1";
            }
            if ($(this).val() == "0") {
                this.value = "1";
            }
            var unitPrice = +$("#unit-price").val();
            $("#btr-price").text("￥" + (unitPrice * +$(this).val() / 1000).toFixed(2));
        });
    }

    function isNumber(code) {
        if (code >= 48 && code <= 57 || code >= 96 && code <= 105) {
            return true;
        }
        return false;
    }

    function isSpecialCode(code) {
        if (code == 37 || code == 39 || code == 8 || code == 46) {
            return true;
        }
        return false;
    }

    function add2Cart() {
        if (base.isLogin()) {
            a2cart();
        } else {
            location.href = "../user/login.html?return=" + base.makeReturnUrl();
        }
    }

    function a2cart() {
        var config = {
                productCode: code,
                quantity: $("#buyCount").val()
            },
            postCode = "808030";
        Ajax.post(postCode, { json: config })
            .then(function(response) {
                var msg;
                if (response.success) {
                    msg = "添加购物车成功!";
                } else {
                    msg = "添加购物车失败!";
                }
                base.showMsg(msg);
            }, function() {
                base.showMsg("添加购物车失败!");
            });
    }
});