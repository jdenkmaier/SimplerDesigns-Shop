import SubPageStamm         from './article-detail/sub-page-base.js';
import SubPageFile          from './article-detail/sub-page-file.js';
import SubPageInventory     from './article-detail/sub-page-inventory.js';
import HTML                 from './page-article-detail.html';

export default class PageArticleDetail {

  constructor(args) {
    args.target.innerHTML = HTML;

    const containerPage = args.target.querySelector('#containerPage');

    args.target.querySelectorAll('a').forEach( (item) => {
      if (/.?=(file|inventory)/gm.test(item.href)) {
        item.classList.add('d-none');
      }
    });

    if (args.id) {
      args.target.querySelectorAll('a').forEach( (item) => {
        item.href = item.href + '&id=' + args.id;
        if (/.?=(file|inventory)/gm.test(item.href)) {
          item.classList.remove('d-none');
        }
      });
    }

    //test

    if (args.p) {
      switch(args.p) {
        case 'file':
          new SubPageFile({
            target: containerPage,
            app: args.app,
            id: args.id,
          });
          break;
        case 'inventory':
          new SubPageInventory({
            target: containerPage,
            app: args.app,
            id: args.id,
          });
          break;
        default:
          new SubPageStamm({
            target: containerPage,
            app: args.app,
            id: args.id,
            saveClick: (article) => {
              args.id = article.articleUid;
              args.target.querySelectorAll('a').forEach( (item) => {
                item.href = item.href + '&id=' + article.articleUid;
                if (/.?=(file|inventory)/gm.test(item.href)) {
                  item.classList.remove('d-none');
                }
              });
            }
          });
          break;
      }
    } else  {
      new SubPageStamm({
        target: containerPage,
        app: args.app,
        id: args.id,
        saveClick: (article) => {
          args.id = article.articleUid;
          args.target.querySelectorAll('a').forEach( (item) => {
            item.href = item.href + '&id=' + article.articleUid;
            if (/.?=(file|inventory)/gm.test(item.href)) {
              item.classList.remove('d-none');
            }
          });
        }
      });

    }

  }

}
