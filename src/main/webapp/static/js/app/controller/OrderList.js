define([
    'app/controller/base',
    'app/util/ajax',
    'app/util/dict'
], function (base, Ajax, Dict) {
    $(function () {
        var config = {
                status: "",
                limit: 15,
                start: 1,
                orderDir: "desc",
                orderColumn: "apply_datetime",
                companyCode: sessionStorage.getItem("compCode")
            },
            orderStatus = Dict.get("orderStatus"),
            first, isEnd, index = base.getUrlParam("i") || 0,
            canScrolling;

        init();

        function init() {
            if (!base.isLogin()) {
                location.href = "../user/login.html?return=" + base.makeReturnUrl();
            } else {
                addListeners();
                $("#status_ul>li:eq(" + index + ")").click();
            }
        }

        function addListeners() {
            $("#status_ul").on("click", "li", function (e) {
                config.start = 1;
                $("#status_ul").find("li.active").removeClass("active");
                var status = $(this).addClass("active").attr("status");
                status = status == "0" ? "" : status;
                config.status = status;
                first = true;
                isEnd = false;
                canScrolling = true;
                $("#ol-ul").empty();
                $("#noItem").addClass("hidden");
                addLoading();
                getOrderList();
                e.stopPropagation();
            });
            $(window).on("scroll", function () {
                if (canScrolling && !isEnd && ($(document).height() - $(window).height() - 10 <= $(document).scrollTop())) {
                    canScrolling = false;
                    addLoading();
                    getOrderList();
                }
            });
            $("#ol-ul").on("click", "li span.ol-tobuy", function (e) {
                e.stopPropagation();
                e.preventDefault();
                var me = $(this);
                location.href = "../operator/pay_order.html?code=" + me.closest("li[code]").attr("code");
            });
        }

        function getOrderList() {
            Ajax.get("808070", config)
                .then(function (response) {
                    if (response.success) {
                        var data = response.data,
                            html = "",
                            totalCount = data.totalCount,
                            curList = data.list;
                        if (totalCount < config.limit || curList.length < config.limit) {
                            isEnd = true;
                        }
                        if (curList.length) {
                            curList.forEach(function (cl) {
                                var invoices = cl.productOrderList,
                                    code = cl.code;
                                html += '<li class="clearfix b_bd_b b_bd_t bg_fff mt10" code="' + code + '">' +
                                    '<a class="show" href="./order_detail.html?code=' + code + '" class="show">' +
                                    '<div class="wp100 s_14 b_bd_b clearfix  ptb10 plr10">' +
                                    '<div class="fl">订单号：<span>' + code + '</span></div>' +
                                    '</div>';
                                if (invoices.length == 1) {
                                    invoice = invoices[0];
                                    html += '<div class="wp100 s_14 clearfix plr10 ptb4 p_r">' +
                                        '<div class="fl wp90p"><img class="order-item-img" src="' + invoice.advPic + '"></div>' +
                                        '<div class="wp100 pl102">' +
                                        '<p class="tl">' + invoice.productName + '</p>' +
                                        '<p class="tl item_totalP">￥' + (+invoice.salePrice / 1000).toFixed(2) + '</p>' +
                                        '<p class="t_80">×<span>' + invoice.quantity + '</span></p>' +
                                        '</div>';
                                } else {
                                    html += '<div class="wp100 clearfix plr10 ptb4 p_r">';
                                    var arr = invoices.splice(0, 3);
                                    for (var k = 0; k < arr.length; k++) {
                                        var invoice = arr[k];
                                        if (k == 0) {
                                            html += '<div class="fl wp33 tl"><img class="order-item-img" src="' + invoice.advPic + '"></div>';
                                        } else if (k == 1) {
                                            html += '<div class="fl wp33 tc"><img class="order-item-img" src="' + invoice.advPic + '"></div>';
                                        } else if (k == 2) {
                                            html += '<div class="fl wp33 tr"><img class="order-item-img" src="' + invoice.advPic + '"></div>';
                                        }
                                    }
                                }
                                html += '</div>' +
                                    '<div class="wp100 clearfix plr10 ptb6">' +
                                    '<span class="fr inline_block bg_f64444 t_white s_14 plr8 ptb4 b_radius4 ' + (cl.status == "1" ? "ol-tobuy" : "") + '">' + getStatus(cl.status) + '</span>' +
                                    '</div>' +
                                    '</a></li>';
                            });
                            removeLoading();
                            $("#ol-ul").append(html);
                            config.start += 1;
                            canScrolling = true;
                        } else {
                            if (first) {
                                doError();
                            } else {
                                removeLoading();
                            }
                        }
                    } else {
                        if (first) {
                            doError();
                        } else {
                            removeLoading();
                        }
                    }
                    first = false;
                }, function () {
                    if (first) {
                        doError();
                    } else {
                        removeLoading();
                    }
                    first = false;
                });
        }

        function addLoading() {
            $("#ol-ul").append('<li class="scroll-loadding"></li>');
        }

        function removeLoading() {
            $("#ol-ul").find(".scroll-loadding").remove();
        }

        function doError() {
            $("#ol-ul").empty();
            $("#noItem").removeClass("hidden");
            canScrolling = false;
        }

        function getStatus(status) {
            return orderStatus[status] || "未知状态";
        }
    });
});