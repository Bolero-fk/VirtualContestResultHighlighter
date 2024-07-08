// ==UserScript==
// @name         Virtual Contest Result Highlighter
// @namespace    https://kenkoooo.com/atcoder/
// @version      0.1
// @description  Highlights problem rows in AtCoder Problems' Virtual Contests based on results.
// @author       Bolero
// @match        https://kenkoooo.com/atcoder/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const Config = {
        ResultType: {
            AC: 'AC',
            WA: 'WA',
            None: 'None',
        },
        TabType: {
            Problems: 'Problems',
            Standings: 'Standings',
        },
        Colors: {
            AC: '#9AD59E',
            WA: '#FFDD99',
            None: 'transparent',
        },
        Selectors: {
            ProblemsTable: 'table.table-sm.table-bordered.table-striped',
        },
        SVGFillColors: {
            AC: '#43A047',
        },
        ProblemTableColumnLength: 3
    };

    function getResultColor(resultType) {
        return Config.Colors[resultType] || Config.Colors.None;
    }

    function isContestPage() {
        return window.location.hash.startsWith('#/contest/show/');
    }

    function getActiveTab() {
        const hash = window.location.hash;
        const urlParams = new URLSearchParams(hash.split('?')[1]);
        return urlParams.get('activeTab');
    }

    function getResultInProblemsTab(row) {
        const cells = row.querySelectorAll('td');
        if (cells.length !== Config.ProblemTableColumnLength) {
            return Config.ResultType.None;
        }

        const resultCell = cells[Config.ProblemTableColumnLength - 1];
        const svg = resultCell.querySelector('svg');
        if (!svg) {
            return Config.ResultType.None;
        }

        const polygon = svg.querySelector('polygon');
        if (polygon) {
            if (polygon.getAttribute('fill') === Config.SVGFillColors.AC) {
                return Config.ResultType.AC;
            } else {
                return Config.ResultType.WA;
            }
        }

        return Config.ResultType.None;
    }

    function colorizeProblemsRows() {
        const problemsTable = document.querySelector(Config.Selectors.ProblemsTable);
        if (problemsTable) {
            const rows = problemsTable.querySelectorAll('tbody tr');
            rows.forEach((row) => {
                const problemResult = getResultInProblemsTab(row);
                if (problemResult && problemResult != Config.ResultType.None) {
                    row.style.backgroundColor = getResultColor(problemResult);
                }
            });
        }
    }

    function observePageChanges() {
        const targetNode = document.body;
        const config = { childList: true, subtree: true };

        const callback = function (mutationsList, observer) {
            const activeTab = getActiveTab();

            if (activeTab === Config.TabType.Problems) {
                colorizeProblemsRows();
            }
            else if (activeTab === Config.TabType.Standings) {
            }
        };

        const observer = new MutationObserver(callback);
        observer.observe(targetNode, config);
    }

    if (isContestPage()) {
        observePageChanges();
    }
})();
