import { LightningElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getOpportunities from '@salesforce/apex/OpportunityController.getOpportunities';
import closeOpportunity from '@salesforce/apex/OpportunityController.closeOpportunity';

const RECORD_LIMIT_PER_BATCH = 50;

const COLUMNS_DEF = [
    { label: 'Opportunity Name', fieldName: 'Name', type: 'text' },
    { label: 'Account', fieldName: 'AccountName', type: 'text' },
    { label: 'Stage', fieldName: 'StageName', type: 'text' },
    { label: 'Amount', fieldName: 'Amount', type: 'currency' },
    { label: 'Close Date', fieldName: 'CloseDate', type: 'date-local' },
    { type: 'action', typeAttributes: { rowActions: {fieldName: 'availableActions'},menuAlignment: 'right'}},
];



export default class OpportunityManager extends NavigationMixin(LightningElement) {
    columns = COLUMNS_DEF;
    opportunities = []; 
    offset = 0;
    totalRecords = 0;
    searchText = '';
    isLoading = false;
    loadMoreStatus = '';
    lastRefreshTime = new Date().getTime();

    connectedCallback() {
        this.loadOpportunities();
    }
    get processedOpportunities() {
        if (!this.opportunities) {
            return [];
        }

        return this.opportunities.map(opp => {
            const actions = [
                { label: 'Ver Mais', name: 'view_details' }
            ];

            if (opp.StageName !== 'Closed Won' && opp.StageName !== 'Closed Lost') 
                actions.push({ label: 'Marcar como fechada', name: 'mark_as_closed' });
            

            return {
                ...opp,
                availableActions: actions
            };
        });
    }

    handleLoadMoreData(event) {
        const table = event?.detail?.target;

        if (this.opportunities.length >= this.totalRecords) {
            if (table) 
                table.enableInfiniteLoading = false;
            return;
        }
        this.loadOpportunities();
    }

    handleRowAction(evt) {
        const actionName = evt.detail.action.name;
        const row = evt.detail.row;
        switch (actionName) {
            case 'view_details':
                this.navigateToOppRecord(row.Id);
                break;
            case 'mark_as_closed':
                this.handleCloseOpportunity(row.Id);
                break;
            default:
                console.error('Ação nãop encontrada:', actionName);
        }
    }


    navigateToOppRecord(oppId) {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: oppId,
                objectApiName: 'Opportunity',
                actionName: 'view'
            }
        });
    }

    handleSearch(event) {
        const searchKey = event.detail.value;
        if (this.searchText === searchKey)
            return;
        
        this.searchText = searchKey;
        this.opportunities = [];
        this.offset = 0;
        this.totalRecords = 0;

        this.loadOpportunities();
    }

    showErrorToast(error) {
        const message = error?.body?.message;
        
        const evt = new ShowToastEvent({
            title: 'Erro na Operação',
            message: message,
            variant: 'error',
            mode: 'sticky'
        });
        this.dispatchEvent(evt);
    
    }

    async loadOpportunities() {
        if (this.isLoading) return;

        this.isLoading = true;
        try {
            const result = await getOpportunities({ 
                search: this.searchText,
                limitSize: RECORD_LIMIT_PER_BATCH,
                offset: this.offset,
                clearCache: this.lastRefreshTime,
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
            this.loadMoreStatus = 'Erro ao carregar dados.';
            this.showErrorToast(error);
        } finally {
            this.isLoading = false;
        }
    }

    async handleCloseOpportunity(oppId) {
        try {
            await closeOpportunity({ opportunityId: oppId });

            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Sucesso',
                    message: 'Oportunidade marcada como "Closed Won".',
                    variant: 'success'
                })
            );
            this.lastRefreshTime = new Date().getTime();
            this.opportunities = [];
            this.offset = 0;
            this.totalRecords = 0;
            this.loadOpportunities();

        } catch (error) {
            this.showErrorToast(error);
            this.isLoading = false;
        }
    }
}