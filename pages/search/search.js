// pages/search/search.js
var WxSearch = require('../../wxSearchView/wxSearchView.js');
var recoverableItems = ["废纸张","纸板箱","报纸","废弃书本","快递纸袋","打印纸","信封","广告单","利乐包","废塑料","饮料瓶","奶瓶","洗发水瓶","乳液罐","食用油桶","塑料碗","塑料盆","塑料盒","食品保鲜盒","收纳盒","塑料玩具","塑料积木","塑料模型","塑料衣架","施工安全帽","PE塑料","pvc","亚克力板"," 塑料卡片","密胺餐具","kt板","泡沫塑料","水果网套","废玻璃制品","调料瓶","酒瓶","化妆品瓶","玻璃杯","窗玻璃","玻璃制品","放大镜","玻璃摆件","碎玻璃","废金属","金属瓶罐","易拉罐","食品罐","食品桶","金属厨具","菜刀","锅","金属工具","刀片","指甲剪","螺丝刀","金属制品","铁钉","铁皮","铝箔","废织物","旧衣服","床单","枕头","棉被","皮鞋","毛绒玩具","布偶","棉袄","包","皮带","丝绸制品","电路板","主板","内存条","充电宝","电线","插头","木制品","积木","砧板"];
var hazardousItems = ["充电电池","镉镍电池","铅酸电池","蓄电池","纽扣电池","荧光（日光）灯管","卤素灯","过期药物","药物胶囊","药片","药品内包装","废油漆桶","染发剂壳","过期的指甲油","洗甲水","废矿物油及其包装物","废含汞温度计","废含汞血压计","水银血压计","水银体温计","水银温度计","废杀虫剂及其包装","老鼠药","毒鼠强","杀虫喷雾罐","废胶片及废相纸","x光片等感光胶片","相片底片"];
var householdItems = ["食材废料","谷物及其加工食品","米","米饭","面","面包","豆类","肉蛋及其加工食品","鸡","鸭","猪","牛","羊肉","蛋","动 物内脏","腊肉","午餐肉","蛋壳","水产及其加工食品","鱼","鱼鳞","虾","虾壳","鱿鱼","蔬菜","绿叶菜","根茎蔬菜","菌 菇","调料","酱料","剩菜剩饭","火锅汤底","沥干后的固体废弃物","鱼骨","碎骨","碎骨头","茶叶渣","咖啡渣","过期食品","糕饼","糖果","风干食品","肉干","红枣","中药材","粉末类食品","冲泡饮料","面粉","宠物饲料","瓜皮果核","水果果肉","椰子肉","水果果皮","西瓜皮","桔子皮","苹果皮","水果茎枝","葡萄枝","果实","西瓜籽","花卉植物","家养绿植","花卉","花瓣","枝叶","中药药渣","奶茶中的珍珠","水果","麻辣烫","小龙虾","粽子馅","猫粮"];
var residualItems = ["餐巾纸","卫生间用纸","尿不湿","猫砂","狗尿垫","污损纸张","烟蒂","干燥剂","污损塑料","尼龙制品","编织袋","防碎气泡膜","大骨头","硬贝壳","硬果壳","椰子壳","榴莲壳","核桃壳","玉米衣","甘蔗皮","硬果实","榴莲核","菠萝蜜核","毛发","灰土","炉渣","橡皮泥","太空沙","带胶制品","胶水","胶带","花盆","毛巾","一次性餐具","镜子","陶瓷制品","竹制品","竹篮","竹筷","牙签","成分复杂的制品","伞","笔","眼镜","打火机","奶茶杯","奶茶塑料盖","婴儿尿布","一次性尿布","面膜","吸管","粽子皮","粽子壳","粽子叶","粽子包扎线"];
var tipKeys = [];
tipKeys.push(...recoverableItems.map(item => item + " [可回收物]"));
tipKeys.push(...hazardousItems.map(item => item + " [有害垃圾]"));
tipKeys.push(...householdItems.map(item => item + " [湿垃圾]"));
tipKeys.push(...residualItems.map(item => item + " [干垃圾]"));

Page({
  data: {
    noResult: false,
  },

  // 搜索栏
  onLoad: function () {
    var that = this;
    WxSearch.init(
      that,  // 本页面一个引用
      ["奶茶","水果","麻辣烫","尿布","小龙虾","面膜","报纸","吸管","粽子","猫粮","塑料","电池","鱼","骨头"], // 热点搜索推荐，[]表示不使用
      tipKeys,// 搜索匹配，[]表示不使用
      that.mySearchFunction, // 提供一个搜索回调函数
      that.myGobackFunction //提供一个返回回调函数
    );
  },

  // 转发函数,固定部分
  wxSearchInput: WxSearch.wxSearchInput,  // 输入变化时的操作
  wxSearchKeyTap: WxSearch.wxSearchKeyTap,  // 点击提示或者关键字、历史记录时的操作
  wxSearchDeleteAll: WxSearch.wxSearchDeleteAll, // 删除所有的历史记录
  wxSearchConfirm: WxSearch.wxSearchConfirm,  // 搜索函数
  wxSearchClear: WxSearch.wxSearchClear,  // 清空函数

  // 搜索回调函数  
  mySearchFunction: function (value) {
    this.setData({
      noResult: false
    });
    var result = /^(.+) \[(.+)\]$/.exec(value);
    if (result) {
      wx.showModal({
        content: `${result[1]} 属于 ${result[2]}`,
        showCancel: false,
      });
    } else if (tipKeys.some(item => item.includes(value))) {
      var e = {
        detail: {
          value
        }
      }
      WxSearch.wxSearchInput(e);
    } else {
      this.setData({
        noResult: true
      });
    }
  },

  // 返回回调函数
  myGobackFunction: function () {
    // 跳转
    wx.navigateBack({
      delta: 1
    })
  }
})