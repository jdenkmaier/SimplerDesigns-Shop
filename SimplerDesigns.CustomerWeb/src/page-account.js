import HTML from './page-account.html';

export default class PageAccount {
    #args = null;

    constructor(args) {
        //nicht eingeloggt -> zur Login-Seite
        if (!args.app.user) { window.open('#login', '_self'); return; }

        this.#args = args;
        args.target.innerHTML = HTML;

        //--------------------------------------------
        const u = args.app.user;

        args.target.querySelector('#accountGreeting').innerText  = 'Willkommen, ' + u.name + '!';
        args.target.querySelector('#displayName').innerText      = u.name      || '—';
        args.target.querySelector('#displaySurname').innerText   = u.surname   || '—';
        args.target.querySelector('#displayMail').innerText      = u.mail      || '—';
        args.target.querySelector('#displayLoginName').innerText = u.loginName || '—';

        //Rechnungsadresse aus den einzelnen Feldern zusammensetzen
        const adressParts = [u.adress, u.city, u.country].filter(p => p);
        args.target.querySelector('#displayAdress').innerText = adressParts.length > 0 ? adressParts.join(', ') : '—';

        //--------------------------------------------
        // Lieferadressen
        //--------------------------------------------
        const deliveryList  = args.target.querySelector('#displayDeliveryList');
        const deliveryEmpty = args.target.querySelector('#displayDeliveryEmpty');

        let list = [];
        if (u.deliveryAdress) {
            try { list = JSON.parse(u.deliveryAdress); } catch (e) {}
        }

        if (list.length > 0) {
            deliveryEmpty.style.display = 'none';
            let html = '';
            for (const d of list) {
                html += `
                    <div class="col-12 col-md-6">
                        <div class="card p-3">
                            <strong>${d.label || '—'}</strong>
                            <span class="text-muted">${d.adress || ''}</span>
                            <span class="text-muted">${[d.zip, d.city].filter(p => p).join(' ')}</span>
                            <span class="text-muted">${d.country || ''}</span>
                        </div>
                    </div>`;
            }
            deliveryList.innerHTML = html;
        }

        //--------------------------------------------
        // Bestellungen
        //--------------------------------------------
        const orderToolbar = args.target.querySelector('#orderToolbar');
        const orderList    = args.target.querySelector('#displayOrderList');
        const orderEmpty   = args.target.querySelector('#displayOrderEmpty');

        let orderLimit = 10;

        //Dropdown generieren
        const OPTIONS = [5, 10, 25, 50, 0];
        const wrapper = document.createElement('div');
        wrapper.className = 'd-flex align-items-center gap-2';
        wrapper.innerHTML = `
            <label class="form-label mb-0">Anzeigen:</label>
            <select class="form-select form-select-sm w-auto">
                ${OPTIONS.map(n => `<option value="${n}" ${n === orderLimit ? 'selected' : ''}>${n === 0 ? 'Alle' : n}</option>`).join('')}
            </select>`;
        orderToolbar.appendChild(wrapper);

        wrapper.querySelector('select').addEventListener('change', (e) => {
            orderLimit = parseInt(e.target.value);
            args.app.loadOrders(orderList, orderEmpty, u.userId, orderLimit);
        });

        args.app.loadOrders(orderList, orderEmpty, u.userId, orderLimit);

        //--------------------------------------------
        args.target.querySelector('#buttonLogout').addEventListener('click', () => {
            localStorage.removeItem('user');
            args.app.user = null;
            window.open('#main', '_self');
        });
    }
}
