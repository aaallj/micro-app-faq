import axios from 'axios';
import crypto from 'crypto';
import payConf from '../pay.json';

const createOrderUrl = 'https://developer.toutiao.com/api/apps/ecpay/v1/create_order';
const repayOrderUrl = 'https://developer.toutiao.com/api/apps/ecpay/v1/create_refund';

const SALT = payConf.salt;
// 字段名写错了
const exclude = ['sign', 'app_id', 'thirdparty_id'];
const app_id = payConf.appid;

function md5(str: string) {
    const _md5 = crypto.createHash('md5');
    _md5.update(str);
    return _md5.digest('hex');
}

/**
 * 签名，为请求增加签名以验证参数没有被修改
 * @param params 
 */
function sign(params: { [k: string]: string | number }) {
    return md5(
        Object.keys(params)
            .filter(key => !exclude.includes(key))
            .map(key => params[key])
            .concat([SALT]) // 注意不要忘记添加密钥进来
            .sort()
            .join('&')
    );
}

// 请求创建订单接口
export function createOrder(order) {
    Object.assign(order, { app_id });
    console.log('createOrder===', order);
    return axios({
        method: 'POST',
        url: createOrderUrl,
        data: JSON.stringify({
            ...order,
            sign: sign(order),
        }),
    }).then(res => res.data);
}


// 退款
export function repayOrder(order) {
    Object.assign(order, { app_id });
    console.log('==退款请求==', order);
    return axios({
        method: 'POST',
        url: repayOrderUrl,
        data: JSON.stringify({
            ...order,
            sign: sign(order),
        }),
    }).then(res => {
        return res.data;
    });
}
