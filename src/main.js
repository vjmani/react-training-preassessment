import 'bootstrap';
import './scss/app.scss';
import $ from 'jquery';
import * as account from './modules/accounts';

(function ($) {

    const species = new Set();
    const gender = new Set();
    const origin = new Set();
    let isDataFiltered = false;

    const resultApi = 'https://rickandmortyapi.com/api/character/';

    $(document).ready(function () {
        $('#search-by-name-form').on('submit', function (e) {
            e.preventDefault();
            const searchKeyWord = $('#search-by-name').val();
            serachByName(searchKeyWord);
        });

        $('#sort-by').on('change', function () {
            const sortingOrder = $('#sort-by').val();
            sortResults(sortingOrder);
        });
    })

    // Get data from the service
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

        //[TODO] Redux store can be used to save the app state
        setDataToLocalStorage('originalData', resultData);
        getCheckedFilters();

    }

    getResults();

    const setUIdata = (data) => {
        const res = {};
        res['card'] = data;
        data.map((item) => {
            res['filters'] = addFilters(item);
        });
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
                    <label for="${property}-${filter}">
                        <input class="filter-checkbox" type="checkbox" name="${property}" value="${filter}" id="${property}-${filter}" /> ${filter}
                    </label>
                `);
            });

        }
    }

    const populateCardData = (items) => {
        const cards = $('.search-results');
        cards.html('');
        if (items.length > 0) {
            items.map((item) => {
                const createdYear = new Date(item.created).getFullYear();
                const currentYear = new Date().getFullYear();
                const yearDiff = currentYear - createdYear;
                cards.append(`
                    <div class="col-lg-3 col-6">
                        <div class="result-card">
                            <figure>
                                <img class="responsive-img" src="${item.image}" alt="${item.name}">
                                <figcaption>
                                    <h3>${item.name}</h3>
                                    <div class="small-font">id: <span>${item.id}</span> - created <span>${yearDiff} years ago</span></div>
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
        } else {
            cards.append(`
                    <div class="col-lg-12">
                        <div class="result-card">
                            <h4>No Result Found</h4>
                        <div>
                    </div>
                `);
        }

    }

    const getCheckedFilters = () => {

        const filterCheckBox = $('.filter-checkbox');
        let selectedFilters = {};
        let resultdata = getDataFromLocalStorage('originalData');

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
                const searchResults = filterSearchResults(resultdata, checkedFilters);

                //[TODO] Redux store can be used instead
                setDataToLocalStorage('filteredData', searchResults);
                setDataToLocalStorage('selectedFilters', checkedFilters);

                isDataFiltered = true;
                populateCardData(searchResults);
                populateAppliedFilter(checkedFilters);

            } else {
                selectedFilters = {};
                const searchResults = filterSearchResults(resultdata, {});

                //[TODO] Redux store can be used instead
                setDataToLocalStorage('filteredData', searchResults);
                setDataToLocalStorage('selectedFilters', {});

                isDataFiltered = false;
                populateCardData(searchResults);
                populateAppliedFilter({});
            }

        });
    }

    const checkValue = value => (typeof value === 'string' ? value.toUpperCase() : value);

    const filterSearchResults = (data, filters) => {
        const filterKeys = Object.keys(filters);
        return data.filter(item => {
            return filterKeys.every(key => {
                if (!filters[key].length) return true;
                return filters[key].find((filter) => {
                    if (typeof item[key] === 'object') {
                        return checkValue(filter) === checkValue(item[key]['name']);
                    } else {
                        return checkValue(filter) === checkValue(item[key])
                    }
                });
            });
        });
    }


    const serachByName = (name) => {
        let results = isDataFiltered ? getDataFromLocalStorage('filteredData') : getDataFromLocalStorage('originalData');
        const serachResults = results.filter((res) => {
            const regx = new RegExp(name.toLowerCase());
            const resNameCheck = res.name.toLowerCase().match(regx);
            return resNameCheck !== null;
        });

        populateCardData(serachResults);
    }

    const sortResults = (order) => {
        let results = isDataFiltered ? getDataFromLocalStorage('filteredData') : getDataFromLocalStorage('originalData');
        if (order === 'asc') {
            results.sort((a, b) => {
                return a.id - b.id;
            });
        } else if (order === "desc") {
            results.sort((a, b) => {
                return b.id - a.id;
            });
        }

        populateCardData(results);
    }

    const setDataToLocalStorage = (keyName, data) => {
        localStorage.setItem(keyName, JSON.stringify(data));
    }

    const getDataFromLocalStorage = (keyName) => {
        return JSON.parse(localStorage.getItem(keyName));
    }

    const populateAppliedFilter = (filters) => {
        const filterKeys = Object.keys(filters);
        $('.selected-filters').html('');
        if (filterKeys.length > 0) {
            for (let filter in filters) {
                filters[filter].map((filterName) => {
                    $('.selected-filters').append(`
                        <div class="col-lg-2 col-4 applied-filter-container">
                            <div class="applied-filter">
                                <span>${filterName}</span>
                            </div>
                        </div>
                    `);
                });
            }
        }
    }

})($);

