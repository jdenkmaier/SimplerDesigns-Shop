import bootstrap from 'bootstrap/dist/js/bootstrap.bundle.js';
import HTML from './dialog-user.html';

export default class DialogUser {
  #args = null;
  #modal = null;
  #user = null;

  constructor(args) {
    this.#args = args;
    this.#args.target.insertAdjacentHTML('beforeend', HTML);

    const modalUser = this.#args.target.querySelector('#modalUser');
    this.#modal = new bootstrap.Modal(modalUser);
    const buttonSpeichern = this.#args.target.querySelector('#buttonSaveDialogUser');
    const textLoginName = this.#args.target.querySelector('#textLoginNameDialogUser');
    const textName = this.#args.target.querySelector('#textNameDialogUser');
    const textSurname = this.#args.target.querySelector('#textSurnameDialogUser');
    const textMail = this.#args.target.querySelector('#textMailDialogUser');
    const dateJoinDate = this.#args.target.querySelector('#dateJoinDateDialogUser');
    const selectRole = this.#args.target.querySelector('#selectRoleDialogUser');

    const tableRecentOrders = this.#args.target.querySelector('#tableRecentOrdersDialogUser>tbody');

    // Klick auf eine Bestellzeile: Modal zuerst schließen, dann zur Bestelldetailseite navigieren
    tableRecentOrders.addEventListener('click', (e) => {
      const row = e.target.closest('tr[data-orderid]');
      if (row) {
        this.#modal.hide(); // erst schließen, sonst bleibt das Modal im Hintergrund offen
        location.hash = '#orderdetail?id=' + row.dataset.orderid;
      }
    });

    buttonSpeichern.addEventListener('click', () => {
      if (!this.#user) this.#user = { userId: null };

      this.#user.loginName = textLoginName.value ? textLoginName.value : null;
      this.#user.name = textName.value ? textName.value : null;
      this.#user.surname = textSurname.value ? textSurname.value : null;
      this.#user.mail = textMail.value ? textMail.value : null;
      this.#user.role = parseInt(selectRole.value);
      this.#user.joinDate = dateJoinDate.value ? dateJoinDate.value : null;

      this.#args.app.apiSet('user', (r) => {
        if (r.ok) {
          this.#modal.hide();
          if (args.saveClick && typeof args.saveClick === 'function') args.saveClick();
        }
      }, (ex) => {
        alert(ex);
      }, this.#user.userId, this.#user);
    });
  }

  show(user) {
    const textLoginName = this.#args.target.querySelector('#textLoginNameDialogUser');
    const textName = this.#args.target.querySelector('#textNameDialogUser');
    const textSurname = this.#args.target.querySelector('#textSurnameDialogUser');
    const textMail = this.#args.target.querySelector('#textMailDialogUser');
    const dateJoinDate = this.#args.target.querySelector('#dateJoinDateDialogUser');
    const selectRole = this.#args.target.querySelector('#selectRoleDialogUser');

    this.#user = null;
    textLoginName.value = '';
    textName.value = '';
    textSurname.value = '';
    textMail.value = '';
    dateJoinDate.value = '';
    selectRole.selectedIndex = 0;

    if (user) {
      this.#user = user;
      textLoginName.value = this.#user.loginName || '';
      textName.value = this.#user.name || '';
      textSurname.value = this.#user.surname || '';
      textMail.value = this.#user.mail || '';
      dateJoinDate.value = this.#user.joinDate ? this.#user.joinDate.split('T')[0] : '';
      selectRole.value = this.#user.role ?? '0';
    }

    const tableRecentOrders = this.#args.target.querySelector('#tableRecentOrdersDialogUser>tbody');
    tableRecentOrders.innerHTML = '<tr><td colspan="3" class="text-muted">Lädt…</td></tr>';

    // ?. = optional chaining: wenn user null ist (neuer User), wird userId nicht ausgelesen sondern undefined zurückgegeben
    if (user?.userId) {
      this.#args.app.apiGet('order/byuser/' + user.userId, (orders) => {
        if (orders.length === 0) {
          tableRecentOrders.innerHTML = '<tr><td colspan="3" class="text-muted">Keine Bestellungen vorhanden</td></tr>';
        } else {
          let html = '';
          for (const o of orders) {
            const dt = o.orderTime ? new Date(o.orderTime) : null;
            const datum = dt ? dt.toLocaleDateString('de-AT') : '';
            const preis = ((o.priceArticles ?? 0) + (o.priceShipping ?? 0)).toFixed(2);
            // data-orderid speichert die ID direkt im Element, damit der Klick-Handler sie auslesen kann
            html += `<tr class="element-clickable" data-orderid="${o.orderId}">
              <td>${o.orderNumber ?? ''}</td>
              <td>${datum}</td>
              <td class="text-end">${preis} €</td>
            </tr>`;
          }
          tableRecentOrders.innerHTML = html;
        }
      }, () => {
        tableRecentOrders.innerHTML = '<tr><td colspan="3" class="text-danger">Fehler beim Laden</td></tr>';
      });
    } else {
      tableRecentOrders.innerHTML = '';
    }

    this.#modal.show();
  }
}
