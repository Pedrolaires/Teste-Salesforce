import { LightningElement, api } from 'lwc';

const DEBOUNCE_DELAY = 300; 

export default class SearchBar extends LightningElement {
    @api
    label = 'Pesquisar';
    @api
    placeholder = 'Pesquisar...';
    delayTimeout;

    handleKeyUp(event) {
        const searchKey = event.target.value;
        window.clearTimeout(this.delayTimeout);
        this.delayTimeout = window.setTimeout(() => {
            console.log('valor sdo srch:', searchKey);
            this.dispatchEvent(new CustomEvent('search', {
                detail: { value: searchKey }
            }));

        }, DEBOUNCE_DELAY);
    }
}