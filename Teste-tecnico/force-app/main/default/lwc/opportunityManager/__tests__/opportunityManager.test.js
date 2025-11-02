import { createElement } from 'lwc';
import OpportunityManager from 'c/opportunityManager';
import getOpportunities from '@salesforce/apex/OpportunityController.getOpportunities';
import closeOpportunity from '@salesforce/apex/OpportunityController.closeOpportunity';
import { mockShowToastEvent } from 'lightning/platformShowToastEvent';
import { navigateMock } from 'lightning/navigation';


const mockGetOppsResult1 = {
    records: [
        { Id: '00600000001ASJDHNA', Name: 'Opp 1', StageName: 'Prospecting', Account: { Name: 'Teste 1' } }
    ],
    totalRecords: 100
};
const mockGetOppsResult2 = {
    records: [
        { Id: '00600000002', Name: 'Opp 2', StageName: 'Qualification', Account: { Name: 'Teste 2' } }
    ],
    totalRecords: 100
};
const mockSearchResult = {
    records: [
        { Id: '00600000003', Name: 'Search Opp', StageName: 'Prospecting', Account: { Name: 'Teste 3' } }
    ],
    totalRecords: 1
};

async function flushPromises() {
    return Promise.resolve();
}

describe('c-opportunity-manager', () => {

    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
        jest.clearAllMocks();
    });

    it('should load initial opportunities', async () => {
        getOpportunities.mockResolvedValue(mockGetOppsResult1);
        
        const element = createElement('c-opportunity-manager', { is: OpportunityManager });
        document.body.appendChild(element);

        await flushPromises();

        expect(getOpportunities).toHaveBeenCalledTimes(1);

        const dataTable = element.shadowRoot.querySelector('c-custom-data-table');
        expect(dataTable).not.toBeNull();
        expect(dataTable.records.length).toBe(1);
        expect(dataTable.records[0].AccountName).toBe('Teste 1');
    });

    it('should load more data when loadmore evt', async () => {
        getOpportunities.mockResolvedValue(mockGetOppsResult1);
        const element = createElement('c-opportunity-manager', { is: OpportunityManager });
        document.body.appendChild(element);
        await flushPromises();

        getOpportunities.mockResolvedValue(mockGetOppsResult2);

        const dataTable = element.shadowRoot.querySelector('c-custom-data-table');
        dataTable.dispatchEvent(new CustomEvent('loadmore'));
        await flushPromises();

        expect(getOpportunities).toHaveBeenCalledTimes(2);

        expect(dataTable.records.length).toBe(2);
        expect(dataTable.records[0].Name).toBe('Opp 1');
        expect(dataTable.records[1].Name).toBe('Opp 2');
    });

    it('should find data when evt search', async () => {
        getOpportunities.mockResolvedValue(mockGetOppsResult1);
        const element = createElement('c-opportunity-manager', { is: OpportunityManager });
        document.body.appendChild(element);
        await flushPromises();

        getOpportunities.mockClear();
        getOpportunities.mockResolvedValue(mockSearchResult);

        const searchBar = element.shadowRoot.querySelector('c-search-bar');
        searchBar.dispatchEvent(new CustomEvent('search', {
            detail: { value: 'Teste 3' } 
        }));
        await flushPromises();

        expect(getOpportunities).toHaveBeenCalledTimes(1);
        const dataTable = element.shadowRoot.querySelector('c-custom-data-table');
        expect(dataTable.records.length).toBe(1);
        expect(dataTable.records[0].Name).toBe('Search Opp');
    });

    it('should navigate when rowaction evt is fired', async () => {
      	getOpportunities.mockResolvedValue(mockGetOppsResult1);
      	const element = createElement('c-opportunity-manager', { is: OpportunityManager });
      	document.body.appendChild(element);
      	await flushPromises();

        navigateMock.mockClear();

      	const dataTable = element.shadowRoot.querySelector('c-custom-data-table');
        const mockRowAction = {
            action: { name: 'view_details' },
            row: { Id: '00600000001ASJDHNA' }
        };
      	dataTable.dispatchEvent(new CustomEvent('rowaction', {
          	detail: mockRowAction
      	}));
        
      	expect(navigateMock).toHaveBeenCalledTimes(1);
      	expect(navigateMock).toHaveBeenCalledWith({
          	type: 'standard__recordPage',
          	attributes: {
              	recordId: '00600000001ASJDHNA',
              	objectApiName: 'Opportunity',
              	actionName: 'view'
          	}
      	});
  	});


    it('should close opp, show toast, and refresh list when "mark_as_closed" action', async () => {
        getOpportunities.mockResolvedValue(mockGetOppsResult1);
        const element = createElement('c-opportunity-manager', { is: OpportunityManager });
        document.body.appendChild(element);
        await flushPromises();

        closeOpportunity.mockResolvedValue(); 
        getOpportunities.mockClear(); 
        getOpportunities.mockResolvedValue(mockSearchResult); 

        const dataTable = element.shadowRoot.querySelector('c-custom-data-table');
        const mockRowAction = {
                action: { name: 'mark_as_closed' },
                row: { Id: '00600000001' }
        };
        dataTable.dispatchEvent(new CustomEvent('rowaction', { detail: mockRowAction }));
        await flushPromises();

        expect(closeOpportunity).toHaveBeenCalledTimes(1);
        expect(closeOpportunity).toHaveBeenCalledWith({ opportunityId: '00600000001' });

        expect(mockShowToastEvent).toHaveBeenCalledTimes(1);
        expect(mockShowToastEvent.mock.calls[0][0].variant).toBe('success');

        expect(getOpportunities).toHaveBeenCalledTimes(1);
        expect(dataTable.records.length).toBe(1);
        expect(dataTable.records[0].Name).toBe('Search Opp');
    });

    it('should show error toast when closeOpportunity fails', async () => {
        getOpportunities.mockResolvedValue(mockGetOppsResult1);
        const element = createElement('c-opportunity-manager', { is: OpportunityManager });
        document.body.appendChild(element);
        await flushPromises();
        const mockError = { body: { message: 'DML Failed' } };
        closeOpportunity.mockRejectedValue(mockError);
        getOpportunities.mockClear();
        mockShowToastEvent.mockClear();
        const dataTable = element.shadowRoot.querySelector('c-custom-data-table');
        const mockRowAction = {
                action: { name: 'mark_as_closed' },
                row: { Id: '00600000001ASJDHNA' }
        };
        dataTable.dispatchEvent(new CustomEvent('rowaction', { detail: mockRowAction }));
        await flushPromises(); 

        expect(closeOpportunity).toHaveBeenCalledTimes(1);
        expect(mockShowToastEvent).toHaveBeenCalledTimes(1);
        expect(getOpportunities).not.toHaveBeenCalled();
    });
});
