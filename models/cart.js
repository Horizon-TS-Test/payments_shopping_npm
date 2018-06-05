module.exports = function Cart(oldCart) {
    this.items = oldCart.items || {};
    this.totalInd = oldCart.totalInd || 0;
    this.totalPrecio = oldCart.totalPrecio || 0;

    this.add = function (item, id) {
        var storedItem = this.items[id];
        if (!storedItem) {
            storedItem = this.items[id] = { item: item, qty: 0, precio: 0 }
        }
        storedItem.qty++;
        storedItem.precio = storedItem.item.precio * storedItem.qty;
        this.totalInd++;
        this.totalPrecio += storedItem.item.precio;
    };
    this.generateArray = function () {
        var arr = [];
        for (var id in this.items) {
            arr.push(this.items[id]);
        }
        return arr;
    };
};