import DialogUser from './dialog/dialog-user.js';
import HTML from './page-user-list.html';

export default class PageUserList {
    #args = null;
    #userList = null;

    constructor(args) {
        this.#args = args;
        args.target.innerHTML = HTML;

        const tableUser = this.#args.target.querySelector('#tableUser>tbody');
        const buttonNew = this.#args.target.querySelector('#buttonNew');
        const dialogUser = new DialogUser({
            app: this.#args.app,
            target: this.#args.target,
            saveClick: () => {
                this.#dataRead();
            }
        });

        this.#dataRead();

        tableUser.addEventListener('click', (e) => {
            let btn = null;
            if (e.target.nodeName == 'I' && e.target.parentElement.nodeName == 'BUTTON') btn = e.target.parentElement;
            else if (e.target.nodeName == 'BUTTON') btn = e.target;

            if (btn) {
                let u = this.#userList[parseInt(btn.dataset.idx)];
                if (btn.dataset.aktion == 'del') {
                    if (confirm('Willst du wirklich ' + (u.name || '') + ' ' + (u.surname || '') + 'löschen?')) {
                        args.app.apiDelete('user', (r) => {
                            this.#dataRead();
                        }, (ex) => {
                            alert(ex);
                        }, u.userId);
                    }
                } else if (btn.dataset.aktion == 'pwdreset') {
                    if (confirm('Willst du wirklich das Passwort für ' + (u.name || '') + ' ' + (u.surname || '') + ' zurücksetzen?')) {
                        args.app.apiSet('user/pwd', (r) => {
                            this.#dataRead();
                        }, (ex) => {
                            alert(ex);
                        }, null, {
                            userUid: u.userId?.toString(),
                            password: null
                        });
                    }
                }
            } else {
                if (e.target.dataset.idx) {
                    dialogUser.show(this.#userList[parseInt(e.target.dataset.idx)]);
                }
            }
        });

        buttonNew.addEventListener('click', () => {
            dialogUser.show();
        });
    }

    #dataRead() {
        const tableUser = this.#args.target.querySelector('#tableUser>tbody');
        //API-Aufruf, um die Nutzerdaten zu laden
        this.#args.app.apiGet('user', (userList) => {
            //Nutzer nach Nummer sortieren
            userList.sort(function(a, b) {
                return a.number - b.number;
            });
            this.#userList = userList;
            let html = '';
            let idx = 0;
            for (const u of userList) {
                html += `
                    <tr>
                        <td class="text-center">
                            <button type="button" class="btn btn-outline-primary" data-aktion="del" data-idx="${idx}" title="Nutzer löschen"><i class="bi bi-trash"></i></button>
                            <button type="button" class="btn btn-outline-danger" data-aktion="pwdreset" data-idx="${idx}" title="Passwort zurücksetzen"><i class="bi bi-person-fill-lock"></i></button>
                        </td>
                        <td class="element-clickable text-end" data-idx="${idx}">${u.number ?? ''}</td>
                        <td class="element-clickable" data-idx="${idx}">${u.name ?? ''} ${u.surname ?? ''}</td>
                        <td class="element-clickable" data-idx="${idx}">${u.role ?? ''}</td>
                        <td class="element-clickable" data-idx="${idx}">${u.loginName ?? ''}</td>
                        <td class="element-clickable" data-idx="${idx}">${u.mail ?? ''}</td>
                        <td class="element-clickable" data-idx="${idx}">${(u.lastLogin ? this.#args.app.formatDate(u.lastLogin) : '')}</td>
                    </tr>
                `;
                idx++;
            }
            tableUser.innerHTML = html;
        }, (ex) => {
            alert(ex);
        });
    }
}
