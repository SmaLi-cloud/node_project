import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import ToastBox from '../../utils/toast';
import HHHH from '../../api/api';
export default function GoodsMove(props) {
  const params = props.route.params;
  const [detail, setDetail] = useState({});
  const warehouseInfo = useRef(null);
  useEffect(() => {
    getGoodsDetail();
  }, []);
  const getGoodsDetail = () => {};
  const onChange = warehouse => {
    warehouseInfo.current = warehouse[0];
  };
  const onSubmit = () => {
    if (!warehouseInfo.current) {
      ToastBox.show('请选择仓库');
      return;
    }
    let goods = Object.assign({}, detail);
    // 删除不需要的数据
    delete goods.stock_distribution;
    delete goods.erp_goods_attribute;
    console.log(warehouseInfo.current);
    console.log('submit');
  };
  return <View></View>;
}