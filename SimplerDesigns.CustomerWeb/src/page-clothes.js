import HTML from './page-clothes.html';

export default class PageClothes {
    constructor(args) {
        args.target.innerHTML = HTML;
        args.app.renderArticleGrid(args.target.querySelector('#articleGrid'), 'shop/category/7/article');
    }
}