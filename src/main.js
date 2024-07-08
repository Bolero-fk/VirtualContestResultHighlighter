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
        SVGFillColors: {
            AC: '#43A047',
        },
        ProblemTableColumnLength: 3,
        TableSelector: 'table.table-sm.table-bordered.table-striped',
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
        const problemsTable = document.querySelector(Config.TableSelector);
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

    function getResultInStandingsTab(cell) {
        const problemStatuses = cell.querySelectorAll('p');
        if (problemStatuses.length == 1) {
            return Config.ResultType.None
        }
        else if (problemStatuses.length == 2) {
            if (problemStatuses[1].innerText === '-') {
                return Config.ResultType.WA;
            }
            else {
                return Config.ResultType.AC;
            }
        }

        return Config.ResultType.None;
    }

    function colorizeStandingsRows() {
        const standingsTable = document.querySelector(Config.TableSelector);
        if (!standingsTable) {
            return;
        }

        const rows = standingsTable.querySelectorAll('tbody tr');
        rows.forEach((row, index) => {
            // 最後の行は最速AC者用の行なので飛ばす
            if (index == rows.length - 1) { return; }

            const cells = row.querySelectorAll('td');
            cells.forEach((cell, index) => {
                // 最初のセルは総スコアなので飛ばす
                if (index == 0) { return; }
                const problemResult = getResultInStandingsTab(cell);
                if (problemResult && problemResult != Config.ResultType.None) {
                    cell.style.backgroundColor = getResultColor(problemResult);
                }
            });
        });
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
                colorizeStandingsRows();
            }
        };

        const observer = new MutationObserver(callback);
        observer.observe(targetNode, config);
    }

    if (isContestPage()) {
        observePageChanges();
    }
})();
