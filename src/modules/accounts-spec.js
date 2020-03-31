import * as account from './accounts';
import { ACCOUNT_DATA } from './../mock-data';

describe('Accounts', () => {
    it('should get account data', () => {
        const accounts = account.getAccounts(); 
        expect(accounts).toEqual(ACCOUNT_DATA);
    });

    it('should load table data', () => {
        const tableRows = account.loadTableData(ACCOUNT_DATA); 
        expect(tableRows.length).toBeGreaterThan(0);
    });

    it('should return total value of given property', () => {
        const totalMarketValue = account.getTotalToDisplay(ACCOUNT_DATA, 'marketValue'); 
        expect(Number(totalMarketValue)).toEqual(6725825870.33);
    });
 });