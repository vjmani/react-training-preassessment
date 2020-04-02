import 'bootstrap';
import './scss/app.scss';
import $ from 'jquery';
import * as account from './modules/accounts';

(function ($) {

    const species = new Set();
    const gender = new Set();
    const origin = new Set();

    const resultApi = 'https://rickandmortyapi.com/api/character/';

    async function getResults() {

        const promise = new Promise((resolve, reject) => {
            $.get(resultApi, function (data) {
                if (data && data.results) {
                    resolve(setUIdata(data.results));
                } else {
                    reject('Something Went Wrong.');
                }
            });
        });

        const result = await promise;
        const resultData = result.card;
        const filters = {
            species: [...result.filters.species],
            gender: [...result.filters.gender],
            origin: [...result.filters.origin]
        }

        populateFilters(filters);

        populateCardData(resultData);

        getCheckedFilters(resultData);
    }

    getResults();

    const setUIdata = (data) => {
        const res = {};
        res['card'] = data;
        data.map((item) => {
            res['filters'] = addFilters(item);
        });
        console.log(res);
        return res;
    }

    const addFilters = (item) => {
        species.add(item.species);
        gender.add(item.gender);
        origin.add(item.origin.name);

        return {
            species,
            gender,
            origin
        };
    }

    const populateFilters = (filters) => {
        const filterForm = $('#filter-form');
        filterForm.html('');
        for (const property in filters) {
            console.log(`${property}: ${filters[property]}`);

            filterForm.append(`
                <div class="col-lg-12 col-12 filter-box">
                    <h2>${property}</h2>
                    <div class="filter-box-section" id="${property}-filter">
                        <!-- Filter checkboxes will be displayed here -->
                    </div>
                </div>
            `);

            const filterType = '#' + property + '-filter';
            const filterTypeElem = $(filterType);

            filters[property].map((filter) => {
                $(filterTypeElem).append(`
                    <label for="${filter}">
                        <input class="filter-checkbox" type="checkbox" name="${property}" value="${filter}" id="${filter}" /> ${filter}
                    </label>
                `);
            });

        }
    }

    const populateCardData = (items) => {
        const cards = $('.search-results');
        cards.html('');
        items.map((item) => {
            cards.append(`
                <div class="col-lg-3 col-6">
                    <div class="result-card">
                        <figure>
                            <img class="responsive-img" src="${item.image}" alt="${item.name}">
                            <figcaption>
                                <h3>${item.name}</h3>
                                <div class="small-font">id: <span>${item.id}</span> - created <span>2 years ago</span></div>
                            </figcaption>
                        </figure>
                        <div class="result-card-details small-font">
                            <div class="result-attribute">
                                <span class="result-attribute-name">STATUS</span>
                                <span class="result-attribute-data">${item.status}</span>
                            </div>
                            <div class="result-attribute">
                                <span class="result-attribute-name">SPECIES</span>
                                <span class="result-attribute-data">${item.species}</span>
                            </div>
                            <div class="result-attribute">
                                <span class="result-attribute-name">GENDER</span>
                                <span class="result-attribute-data">${item.gender}</span>
                            </div>
                            <div class="result-attribute">
                                <span class="result-attribute-name">ORIGIN</span>
                                <span class="result-attribute-data">${item.origin.name}</span>
                            </div>
                            <div class="result-attribute">
                                <span class="result-attribute-name">LAST LOCATION</span>
                                <span class="result-attribute-data">${item.location.name}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `);
        });
    }

    const getCheckedFilters = (resultData) => {

        const filterCheckBox = $('.filter-checkbox');
        let selectedFilters = {};

        filterCheckBox.on('change', async function () {

            if (filterCheckBox.filter(':checked').length != 0) {
                const promise = new Promise((resolve, reject) => {
                    filterCheckBox.filter(':checked').each(() => {

                        if (!selectedFilters.hasOwnProperty(this.name)) {
                            selectedFilters[this.name] = new Set();
                        }

                        if (this.checked) {
                            selectedFilters[this.name].add(this.value);
                        } else if (selectedFilters[this.name].has(this.value)) {
                            selectedFilters[this.name].delete(this.value);
                        }

                        if (selectedFilters[this.name].size === 0) {
                            delete selectedFilters[this.name];
                        }

                        resolve(selectedFilters);

                    });
                });

                const filters = await promise;
                const checkedFilters = {};
                for (let filter in filters) {
                    checkedFilters[filter] = [...filters[filter]];
                }

                console.log(checkedFilters);
                filterSearchResults(checkedFilters, 'checkbox', resultData);

            } else {
                selectedFilters = {};
            }

        });
    }

    const filterSearchResults = (filters, type, resultdata) => {
        let filteredData = [];
        if (type === 'checkbox') {
            resultdata.map((data) => {
                for (let filterName in filters) {
                    filters[filterName].map((filter) => {
                        if (filter === data[filterName]) {
                            filteredData.push(data);
                        } else if(data[filterName]['name'] && filter === data[filterName]['name']) {
                            filteredData.push(data);
                        }
                    });
                }
            });
        }

        console.log(filteredData);

    }

})($);

