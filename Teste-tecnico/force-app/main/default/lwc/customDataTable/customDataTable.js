import { LightningElement, api } from 'lwc';


export default class CustomDataTable extends LightningElement {
    LOAD_MORE_OFFSET_CONST = 5;
    
    @api records = [];
    @api columns = [];
    @api isLoading = false;
    @api loadMoreStatus = '';

    handleLoadMore(evt) {
        this.dispatchEvent(new CustomEvent('loadmore', {
            detail: {
                target: evt.target 
            }
        }));
    }
}