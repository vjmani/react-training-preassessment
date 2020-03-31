import $ from 'jquery';
import { ACCOUNT_DATA } from './../mock-data';

const getAccounts = () => {
    return ACCOUNT_DATA;
};

const loadTableData = (accountData) => {
    let row = '';
    accountData.map((data) => {
        const tempRow = `<tr><td>${data.accountName}</td>
        <td>$${data.marketValue.toFixed(2)}</td>
        <td>$${data.cash.toFixed(2)}</td>
        <td><span class="chart-legend legend-${data.legend}"><span></td>
        </tr>`;

        row += tempRow;
    });
    
    return row;
}

const getTotalToDisplay = (accountData, valueKey) => {
    const totalvalue = accountData.reduce((acc, current) => {
        return acc + current[valueKey];
    }, 0);

    return totalvalue.toFixed(2);
}

const isValidField = (formField) => {
    const fieldValue = $(formField).val();
    return fieldValue || false;
}

export { getAccounts, loadTableData, getTotalToDisplay, isValidField };
