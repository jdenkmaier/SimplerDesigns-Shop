import HTML from './page-article.html';

export default class PageArticle {
    constructor(args) {
        args.target.innerHTML = HTML;

        args.app.apiGet('article/' + args.id, (article) => {
            args.target.querySelector('#articleName').innerText        = article.name;
            args.target.querySelector('#articlePrice').innerText       = article.price + ' €';
            args.target.querySelector('#articleDescription').innerText = article.description;
            args.target.querySelector('#articleImage').src             = args.app.apiUrl + 'shop/article/' + article.articleId + '/thumbnail';

            //Event-Listener für "In den Warenkorb"-Button
            args.target.querySelector('#buttonCart').addEventListener('click', () => {
                args.app.addToCart(article);
                alert(article.name + ' wurde zum Warenkorb hinzugefügt.');
            });
        }, (ex) => {
            alert(ex.message);
        });
    }
}
