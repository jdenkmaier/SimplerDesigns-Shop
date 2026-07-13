import HTML from './page-main.html';

export default class PageMain {
    constructor(args) {
        args.target.innerHTML = HTML;
        args.app.renderArticleGrid(args.target.querySelector('#articleGrid'), 'shop/article/highlighted');
    }
}