import CategoryTree from './category-tree/category-tree.js';
import HTML from './page-main.html';

export default class PageMain {
    //=============================================================================================
    // vars
    //=============================================================================================
    #args = null;
    #categoryList = null;

    //=============================================================================================
    constructor(args) {
        this.#args = args;
        args.target.innerHTML = HTML;

        //---------------------------
        const colCategoryTree = this.#args.target.querySelector('#colCategoryTree');
        const tableArticles = this.#args.target.querySelector('#tableArticles>tbody');

        const renderArticles = (list) => {
            let html = '';

            for (const a of list) {
                html += `
                    <tr class="${a.inventory != null && a.inventory < 100 ? 'table-warning' : ''}">
                        <td>
                            <button type="button"
                                    class="btn btn-outline-primary"
                                    data-aktion="del"
                                    data-id="${a.articleId}"
                                    title="Artikel löschen">
                                <i class="bi bi-trash"></i>
                            </button>
                        </td>
                        <td class="element-clickable p-1" data-uid="${a.articleUid}" style="width:60px; vertical-align:middle; text-align:center;">
                            <img src="${args.app.apiUrl}article/${a.articleId}/thumbnail"
                                style="height:50px; width:55px; object-fit:cover;"
                                onerror="this.style.display='none'">
                        </td>
                        <td class="element-clickable" data-uid="${a.articleUid}">
                            ${a.number ?? ''}
                        </td>
                        <td class="element-clickable" data-uid="${a.articleUid}">
                            ${a.name ?? ''}
                        </td>
                        <td class="text-end element-clickable" data-uid="${a.articleUid}">
                            ${a.price != null ? a.price.toFixed(2) : ''} €
                        </td>
                        <td class="text-end element-clickable" data-uid="${a.articleUid}">
                            ${a.inventory ?? ''}
                        </td>
                    </tr>
                `;
            }

            tableArticles.innerHTML = html;
        };

        const categoryTree = new CategoryTree({
            target: colCategoryTree,
            app: args.app,
            edit: false,
            click: (category) => {
                args.app.apiGet(
                    'category/' + category.categoryId + '/article',
                    renderArticles,
                    (ex) => {
                        alert(ex);
                    }
                );
            }
        });

        // Beim Laden der Seite alle Artikel anzeigen
        args.app.apiGet(
            'article',
            renderArticles,
            (ex) => {
                alert(ex);
            }
        );

        //---------------------------
        // events
        //---------------------------

        tableArticles.addEventListener( 'click', (e) => {

            if (e.target.nodeName == 'TD' && e.target.dataset.uid) {
                window.open('#articledetail?id=' + e.target.dataset.uid, '_self');
            }

            const btn = e.target.closest('button[data-aktion="del"]');
            if (btn) {
                if (!confirm('Artikel wirklich löschen?')) return;
                args.app.apiDelete('article', (r) => {
                    if (r.ok) {
                        btn.closest('tr').remove();
                    } else {
                        alert(r.message);
                    }
                }, (ex) => alert(ex), btn.dataset.id);
            }

        });




        //---------------------------
        // init
        //---------------------------
    }

    //=============================================================================================
    // private
    //=============================================================================================

}