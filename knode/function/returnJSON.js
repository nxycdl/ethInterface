/**
 * Author:
 * Date: 14-6-4 上午11:52
 */

/**
 * @returns {*}
 */
module.exports = function (data, err) {

    var bizData = {};

    bizData.data = data;
    if (_.isUndefined(err))
        bizData.err = "";
    else
        bizData.err = err;

    return bizData;
}