import { createElement } from 'lwc';
import CustomDataTable from 'c/customDataTable';

describe('c-custom-data-table', () => {
    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    it('should dispatch evt loadmore "', () => {
        
        const element = createElement('c-custom-data-table', {
            is: CustomDataTable 
        });
        document.body.appendChild(element);

        const loadMoreHandler = jest.fn();
        element.addEventListener('loadmore', loadMoreHandler);

        const datatable = element.shadowRoot.querySelector('lightning-datatable');
        const mockTarget = { isLoading: false };
        datatable.dispatchEvent(new CustomEvent('loadmore', {
            detail: {
                target: mockTarget 
            }
        }));

        expect(loadMoreHandler).toHaveBeenCalledTimes(1);
        expect(loadMoreHandler.mock.calls[0][0].detail.target).toBe(mockTarget);
    });

    it('should dispatch evt "rowAction"', () => {
        const element = createElement('c-custom-data-table', {
            is: CustomDataTable
        });
        document.body.appendChild(element);

        const rowActionHandler = jest.fn();
        element.addEventListener('rowaction', rowActionHandler);

        const datatable = element.shadowRoot.querySelector('lightning-datatable');
        const mockDetail = {
            action: {name: 'view_details'},
            row: { Id: '123' },
        };
        datatable.dispatchEvent(new CustomEvent('rowaction', {
            detail: mockDetail
        }));

        expect(rowActionHandler).toHaveBeenCalledTimes(1);
        expect(rowActionHandler.mock.calls[0][0].detail).toBe(mockDetail);
    });
});