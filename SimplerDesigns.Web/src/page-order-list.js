import OrderTree from './order-tree/order-tree.js';
import HTML from './page-order-list.html';

export default class PageOrderList {

    constructor(args) {
        args.target.innerHTML = HTML;


        //-------------------------------------------
        const colOrderTree = args.target.querySelector('#colOrderTree');
        const orderTree = new OrderTree({
            target: colOrderTree,
            app: args.app,
            edit: true,
            click: (order) => {
                location.hash = '#orderdetail?id=' + order.orderId;
            }
        });

    }

}