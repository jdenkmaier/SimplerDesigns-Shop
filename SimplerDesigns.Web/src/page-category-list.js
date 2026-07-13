import CategoryTree from './category-tree/category-tree.js';
import HTML from './page-category-list.html';

export default class PageCategoryList {

    constructor(args) {
        args.target.innerHTML = HTML;


        //-------------------------------------------
        const colCatTree = args.target.querySelector('#colCatTree');
        const categoryTree = new CategoryTree({
            target: colCatTree,
            app: args.app,
            edit: true
        });

    }

}