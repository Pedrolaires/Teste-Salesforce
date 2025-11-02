import { LightningElement, api } from 'lwc';

export default class CustomDataTable extends LightningElement {
    @api
    records = [];
    @api
    columns = [];
    @api
    isLoading = false;

    handleLoadMore(evt) {
        this.dispatchEvent(new CustomEvent('loadmore', {
            detail: {
                target: evt.target 
            }
        }));
    }

    handleRowAction(evt) {
        this.dispatchEvent(new CustomEvent('rowaction', {
            detail: evt.detail 
        }));
    }
}