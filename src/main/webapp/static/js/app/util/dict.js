define([], function() {
    var dict = {
        receiptType: {
            "1": "个人",
            "2": "公司"
        },
        fastMail: {
            "EMS": "邮政EMS",
            "STO": "申通快递",
            "ZTO": "中通快递",
            "YTO": "圆通快递",
            "HTKY": "汇通快递",
            "ZJS": "宅急送",
            "SF": "顺丰快递",
            "TTKD": "天天快递"
        },
        fundType: {
            "5": " 收入",
            "-5": "支出"
        },
        orderStatus: {
            "1": "待支付",
            "2": "待发货",
            "3": "待收货",
            "4": "已收货",
            "91": "用户取消",
            "92": "商户取消",
            "93": "快递异常"
        },
        currencyUnit: {
            '': '',
            'USB': '$',
            'CNY': '￥',
            'XB': 'S$',
            'SGD': 'S$'
        }
    };

    return {
        get: function(code) {
            return dict[code];
        }
    }
});