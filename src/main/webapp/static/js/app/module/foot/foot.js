define([
    'jquery'
], function ($) {
    var tmpl = __inline("foot.html");
    var activeImgs = [
        __inline('../../../../images/hf1_2.png'),
        __inline('../../../../images/hf2_2.png'),
        __inline('../../../../images/hf3_2.png'),
        __inline('../../../../images/hf4_2.png')
    ];

    return {
        addFoot: function (idx) {
            var temp = $(tmpl);
            idx == undefined ? temp.appendTo($("body")) :
                temp.find("a:eq(" + idx + ")")
                    .addClass("active")
                    .find("img").attr("src", activeImgs[idx])
                    .end().end()
                    .appendTo($("body"));
        }
    }
});