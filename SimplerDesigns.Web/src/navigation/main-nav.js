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


    get user() {
        return this.#user;
    }

    set user(v) {
        this.#user = v;

        const infoTextBenutzer = this.#args.target.querySelector('#infoTextBenutzer');        
        if (this.#user) 
            infoTextBenutzer.innerText = (this.#user.name + ' ' + this.#user.surname + ' ');
        else 
            infoTextBenutzer.innerText = 'Nicht angemeldet';
    }

}