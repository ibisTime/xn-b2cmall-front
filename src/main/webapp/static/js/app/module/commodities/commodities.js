define([
    'jquery'
], function ($) {
    var winWidth = $(window).width(),
        width = (winWidth - 32) / 100 * 48 + "px",
        width4 = (winWidth - 32) / 100 * 4;
    return {
        createCommodities: function (data) {
            var html = "";
            if($.isArray(data)){
                for (var i = 0; i < data.length; i++) {
                    if (i < 2) {
                        html += '<div style="width:' + width + '" class="bg_fff display">';
                    } else {
                        html += '<div style="width:' + width + ';margin-top:' + width4 + 'px" class="bg_fff display">';
                    }
                    data[i].advPic = data[i].advPic.split(/\|\|/)[0];
                    html += '<a class="wp100" href="../operator/buy.html?code=' + data[i].code + '">' +
                        '<img class="va-b" style="width:' + width + ';height:' + width + '" src="' + data[i].advPic + '">' +
                        '<div class="pl6 pt4 t_3dot">' + data[i].name + '</div>' +
                        '<div class="price pl6 s_15">￥' + (+data[i].price2 / 1000).toFixed(2) +
                        '<del class="ml5 s_13 t_999"><span class="price-icon">¥</span><span class="font-num">' + (+data[i].price1 / 1000).toFixed(2) + '</span></del></div>' +
                        '</a></div>';
                }
            }
            return html;
        }
    }
});