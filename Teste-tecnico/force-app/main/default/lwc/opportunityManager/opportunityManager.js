import { LightningElement } from 'lwc'; 
import getOpportunities from '@salesforce/apex/OpportunityController.getOpportunities';

const RECORD_LIMIT_PER_BATCH = 50;

const COLUMNS_DEF = [
    { label: 'Opportunity Name', fieldName: 'Name', type: 'text' },
    { label: 'Account', fieldName: 'AccountName', type: 'text' },
    { label: 'Stage', fieldName: 'StageName', type: 'text' },
    { label: 'Amount', fieldName: 'Amount', type: 'currency' },
    { label: 'Close Date', fieldName: 'CloseDate', type: 'date-local' }
];

export default class OpportunityManager extends LightningElement {
    columns = COLUMNS_DEF;
    opportunities = []; 
    offset = 0;
    totalRecords = 0;
    searchText = '';
    isLoading = false;
    

    connectedCallback() {
        this.loadOpportunities();
    }

    handleLoadMoreData(event) {
        const table = event?.detail?.target;

        if (this.opportunities.length >= this.totalRecords) {
            if (table) {
                table.enableInfiniteLoading = false;
            }
            return;
        }

        this.loadOpportunities(table);
    }

    async loadOpportunities(table) {
        if (this.isLoading) return;

        this.isLoading = true;
        try {
            const result = await getOpportunities({ 
                search: this.searchText,
                limitSize: RECORD_LIMIT_PER_BATCH,
                offset: this.offset
            });

            const newData = result.records.map(opp => {
                return {
                    Id: opp.Id,
                    Name: opp.Name,
                    StageName: opp.StageName,
                    Amount: opp.Amount,
                    CloseDate: opp.CloseDate,
                    AccountName: opp.Account?.Name
                };
            });

            this.totalRecords = result.totalRecords;
            this.opportunities = [...this.opportunities, ...newData];
            this.offset = this.opportunities.length;

        } catch (error) {
            console.error('Erro ao buscar oportunidades:', error);
        } finally {
            this.isLoading = false;
        }
    }
}