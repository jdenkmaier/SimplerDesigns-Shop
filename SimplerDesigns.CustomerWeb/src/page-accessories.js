import HTML from './page-accessories.html';

export default class PageAccessories {
    constructor(args) {
        args.target.innerHTML = HTML;
        args.app.renderArticleGrid(args.target.querySelector('#articleGrid'), 'shop/category/11/article');
    }
}
