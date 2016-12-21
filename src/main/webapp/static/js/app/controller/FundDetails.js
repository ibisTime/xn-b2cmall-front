define([
    'app/controller/base',
    'app/util/ajax',
    'app/util/dict'
], function(base, Ajax, Dict) {
    $(function() {
        var config = {
                "start": 1,
                "limit": 15
            },
            first = true,
            fundType = Dict.get("fundType"),
            isEnd = false,
            canScrolling = true;

        initView();

        function initView() {
            if (!base.isLogin()) {
                location.href = "../user/login.html?return=" + base.makeReturnUrl();
            } else {
                queryFundDetails();
                addListeners();
            }
        }

        function doError() {
            if (first) {
                $("#fd-ul").html('<li class="bg_fff" style="text-align: center;line-height: 93px;">暂无积分流水</li>');
            } else {
                removeLoading();
            }
        }

        function queryFundDetails() {
            if (!first) {
                addLoading();
            }
            Ajax.get("805310", config)
                .then(function(response) {
                    if (response.success) {
                        var data = response.data,
                            list = data.list,
                            totalCount = +data.totalCount;
                        if (totalCount < config.limit || list.length < config.limit) {
                            isEnd = true;
                        }
                        if (list.length) {
                            var html = "";
                            list.forEach(function(ll) {
                                var flag = +ll.transAmount >= 0 ,
                                    t_class = flag && "t_f64444" || "t_21b504",
                                    prev_f = flag && "+" || "";

                                html += '<li class="plr20 ptb20 b_bd_b clearfix lh15rem">' +
                                    '<div class="wp40 fl s_10">' +
                                    '<p class="t_4d">' + (fundType[ll.bizType] || "未知类型") + '</p>' +
                                    '<p class="s_09 t_999 pt10">' + getMyDate(ll.createDatetime) + '</p>' +
                                    '</div>' +
                                    '<div class="wp60 fl tr ' + t_class + ' s_10">' +
                                    '<span class="inline_block">' + prev_f + (+ll.transAmount / 1000).toFixed(2) + '积分</span>' +
                                    '<div class="pt10 t_4d">' + ll.remark + '</div></div></li>';
                            });
                            if (first) {
                                $("#fd-ul").html(html);
                            } else {
                                removeLoading();
                                $("#fd-ul").append(html);
                            }
                            config.start += 1;
                        } else {
                            doError();
                        }
                    } else {
                        doError();
                    }
                    first = false;
                    canScrolling = true;
                }, function() {
                    doError();
                    first = false;
                    canScrolling = true;
                });
        }

        function addLoading() {
            $("#fd-ul").append('<li class="scroll-loadding"></li>');
        }

        function removeLoading() {
            $("#fd-ul").find(".scroll-loadding").remove();
        }

        function getMyDate(value) {
            var date = new Date(value);
            return get2(date.getFullYear()) + "-" + get2(date.getMonth() + 1) + "-" + get2(date.getDate()) + " " +
                get2(date.getHours()) + ":" + get2(date.getMinutes()) + ":" + get2(date.getSeconds());
        }

        function get2(val) {
            if (val < 10) {
                return "0" + val;
            } else {
                return val;
            }
        }

        function addListeners() {
            $(window).on("scroll", function() {
                if (canScrolling && !isEnd && ($(document).height() - $(window).height() - 10 <= $(document).scrollTop())) {
                    canScrolling = false;
                    queryFundDetails();
                }
            });
        }
    });
});