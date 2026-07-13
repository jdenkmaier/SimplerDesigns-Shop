import HTML from './page-accounting.html';

const MONTH_NAMES = ['', 'Jänner', 'Februar', 'März', 'April', 'Mai', 'Juni',
                     'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

export default class PageAccounting {
    #args = null;

    constructor(args) {
        this.#args = args;
        args.target.innerHTML = HTML;

        // Jahr-Dropdown befüllen
        const selYear = this.#args.target.querySelector('#selYear');
        const currentYear = new Date().getFullYear();
        for (let y = currentYear; y >= currentYear - 4; y--) {
            selYear.innerHTML += `<option value="${y}">${y}</option>`;
        }

        // Monat-Dropdown befüllen
        const selMonth = this.#args.target.querySelector('#selMonth');
        selMonth.innerHTML = '<option value="">Alle Monate</option>';
        for (let m = 1; m <= 12; m++) {
            selMonth.innerHTML += `<option value="${m}">${MONTH_NAMES[m]}</option>`;
        }

        selYear.addEventListener('change', () => this.#dataRead());
        selMonth.addEventListener('change', () => this.#dataRead());

        this.#dataRead();
    }

    #dataRead() {
        const selYear         = this.#args.target.querySelector('#selYear');
        const selMonth        = this.#args.target.querySelector('#selMonth');
        const tbodyAccounting = this.#args.target.querySelector('#tbodyAccounting');
        const rowSummary      = this.#args.target.querySelector('#rowSummary');
        const lblTotalRevenue = this.#args.target.querySelector('#lblTotalRevenue');
        const lblTotalOrders  = this.#args.target.querySelector('#lblTotalOrders');

        let url = 'Order/accounting?year=' + selYear.value;
        if (selMonth.value) url += '&month=' + selMonth.value;

        tbodyAccounting.innerHTML = '<tr><td colspan="3" class="text-center text-muted">Lade Daten...</td></tr>';

        this.#args.app.apiGet(url, (data) => {
            const fmt = (v) => v.toLocaleString('de-AT', { style: 'currency', currency: 'EUR' });

            lblTotalRevenue.textContent = fmt(data.totalRevenue);
            lblTotalOrders.textContent  = data.totalOrders;
            rowSummary.classList.remove('d-none');

            if (!data.entries || data.entries.length === 0) {
                tbodyAccounting.innerHTML = '<tr><td colspan="3" class="text-center text-muted">Keine Bestellungen im gewählten Zeitraum.</td></tr>';
                return;
            }

            let html = '';
            for (const e of data.entries) {
                html += `
                    <tr>
                        <td>${MONTH_NAMES[e.month]}</td>
                        <td class="text-end">${e.orderCount}</td>
                        <td class="text-end">${fmt(e.revenue)}</td>
                    </tr>
                `;
            }
            tbodyAccounting.innerHTML = html;

        }, (ex) => {
            alert(ex);
        });
    }
}
