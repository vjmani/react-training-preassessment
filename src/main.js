import 'bootstrap';
import './scss/app.scss';
import $ from 'jquery';
import * as filter from './modules/filters';
import * as util from './modules/utility';

(function ($) {

    let isDataFiltered = false;

    $(document).ready(function () {
        
        $('#clear-search-btn').hide();
        $('#search-by-name-form').on('submit', function (e) {
            e.preventDefault();
            const searchKeyWord = $('#search-by-name').val();
            serachByName(searchKeyWord);
            $('#clear-search-btn').show();
        });

        $('#sort-by').on('change', function () {
            const sortingOrder = $('#sort-by').val();
            sortResults(sortingOrder);
        });

        $('#clear-search-btn').on('click', function(e) {
            e.preventDefault();
            let resultData = [];

            if(!isDataFiltered) {
                resultData = util.getDataFromLocalStorage('originalData');
            } else {
                resultData = util.getDataFromLocalStorage('filteredData');
            }

            $('#search-by-name').val('');
            populateCardData(resultData);            
            $('#clear-search-btn').hide();
        })
    })

    // Get data from the service
    async function getResults() {

        const promise = new Promise((resolve, reject) => {
            $.get(util.resultApi, function (data) {
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

        filter.populateFilters(filters);

        populateCardData(resultData);

        //[TODO] Redux store can be used to save the app state
        util.setDataToLocalStorage('originalData', resultData);
        getCheckedFilters();

    }

    getResults();

    const setUIdata = (data) => {
        const res = {};
        res['card'] = data;
        data.map((item) => {
            res['filters'] = filter.addFilters(item);
        });
        return res;
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
        let resultdata = util.getDataFromLocalStorage('originalData');

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
                const searchResults = filter.filterSearchResults(resultdata, checkedFilters);

                //[TODO] Redux store can be used instead
                util.setDataToLocalStorage('filteredData', searchResults);
                util.setDataToLocalStorage('selectedFilters', checkedFilters);

                isDataFiltered = true;
                populateCardData(searchResults);
                filter.populateAppliedFilter(checkedFilters);

            } else {
                selectedFilters = {};
                const searchResults = filter.filterSearchResults(resultdata, {});

                //[TODO] Redux store can be used instead
                util.setDataToLocalStorage('filteredData', searchResults);
                util.setDataToLocalStorage('selectedFilters', {});

                isDataFiltered = false;
                populateCardData(searchResults);
                filter.populateAppliedFilter({});
            }

        });
    }

    const serachByName = (name) => {
        let results = isDataFiltered ? util.getDataFromLocalStorage('filteredData') : util.getDataFromLocalStorage('originalData');
        const serachResults = results.filter((res) => {
            const regx = new RegExp(name.toLowerCase());
            const resNameCheck = res.name.toLowerCase().match(regx);
            return resNameCheck !== null;
        });

        populateCardData(serachResults);
    }

    const sortResults = (order) => {
        let results = isDataFiltered ? util.getDataFromLocalStorage('filteredData') : util.getDataFromLocalStorage('originalData');
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

})($);

