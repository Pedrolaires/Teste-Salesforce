public with sharing class OpportunityController {

    private static final Integer DEFAULT_LIMIT = 50;
    private static final Integer MAX_LIMIT = 100;
    private static final Integer DEFAULT_OFFSET = 0;

    @AuraEnabled(cacheable=true)
    public static ResponseDataDTO getOpportunities(String search, Integer limitSize, Integer offset) {
        try {
            String whereQuery = '';
            String selecQuery = 'SELECT Id, Name, StageName, Amount, CloseDate, Account.Name FROM Opportunity';
            String countQuery = 'SELECT COUNT() FROM Opportunity';

            Integer effectiveLimit = (limitSize == null || limitSize <= 0) ? DEFAULT_LIMIT : limitSize;
            Integer effectiveOffset = (offset == null || offset < 0) ? DEFAULT_OFFSET : offset;
            System.debug('selecQuery: ' + selecQuery);
            System.debug('countQuery: ' + countQuery);
            System.debug('effectiveLimit: ' + effectiveLimit);
            System.debug('effectiveOffset: ' + effectiveOffset);
            System.debug('whereQuery: ' + whereQuery);
            System.debug('search: ' + search);
            if (String.isNotBlank(search)) {
                String safeQuery = '%' + String.escapeSingleQuotes(search) + '%';
                whereQuery = ' WHERE Account.Name LIKE :safeQuery';
            }

            selecQuery += whereQuery +' ORDER BY Name ASC LIMIT :effectiveLimit OFFSET :effectiveOffset';
            countQuery += whereQuery;
            
            List<Opportunity> records = Database.query(selecQuery);
            Integer totalRecords = Database.countQuery(countQuery);
            
            return new ResponseDataDTO(records, totalRecords);
        }catch (QueryException e){
            System.debug('Erro na query: ' + e.getMessage());
            throw new AuraHandledException('Erro na query: ' + e.getMessage());
        }catch (Exception e) {
            System.debug('Erro no apex: ' + e.getMessage());
            throw new AuraHandledException('Erro no Apex: ' + e.getMessage() + ' (Linha: ' + e.getLineNumber() + ')');
        }
    }

    public class ResponseDataDTO {
        @AuraEnabled public List<Opportunity> records;
        @AuraEnabled public Integer totalRecords;

        public ResponseDataDTO(List<Opportunity> records, Integer totalRecords) {
            this.records = records;
            this.totalRecords = totalRecords;
        }
    }
}