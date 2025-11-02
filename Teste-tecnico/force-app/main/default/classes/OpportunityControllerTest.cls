@isTest
public with sharing class OpportunityControllerTest {

    @TestSetup
    public static void makeData(){
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
    public static void shouldLoadAllOpportunities() {
        Test.startTest();
        OpportunityController.ResponseDataDTO result = OpportunityController.getOpportunities('', 50,0, 1L);
        Test.stopTest();
        System.assertEquals(3, result.totalRecords, 'Deve haver todas as oportunidades inseridas no makeData');
        System.assertEquals(3, result.records.size(), 'A quantidade de oportunidades deve ser 3');
    }


    @isTest
    public static void shouldPaginateOpportunities() {
        Test.startTest();
        OpportunityController.ResponseDataDTO result = OpportunityController.getOpportunities('', 1, 1, 1L);
        Test.stopTest();

        System.assertEquals(3, result.totalRecords, 'Total de registros deve ser 3');
        System.assertEquals(1, result.records.size(), 'Tamanho da lista paginada deve ser 1');
    }

    @isTest
    public static void shouldCloseOpportunity(){
        Opportunity opp = [SELECT Id, StageName 
                           FROM Opportunity 
                           WHERE Name = 'Oportunidade teste 2' LIMIT 1];
        System.assertNotEquals('Closed Won', opp.StageName, 'Oportunidade já estava fechada antes do teste.');
        Test.startTest();
        OpportunityController.closeOpportunity(opp.Id);
        Test.stopTest();

        Opportunity updatedOpp = [SELECT StageName FROM Opportunity WHERE Id = :opp.Id];
        System.assertEquals('Closed Won', updatedOpp.StageName, 'O StageName deveria ter sido atualizado para \"Closed Won\"');
    }

    @isTest
    public static void shoudlSearchOpportunityByParameter(){
        Test.startTest();
        OpportunityController.ResponseDataDTO result = OpportunityController.getOpportunities(
            'Conta teste 1', 50, 0, null);
        Test.stopTest();
        System.assertEquals(2, result.totalRecords, 'A busca com pesquisa deve retornar 2 como total');
        System.assertEquals(2, result.records.size(), 'A busca com pesquisa deve retornar 2 como total de registros');
    }
}