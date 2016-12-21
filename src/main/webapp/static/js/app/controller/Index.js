define([
    'app/controller/base',
    'app/util/ajax',
    'swiper',
    'app/module/foot/foot'
], function(base, Ajax, Swiper, Foot) {
    var COMPANYCODE = "",
        winWidth = $(window).width(),
        width = (winWidth - 32) / 100 * 48 + "px",
        width4 = (winWidth - 32) / 100 * 4,
        cateWidth = (winWidth - 32) / 100 * 25 - 32;
    init();

    function init() {
        Foot.addFoot(0);
        if (COMPANYCODE = sessionStorage.getItem("compCode")) {
            getCategory();
            getBanner();
        } else {
            base.getCompanyByUrl()
                .then(function(res) {
                    if (COMPANYCODE = sessionStorage.getItem("compCode")) {
                        getCategory();
                        getBanner();
                    } else {
                        doError("#cont1", "暂无相关商品");
                        $("#category").hide();
                        $("#gbSwiperContainer").hide();
                        base.showMsg(res.msg);
                    }
                }, function() {
                    doError("#cont1", "暂无相关商品");
                    $("#category").hide();
                    $("#gbSwiperContainer").hide();
                    base.showMsg("非常抱歉，暂时无法获取公司信息!");
                });
        }
    }

    function getCategory() {
        Ajax.get("808006", {
            "companyCode": COMPANYCODE,
            "parentCode": "0"
        }).then(function(res) {
            if (res.success && res.data.length) {
                var data = res.data,
                    codes = [],
                    html = "";
                data.sort(function(a, b) {
                    return +a.orderNo - +b.orderNo;
                });
                for (var i = 0; i < data.length; i++) {
                    if (data[i].type == "2") {
                        codes.push(data[i]);
                        data.splice(i--, 1);
                        continue;
                    }
                    if (!(i % 4)) {
                        if (i !== 0) {
                            html += '</div>'
                        }
                        html += '<div class="pt6 clearfix">';
                    }
                    html += '<a href="../detail/mall_list.html?b=' + data[i].code + '" class="wp25 fl p_r tc category-item" code="' + data[i].code + '">' +
                        '<div style="width:' + cateWidth + 'px;height:' + cateWidth + 'px;border-radius:100%;overflow:hidden;margin:0 auto;">' +
                        '<img src="' + data[i].pic + '" style="width:' + cateWidth + 'px;height:' + cateWidth + 'px;"></div>' +
                        '<div class="index-category-name">' + data[i].name + '</div>' +
                        '</a>';
                }
                if (codes.length) {
                    getRqAndXp(codes[0], "#rqtj", "#cont1");
                    codes[1] && getRqAndXp(codes[1], "#xpss", "#cont2");
                } else {
                    doError("#cont1", "暂无相关商品");
                }
                html += '</div>';
                $("#category").html(html);
            } else {
                $("#category").hide();
                doError("#cont1", "暂无相关商品");
            }
        }, function() {
            $("#category").hide();
        });
    }

    function getRqAndXp(item, id1, id2) {
        $(id1).html('<img src="' + item.pic + '" class="va hot mr4">' +
            '<div class=" display s_15 va">' + item.name + '</div>');
        $(id2).find(".icon-loading2").removeClass("hidden");
        var config = {
            "companyCode": COMPANYCODE,
            "location": item.code,
            "start": 1,
            "limit": 10,
            "orderColumn": "order_no",
            "orderDir": "asc",
            "status": "1"
        };
        Ajax.get("808020", config)
            .then(function(res) {
                if (res.success && res.data.list.length) {
                    var list = res.data.list,
                        html = '';
                    for (var i = 0; i < list.length; i++) {
                        if (i < 2) {
                            html += '<div style="width:' + width + '" class="bg_fff display">';
                        } else {
                            html += '<div style="width:' + width + ';margin-top:' + width4 + 'px" class="bg_fff display">';
                        }
                        html += '<a class="wp100" href="../operator/buy.html?code=' + list[i].code + '">' +
                            '<img style="width:' + width + ';height:' + width + '" src="' + list[i].advPic + '">' +
                            '<div class="pl6 pt4 t_3dot">' + list[i].name + '</div>' +
                            '<div class="price pl6 s_15">￥' + (+list[i].discountPrice / 1000).toFixed(2) +
                            '<del class="ml5 s_13 t_999"><span class="price-icon">¥</span><span class="font-num">' + (+list[i].originalPrice / 1000).toFixed(2) + '</span></del></div>' +
                            '</a></div>';
                    }
                    $(id2).html(html);
                } else {
                    doError(id2, "暂无相关商品");
                }
            }, function() {
                doError(id2, "暂无相关商品");
            });
    }

    function getGongGao() {
        Ajax.get("805130", { start: 1, limit: 5, toCompany: COMPANYCODE, "status": "1" })
            .then(function(res) {
                if (res.success && res.data.list.length) {
                    for (var i = 0, list = res.data.list, html = ""; i < list.length; i++) {
                        html += '<div class="swiper-slide"><a class="show" href="./detail.html?c=' + list[i].code + '">' +
                            '<img src="/static/images/a.png" class="va news">' +
                            '<div class="t_norwrap va">【公告】' + list[i].title + '</div></a></div>';
                    }
                    $("#gbSwrapper").html(html);
                    new Swiper('#gbSwiperContainer', {
                        direction: 'vertical',
                        autoplay: 4000,
                        loop: true,
                        autoplayDisableOnInteraction: false
                    });
                } else {
                    $("#gbSwiperContainer").hide();
                }
            }, function() {
                $("#gbSwiperContainer").hide();
            });
    }

    function getBanner() {
        base.getBanner(COMPANYCODE, "B_Mobile_SY_CSH")
            .then(function(res) {
                getGongGao();
                if (res.success) {
                    var data = res.data,
                        html = "";
                    for (var i = 0; i < data.length; i++) {
                        html += '<div class="swiper-slide"><img class="wp100" src="' + data[i].pic + '"></div>';
                    }
                    if (data.length == 1) {
                        $("#swiper-pagination").remove();
                    }
                    $("#swr").html(html);
                    swiperImg();
                }
            }, function() {
                getGongGao();
            });
    }

    function swiperImg() {
        new Swiper('#bannerContainer', {
            direction: 'horizontal',
            autoplay: 5000,
            pagination: '.swiper-pagination',
            autoplayDisableOnInteraction: false
        });
    }

    function doError(id, msg) {
        $(id).html('<div class="bg_fff" style="text-align: center;line-height: 150px;">' + msg + '</div>');
    }
});