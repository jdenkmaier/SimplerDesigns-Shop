import bootstrap          from 'bootstrap/dist/js/bootstrap.bundle.js';
import HTML               from './page-order-detail.html';
import { ORDER_STATUS }   from './enum.js';

export default class PageOrderDetail {
    constructor(args) {
        args.target.innerHTML = HTML;

        //--------------------------------------------------------------
        const textOrderNumber   = args.target.querySelector('#textOrderNumber');
        const textOrderTime     = args.target.querySelector('#textOrderTime');
        const textCustomerName  = args.target.querySelector('#textCustomerName');
        const textPaymethod     = args.target.querySelector('#textPaymethod');
        const selectStatus      = args.target.querySelector('#selectStatus');
        const textPriceNetto    = args.target.querySelector('#textPriceNetto');
        const textPriceMwst     = args.target.querySelector('#textPriceMwst');
        const textPriceArticles = args.target.querySelector('#textPriceArticles');
        const textPriceShipping = args.target.querySelector('#textPriceShipping');
        const textPriceTotal    = args.target.querySelector('#textPriceTotal');
        const tablePositions    = args.target.querySelector('#tablePositions>tbody');
        const buttonBack        = args.target.querySelector('#buttonBack');
        const toastSave         = bootstrap.Toast.getOrCreateInstance(args.target.querySelector('#toastSave'));
        const toastBody         = args.target.querySelector('#toastSave>.toast-body');

        let order = null;

        //--------------------------------------------------------------
        // Status-Dropdown befüllen
        //--------------------------------------------------------------
        for (const [value, label] of Object.entries(ORDER_STATUS)) {
            const opt = document.createElement('option');
            opt.value = value;
            opt.textContent = label;
            selectStatus.appendChild(opt);
        }

        //--------------------------------------------------------------
        // Events
        //--------------------------------------------------------------
        buttonBack.addEventListener('click', () => {
            location.hash = '#orderlist';
        });

        selectStatus.addEventListener('change', () => {
            if (!order) return;
            const newStatus = parseInt(selectStatus.value);

            // Ab Status "Versendet" (40) müssen alle Artikel als versendet markiert sein
            if (newStatus >= 40) {
                const pos = order.articles ? JSON.parse(order.articles) : [];
                const allShipped = pos.length > 0 && pos.every(p => p.shipped);
                if (!allShipped) {
                    toastBody.innerHTML = '<div class="alert alert-danger mb-0">Nicht alle Artikel wurden als versendet markiert.</div>';
                    toastSave.show();
                    selectStatus.value = order.status ?? 0;
                    return;
                }
            }

            order.status = newStatus;
            args.app.apiSet('order', (r) => {
                if (r.ok) {
                    toastBody.innerHTML = '<div class="alert alert-success mb-0">Gespeichert</div>';
                } else {
                    toastBody.innerHTML = '<div class="alert alert-danger mb-0">Fehler: ' + r.message + '</div>';
                }
                toastSave.show();
            }, (ex) => alert(ex), order.orderId, order);
        });

        //--------------------------------------------------------------
        // Daten laden
        //--------------------------------------------------------------
        if (args.id) {
            args.app.apiGet('order/' + args.id, (r) => {
                order = r;

                const dt = order.orderTime ? new Date(order.orderTime) : null;
                textOrderNumber.value  = order.orderNumber ?? '';
                textOrderTime.value    = dt ? dt.toLocaleDateString('de-AT') + ' ' + dt.toLocaleTimeString('de-AT', { hour: '2-digit', minute: '2-digit' }) : '';
                textCustomerName.value = order.customerName ?? '';
                textPaymethod.value    = order.paymethod ?? '';
                selectStatus.value     = order.status ?? 0;

                // Preisaufschlüsselung
                const brutto   = order.priceArticles ?? 0;
                const netto    = brutto / 1.2;
                const mwst     = brutto - netto;
                const shipping = order.priceShipping ?? 0;

                textPriceNetto.textContent    = netto.toFixed(2) + ' €';
                textPriceMwst.textContent     = mwst.toFixed(2) + ' €';
                textPriceArticles.textContent = brutto.toFixed(2) + ' €';
                textPriceShipping.textContent = shipping.toFixed(2) + ' €';
                textPriceTotal.textContent    = (brutto + shipping).toFixed(2) + ' €';

                // Artikel und Versandstatus 
                if (order.articles) {
                    const positions = JSON.parse(order.articles);
                    let html = '';
                    for (let i = 0; i < positions.length; i++) {
                        const p = positions[i];
                        const gesamt = ((p.price ?? 0) * (p.quantity ?? 1)).toFixed(2);
                        html += `<tr>
                            <td>${p.name ?? ''}</td>
                            <td class="text-end">${p.quantity ?? 1}</td>
                            <td class="text-end">${(p.price ?? 0).toFixed(2)} €</td>
                            <td class="text-end">${gesamt} €</td>
                            <td class="text-center"><input type="checkbox" class="form-check-input" data-index="${i}" ${p.shipped ? 'checked' : ''}></td>
                        </tr>`;
                    }
                    tablePositions.innerHTML = html;

                    // Event-Listener für die Checkboxen 
                    tablePositions.querySelectorAll('input[type=checkbox]').forEach(cb => {
                        cb.addEventListener('change', () => {
                            const idx = parseInt(cb.dataset.index);
                            positions[idx].shipped = cb.checked;
                            order.articles = JSON.stringify(positions);
                            args.app.apiSet('order', (r) => {
                                if (r.ok) {
                                    toastBody.innerHTML = '<div class="alert alert-success mb-0">Gespeichert</div>';
                                } else {
                                    toastBody.innerHTML = '<div class="alert alert-danger mb-0">Fehler: ' + r.message + '</div>';
                                }
                                toastSave.show();
                            }, (ex) => alert(ex), order.orderId, order);
                        });
                    });
                }

            }, (ex) => alert(ex));
        }
    }
}
