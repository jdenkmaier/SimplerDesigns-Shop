import HTML from './order-tree.html';
import { ORDER_STATUS } from '../enum.js';

export default class OrderTree {
    //==============================================================================================================================================
    // private variablen
    //==============================================================================================================================================
    #args = null;
    #orderList = null;
    #pageSize = 10;

    //==============================================================================================================================================
    constructor(args) {
        this.#args = args;
        args.target.innerHTML = HTML;

        //-----------------------------------
        // init
        //-----------------------------------
        const tableOrder = this.#args.target.querySelector('#tableOrder>tbody');
        const toolbarLeft = this.#args.target.querySelector('#toolbarLeft');
        const toolbarRight = this.#args.target.querySelector('#toolbarRight');

        if (args.edit) {
            toolbarLeft.innerHTML = '<button type="button" class="btn btn-secondary" id="buttonNew"><i class="bi bi-plus me-2"></i>Neu</button>';
        }

        //-----------------------------------
        // events
        //-----------------------------------
        tableOrder.addEventListener('click', (e) => {
            const btn = e.target.closest('button[data-aktion="del"]');
            const tr = e.target.closest('tr[data-id]');

            if (btn) {
                const order = this.#orderList.find(o => o.orderId == parseInt(btn.dataset.id));
                if (confirm('Bestellung ' + order.orderNumber + ' wirklich löschen?')) {
                    args.app.apiDelete('order', (r) => {
                        if (r.ok) this.#dataRead();
                        else alert(r.message);
                    }, (ex) => alert(ex), order.orderId);
                }
            } else if (tr && !btn) {
                //Wenn nicht auf Select, sondern auf die Zeile geclickt wurde -> Detailansicht öffnen (würde sonst beim Status Select blockieren)
                if (!e.target.closest('select')) {
                    const order = this.#orderList.find(o => o.orderId == parseInt(tr.dataset.id));
                    if (args.click && typeof args.click === 'function') args.click(order);
                }
            }
        });

        tableOrder.addEventListener('change', (e) => {
            const selectElement = e.target.closest('select[data-aktion="status"]');
            if (selectElement) {
                const order = this.#orderList.find(o => o.orderId == parseInt(selectElement.dataset.id));
                order.status = parseInt(selectElement.value);
                args.app.apiSet('order', (r) => {
                    if (r.ok) this.#dataRead();
                    else alert(r.message);
                }, (ex) => alert(ex), order.orderId, order);
            }
        });

        if (args.edit) {
            const buttonNew = args.target.querySelector('#buttonNew');
            if (buttonNew) {
                buttonNew.addEventListener('click', () => {
                    if (args.newClick && typeof args.newClick === 'function') args.newClick();
                });
            }
        }

        args.app.selectListSize(toolbarRight, (size) => {
            this.#pageSize = size;
            tableOrder.innerHTML = this.#dataShow();
        });

        this.#dataRead();
    }

    //==============================================================================================================================================
    // private methoden
    //==============================================================================================================================================
    #dataRead() {
        const tableOrder = this.#args.target.querySelector('#tableOrder>tbody');

        this.#args.app.apiGet('order', (orderList) => {
            this.#orderList = orderList;
            tableOrder.innerHTML = this.#dataShow();
        }, (ex) => {
            alert(ex);
        });
    }

    #statusOptions(currentStatus) {
        let html = '';
        const entries = Object.entries(ORDER_STATUS);
        for (let i = 0; i < entries.length; i++) {
            const value = entries[i][0];
            const label = entries[i][1];
            const selected = parseInt(value) === currentStatus ? 'selected' : '';
            html += `<option value="${value}" ${selected}>${label}</option>`;
        }
        return html;
    }

    #dataShow() {
        let html = '';
        let list = this.#orderList;
        if (this.#pageSize !== 0) {
            list = this.#orderList.slice(0, this.#pageSize);
        }

        for (const o of list) {
            //Datum konvertieren und formatieren
            const dt = o.orderTime ? new Date(o.orderTime) : null;
            const datum = dt ? dt.toLocaleDateString('de-AT') + ' ' + dt.toLocaleTimeString('de-AT', { hour: '2-digit', minute: '2-digit' }) : '';

            const gesamt = ((o.priceArticles ?? 0) + (o.priceShipping ?? 0)).toFixed(2);

            let rowClass = 'element-clickable';
            if (o.status === 90) rowClass += ' table-danger';
            else if (o.status === 0 || o.status === 10 || o.status === 20 || o.status === 30) rowClass += ' table-warning';

            html += `
                <tr class="${rowClass}" data-id="${o.orderId}">
                    <td class="${this.#args.edit ? '' : 'd-none'}">
                        <button type="button" class="btn btn-outline-danger" data-aktion="del" data-id="${o.orderId}" title="Bestellung löschen">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                    <td>${o.orderNumber ?? ''}</td>
                    <td>${datum}</td>
                    <td>
                        <select class="form-select form-select-sm" data-aktion="status" data-id="${o.orderId}">${this.#statusOptions(o.status)}</select></td>
                    <td>${o.customerName ?? ''}</td>
                    <td>${o.paymethod ?? ''}</td>
                    <td class="text-end">${gesamt} €</td>
                </tr>
            `;
        }

        return html;
    }
}
