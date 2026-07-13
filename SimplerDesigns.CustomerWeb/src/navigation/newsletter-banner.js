import './../../node_modules/bootstrap/dist/js/bootstrap.bundle.js';
import HTML from './newsletter-banner.html';

export default class NewsletterBanner {
    constructor(args) {
        args.target.insertAdjacentHTML('beforeend', HTML);
    }
}