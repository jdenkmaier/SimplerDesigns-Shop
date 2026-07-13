import './../../node_modules/bootstrap/dist/js/bootstrap.bundle.js';
import HTML from './footer.html';

export default class Footer {
    constructor(args) {
        args.target.insertAdjacentHTML('beforeend', HTML);
    }
}