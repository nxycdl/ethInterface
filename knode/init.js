/**
 * Created by ken.xu on 14-1-27.
 */
module.exports = function (root) {
    return {
        date: require(root + '/function/date'),
        html: require(root + '/function/html'),
        bizData: require(root + '/function/returnJSON'),
        hashmap: require(root + '/function/hashmap'),
        array: require(root + '/function/array'),
        validate: require(root + '/function/validateID'),
        webservice: require(root + '/function/webservice'),
        sign: require(root + '/function/sign'),
        signYunbi: require(root + '/function/signYunbi'),
        biz: require(root + '/function/returnout'),
    }
}