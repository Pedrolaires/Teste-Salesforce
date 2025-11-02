@isTest
public with sharing class OpportunityControllerTest {

    @TestSetup
    static void makeData(){
        Account acc1 = new Account(Name = 'Conta teste 1') ;
        Account acc2 = new Account(Name = 'Conta teste 2');
        insert new List<SObject>{acc1,acc2};

        insert  new List<SObject>{
           new Opportunity(
                Name = 'Oportunidade teste 1',
                AccountId = acc1.Id,
                StageName = 'Prospecting',
                CloseDate = Date.today().addDays(30),
                Amount = 10000
            ),
            new Opportunity(
                Name = 'Oportunidade teste 2',
                AccountId = acc1.Id,
                StageName = 'Qualification',
                CloseDate = Date.today().addDays(60),
                Amount = 50000
            ),
            new Opportunity(
                Name = 'Oportunidade teste 3',
                AccountId = acc2.Id,
                StageName = 'Prospecting',
                CloseDate = Date.today().addDays(45),
                Amount = 25000
            )
        };
    }


    @isTest
    static void shouldLoadAllOpportunities() {
        Test.startTest();
        OpportunityController.ResponseDataDTO result = OpportunityController.getOpportunities('', 50,0, 1L);
        Test.stopTest();
        System.assertEquals(3, result.totalRecords, 'Deve haver todas as oportunidades inseridas no makeData');
        System.assertEquals(3, result.records.size(), 'A quantidade de oportunidades deve ser 3');
    }


    @isTest
    static void shouldPaginateOpportunities() {
        Test.startTest();
        OpportunityController.ResponseDataDTO result = OpportunityController.getOpportunities('', 1, 1, 1L);
        Test.stopTest();

        System.assertEquals(3, result.totalRecords, 'Total de registros deve ser 3');
        System.assertEquals(1, result.records.size(), 'Tamanho da lista paginada deve ser 1');
    }
}