/**
 * Created by yanhu on 14-10-21.
 */
/*
 *  方法:Array.remove(dx) 通过遍历,重构数组
 *  功能:删除数组元素.
 *  参数:dx删除元素的下标.
 */
Array.prototype.remove = function(dx) {
    if (isNaN(dx) || dx > this.length) {
        return false;
    }
    for (var i = 0, n = 0; i < this.length; i++) {
        if (this[i] != this[dx]) {
            this[n++] = this[i];
        }
    }
    this.length -= 1;
};
/*
 * 方法:Array.add(dx) 通过遍历,重构数组 功能:删除数组元素. 参数:dx删除元素的下标.
 */
Array.prototype.add = function(dx, obj) {
    if (isNaN(dx) || dx > this.length) {
        return false;
    }

    var arr = new Array();

    for (var i = 0; i <= this.length; i++) {
        if (i == dx)
            break;

        arr[i] = this[i];
    }

    arr[dx] = obj;

    for (var i = dx; i < this.length; i++) {
        arr[i + 1] = this[i];
    }

    return arr;
};