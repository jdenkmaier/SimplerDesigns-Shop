import './../../node_modules/bootstrap/dist/js/bootstrap.bundle.js';
import HTML from './main-nav.html';

export default class MainNav {

    #args = null;
    #user = null;

    constructor(args) {
        this.#args = args;
        args.target.innerHTML = HTML;
        if (args.user) this.user = args.user;

        
        
    }

    //Navigation aktualisiert sich automatisch, wenn sich der User ändert
    get user() {
        return this.#user;
    }

    set user(v) {
        this.#user = v;

        const infoTextBenutzer = this.#args.target.querySelector('#infoTextBenutzer');
        const linkUser     = this.#args.target.querySelector('#linkUser');
        if (this.#user) {
            infoTextBenutzer.innerText = (this.#user.name + ' ' + this.#user.surname + ' ');
            linkUser.href = '#account';
        } else {
            infoTextBenutzer.innerText = 'Nicht angemeldet';
            linkUser.href = '#login';
        }
    }

}