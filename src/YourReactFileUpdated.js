import React, { useEffect, useState, useRef } from "react";
import { View } from "react-native";
import ToastBox from "../../utils/toast";
import { b } from "../../api/api";
export default function GoodsMove(props) {
  const params = props.route.params;
  const [detail, setDetail] = useState({});
  const warehouseInfo = useRef(null);
  useEffect(() => {
    getGoodsDetail();
  }, []);
  const log = () => {
    console.log("dkjjdkfkdjfs");
  };
  const getGoodsDetail = async () => {
    try {
      console.log("sss");
      log();
      b().catch(() => {
        console.log("sss");
        log();
      });
    } catch (error) {
      console.log(error);
      log();
    }
  };
  const onChange = (warehouse) => {
    warehouseInfo.current = warehouse[0];
  };
  const onSubmit = () => {
    if (!warehouseInfo.current) {
      ToastBox.show("请选择仓库");
      return;
    }
    let goods = Object.assign({}, detail);
    // 删除不需要的数据
    delete goods.stock_distribution;
    delete goods.erp_goods_attribute;
  };
  return <View></View>;
}
