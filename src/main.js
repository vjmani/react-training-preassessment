import 'bootstrap';
import './scss/app.scss';
import $ from 'jquery';
import * as account from './modules/accounts';

(function($) {

    const accounts = account.getAccounts();    

    // To display table on load
    const loadTable = (accountData) => {
        const tableRows = account.loadTableData(accountData);
        $('#account-table tbody').html(tableRows);
    }
    
    // To show totale value on table
    const showTotalValues = (accountData) => {
        const totalmarketValue = account.getTotalToDisplay(accountData, 'marketValue');
        const totalCash = account.getTotalToDisplay(accountData, 'cash');
        $('#account-table tfoot #total-market-value').html(`$${totalmarketValue}`);
        $('#account-table tfoot #total-cash').html(`$${totalCash}`);
    }
    
    loadTable(accounts);
    showTotalValues(accounts);

    // Form submission
    $('#add-account-form').click(() => {        
        $('.account-form-error').hide();
        const accountNameEntered = account.isValidField($('#add-account-form #accountName'));
        const marketValueEntered = account.isValidField($('#add-account-form #marketValue'));
        const cashEntered = account.isValidField($('#add-account-form #cash'));
        if (accountNameEntered && marketValueEntered && cashEntered) {            
            const newAccount = {
                accountName: accountNameEntered,
                marketValue: Number(marketValueEntered),
                cash: Number(cashEntered),
                legend: 1
            }

            // Hide modal on successfull form submit            
            $('#accounFormModal').modal('hide');

            // Creating new account on Run time, since there is no server
            accounts.push(newAccount);
            loadTable(accounts);
            showTotalValues(accounts);
        } else {
            $('.account-form-error').show();
        }
    })
})($);

