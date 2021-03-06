define([
    'app/controller/base',
    'app/util/ajax',
    'IScroll'
], function(base, Ajax, IScroll) {
    var first = true,
        COMPANYCODE = "",
        bigCode = base.getUrlParam("b") || "",
        smallCode = "",
        start = 1,
        limit = 10,
        seqArr = [],
        D2XArr = [],
        canScrolling = false,
        winWidth = $(window).width(),
        width4 = (winWidth - 32) / 100 * 4,
        width = (winWidth - 32) / 100 * 48 + "px",
        myScroll, smallScroll;
    init();

    function init() {
        if (COMPANYCODE = sessionStorage.getItem("compCode")) {
            addListeners();
            getCategory();
        } else {
            base.getCompanyByUrl()
                .then(function(res) {
                    if (COMPANYCODE = sessionStorage.getItem("compCode")) {
                        addListeners();
                        getCategory();
                    } else {
                        doError();
                        base.showMsg(res.msg);
                    }
                }, function() {
                    doError();
                    base.showMsg("非常抱歉，暂时无法获取公司信息!");
                });
        }
    }

    function getCategory() {
        Ajax.get(APIURL + "/commodity/category/list", {
            "companyCode": COMPANYCODE,
            "type": "1"
        }).then(function(res) {
            if (res.success && res.data.length) {
                var data = res.data;
                data.sort(function(a, b) {
                    return +a.orderNo - +b.orderNo;
                });
                for (var i = 0; i < data.length; i++) {
                    var d = data[i];
                    if (d.parentCode == "0") {
                        if (!D2XArr[d.code]) {
                            D2XArr[d.code] = [];
                        }
                        seqArr.push(d);
                    } else {
                        if (!D2XArr[d.parentCode] || !D2XArr[d.parentCode].length) {
                            D2XArr[d.parentCode] = [];
                        }
                        D2XArr[d.parentCode].push(d);
                    }
                }
                var html = "",
                    html1 = "";
                for (var j = 0; j < seqArr.length; j++) {
                    html += '<li code="' + seqArr[j].code + '">' + seqArr[j].name + '</li>';
                    html1 += '<li code="' + seqArr[j].code + '" class="wp33 tl fl">' + seqArr[j].name + '</li>';
                }
                var nowSmallArr = [];
                if (bigCode == "") {
                    bigCode = seqArr[0].code;
                }
                var scroller = $("#scroller");
                scroller.find("ul").html(html);
                addCategory();
                //click
                scroller.find("ul>li[code='" + bigCode + "']").click();
            } else {
                doError();
                $("header").hide();
            }
        }, function() {
            doError();
            $("header").hide();
        })
    }

    function addSmallCont(code) {
        var scroller = $("#scroller"),
            nowSmallArr = D2XArr[bigCode],
            smallCont = $("#smallCont"),
            sHtml = "";
        for (var j = 0; j < nowSmallArr.length; j++) {
            if (!j) {
                sHtml += '<li class="item1 checked" code="' + nowSmallArr[j].code + '">' + nowSmallArr[j].name + '</li>'
            } else {
                sHtml += '<li class="item1" code="' + nowSmallArr[j].code + '">' + nowSmallArr[j].name + '</li>'
            }
        }
        smallCont.html(sHtml);
        smallCode = nowSmallArr[0] && nowSmallArr[0].code;
        if (!sHtml) {
            $('#mtop').addClass("hp42p").removeClass("hp84p");
        } else {
            $('#mtop').removeClass("hp42p").addClass("hp84p");
            var lis = smallCont.find("li");
            for (var i = 0, width = 0; i < lis.length; i++) {
                width += lis.eq(i).width() + 38;
            }
            $("#smlSDiv").css("width", width);
            smallScroll = new IScroll("#smlWrapper", { scrollX: true, scrollY: false, eventPassthrough: true });
        }
    }

    function addCategory() {
        var scroller = $("#scroller");
        var lis = scroller.find("ul li");
        for (var i = 0, width = 0; i < lis.length; i++) {
            width += lis.eq(i).width() + 29;
        }
        $("#scroller").css("width", width);
        myScroll = new IScroll('#mallWrapper', { scrollX: true, scrollY: false, eventPassthrough: true, snap: true });
    }

    function addListeners(params) {
        /**大类start */
        $("#scroller").on("click", "li", function() {
            var me = $(this);
            $("#mallWrapper").find(".current").removeClass("current");
            me.addClass("current");
            myScroll.scrollToElement(this);
            bigCode = me.attr("code");
            smallCode = "";
            addSmallCont(bigCode);
            first = true;
            start = 1;
            getProduces();
        });
        /**大类end */
        /**小类start */
        $("#smallCont").on("click", "li", function(e) {
            e.stopPropagation();
            var me = $(this);
            $("#smallCont").find(".checked").removeClass("checked");
            me.addClass("checked");
            smallCode = me.attr("code");
            smallScroll.scrollToElement(this);
            first = true;
            start = 1;
            getProduces();
        });
        /**小类end */
        $(window).on("scroll", function() {
            var me = $(this);
            if (canScrolling && ($(document).height() - $(window).height() - 10 <= $(document).scrollTop())) {
                canScrolling = false;
                getProduces();
            }
        });
    }

    var xhr = null;

    function getProduces() {
        xhr && xhr.abort();
        if (!first) {
            $("#cont").append('<i id="loadI" class="icon-loading2"></i>');
        } else {
            $("#cont").html('<i id="loadI" class="icon-loading3"></i>');
        }
        xhr = $.ajax({
            async: true,
            type: 'get',
            url: APIURL + '/commodity/product/page',
            data: {
                "category": bigCode,
                "type": smallCode,
                "companyCode": COMPANYCODE,
                "start": start,
                "limit": limit,
                "orderColumn": "order_no",
                "orderDir": "asc"
            }
        });
        xhr.then(function(res) {
            $("#loadI").remove();
            if (res.success && res.data.list.length) {
                var data = res.data.list,
                    html = "";
                for (var i = 0; i < data.length; i++) {
                    if (i < 2) {
                        html += '<div style="width:' + width + '" class="bg_fff display">';
                    } else {
                        html += '<div style="width:' + width + ';margin-top:' + width4 + 'px" class="bg_fff display">';
                    }
                    html += '<a class="wp100" href="../operator/buy.html?code=' + data[i].code + '">' +
                        '<img class="va-b" style="width:' + width + ';height:' + width + '" src="' + data[i].advPic + '">' +
                        '<div class="pl6 pt4 t_3dot">' + data[i].name + '</div>' +
                        '<div class="price pl6 s_15">￥' + (+data[i].discountPrice / 1000).toFixed(2) +
                        '<del class="ml5 s_13 t_999"><span class="price-icon">¥</span><span class="font-num">' + (+data[i].originalPrice / 1000).toFixed(2) + '</span></del></div>' +
                        '</a></div>';
                }
                $("#cont").append(html);
                start++;
                canScrolling = true;
                first = false;
            } else {
                if (first) {
                    doError();
                }
                canScrolling = false;
            }
        }, function() {
            if (xhr.statusText != "abort") {
                if (first) {
                    doError();
                }
                base.showMsg("非常抱歉，暂时无法获取商品数据");
            }
        });
    }


    function doError() {
        $("#cont").html('<div class="tc bg_fff" style="line-height: 150px;">暂无相关商品</div>');
    }

});