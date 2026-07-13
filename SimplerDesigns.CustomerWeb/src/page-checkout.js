import HTML from './page-checkout.html';

export default class PageCheckout {
    constructor(args) {
        if (!args.app.user) { window.open('#login', '_self'); return; }

        args.target.innerHTML = HTML;

        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        if (cart.length === 0) { window.open('#cart', '_self'); return; }

        const selectDelivery = args.target.querySelector('#selectDelivery');

        //Lieferadressen aus User laden und ins Dropdown einfügen
        const addresses = JSON.parse(args.app.user.deliveryAdress || '[]');
        selectDelivery.innerHTML = '<option value="">-- bitte wählen --</option>';
        for (const d of addresses) {
            selectDelivery.innerHTML += `<option value="${d.country}">${d.label} — ${d.adress}, ${d.zip} ${d.city}</option>`;
        }

        //Artikelübersicht befüllen
        let subtotal = 0;
        let html = '';
        for (const item of cart) {
            html += `
                <div class="d-flex justify-content-between">
                    <span>${item.name}</span>
                    <span>${item.price.toFixed(2)} €</span>
                </div>`;
            subtotal = subtotal + item.price;
        }
        args.target.querySelector('#orderSummary').innerHTML = html;

        //Versand + Gesamt berechnen und anzeigen
        let shipping = 0;
        const updateTotals = () => {
            const country = selectDelivery.value;
            switch (country) {
                case 'AT': shipping = 4.90; break;
                case 'DE':
                case 'CH': shipping = 7.90; break;
                default:   shipping = 0;    break;
            }
            args.target.querySelector('#checkoutShipping').innerText = shipping > 0 ? shipping.toFixed(2) + ' €' : '—';
            args.target.querySelector('#checkoutTotal').innerText    = (subtotal + shipping).toFixed(2) + ' €';
        };

        selectDelivery.addEventListener('change', updateTotals);
        updateTotals();

        //Bestellung abschicken und Einkaufswagen leeren
        args.target.querySelector('#buttonPay').addEventListener('click', () => {
            if (!selectDelivery.value) { alert('Bitte wähle eine Lieferadresse.'); return; }
            const payment = args.target.querySelector('input[name="payment"]:checked');
            if (!payment) { alert('Bitte wähle eine Zahlungsmethode.'); return; }

            const order = {
                oUserId:       args.app.user.userId,
                priceArticles: subtotal,
                articles:      JSON.stringify(cart),
                priceShipping: shipping,
                paymethod:     payment.value,
                status:        10
            };

            args.app.apiSet('order', (r) => {
                if (r.ok) {
                    localStorage.removeItem('cart');
                    alert('Vielen Dank für deine Bestellung! Wir haben sie erhalten.');
                    window.open('#main', '_self');
                } else {
                    alert(r.message);
                }
            }, (ex) => {
                alert(ex.message);
            }, null, order);
        });
    }
}
