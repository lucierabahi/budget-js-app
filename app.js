/* *** */
// BUDGET CONTROLLER MODULE
var budgetController = (function() {
    // Function constructor for the expenses data/objects
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentages = function() {
        return this.percentage;
    };

    // Function constructor for the income data/objects
    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(current) {
            sum += current.value;
        });
        data.totals[type] = sum;
    };

    // Data structure
    var data = {
        allItems: {
            exp: [],
            inc: [],
        },
        totals: {
            exp: 0,
            inc: 0,
        },
        budget: 0,
        percentage: -1,
    };

    // Public methods
    return {
        addItem: function(type, description, value) {
            var newItem, id;

            // Create new id
            if (data.allItems[type].length > 0) {
                id = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                id = 0;
            }

            // Create new item based on 'inc' or 'exp' type
            if (type === 'exp') {
                newItem = new Expense(id, description, value);
            } else if (type === 'inc') {
                newItem = new Income(id, description, value);
            }

            // Push it into the data structure
            data.allItems[type].push(newItem);

            // Return the new element
            return newItem;
        },

        deleteItem: function(type, id) {
            var ids, index;
            ids = data.allItems[type].map(function(current) {
                return current.id;
            });

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: function() {
            // 1. Calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            // 2. Calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            // 3. Calculate the percentage of income that was spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round(
                    (data.totals.exp / data.totals.inc) * 100
                );
            } else {
                data.percentage = -1;
            }
        },

        calculatePercentages: function() {
            data.allItems.exp.forEach(function(current) {
                current.calcPercentage(data.totals.inc);
            });
        },

        getPercentages: function() {
            var allPerc = data.allItems.exp.map(function(current) {
                return current.getPercentages();
            });
            return allPerc;
        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage,
            };
        },

        testing: function() {
            console.log(data);
        },
    };
})();

/* *** */
// UI CONTROLLER MODULE
var UIController = (function() {
    // DOM strings
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month',
    };

    var formatNumber = function(num, type) {
        var numSplit, int, dec;

        // Two decimals
        num = Math.abs(num);
        num = num.toFixed(2);

        // Add comma
        numSplit = num.split('.');

        int = numSplit[0];
        if (int.length > 3) {
            int =
                int.substr(0, int.length - 3) +
                ',' +
                int.substr(int.length - 3, 3);
        }

        dec = numSplit[1];

        // + or -    and return the number
        return (type === 'exp' ? '-' : '+') + int + '.' + dec;
    };

    var nodeListForEach = function(list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

    return {
        // Get user input
        getInput: function() {
            return {
                type: document.querySelector(DOMstrings.inputType).value, // will be either inc or exp
                description: document.querySelector(DOMstrings.inputDescription)
                    .value,
                value: parseFloat(
                    document.querySelector(DOMstrings.inputValue).value
                ),
            };
        },

        addListItem: function(object, type) {
            var html, newHtml, element;
            // Create HTML string with placeholder text
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;

                html =
                    '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix">      <div class="item__value">%value%</div><div class="item__delete">      <button class="item__delete--btn"><i class="ion-ios-close"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;

                html =
                    '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete">         <button class="item__delete--btn"><i class="ion-ios-close"></i></button></div></div></div>';
            }

            // Replace the placeholder text with actual data
            newHtml = html.replace('%id%', object.id);
            newHtml = newHtml.replace('%description%', object.description);
            newHtml = newHtml.replace(
                '%value%',
                formatNumber(object.value, type)
            );

            // Insert the HTML into the DOM
            document
                .querySelector(element)
                .insertAdjacentHTML('beforeend', newHtml);
        },

        deleteListItem: function(selectorID) {
            var element = document.getElementById(selectorID);
            element.parentNode.removeChild(element);
        },

        clearFields: function() {
            var fields, fieldsArray;

            fields = document.querySelectorAll(
                DOMstrings.inputDescription + ',' + DOMstrings.inputValue
            );

            fieldsArray = Array.prototype.slice.call(fields);

            fieldsArray.forEach(function(current, index, array) {
                current.value = '';
            });

            fieldsArray[0].focus();
        },

        displayBudget: function(object) {
            var type;
            object.budget > 0 ? (type = 'inc') : (type = 'exp');

            document.querySelector(
                DOMstrings.budgetLabel
            ).textContent = formatNumber(object.budget, type);
            document.querySelector(
                DOMstrings.incomeLabel
            ).textContent = formatNumber(object.totalInc, 'inc');
            document.querySelector(
                DOMstrings.expensesLabel
            ).textContent = formatNumber(object.totalExp, 'exp');

            if (object.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent =
                    object.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent =
                    '---';
            }
        },

        displayPercentages: function(percentages) {
            var fields = document.querySelectorAll(
                DOMstrings.expensesPercLabel
            );

            nodeListForEach(fields, function(current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
        },

        displayMonth: function() {
            var now, months, month, year;

            now = new Date();

            months = [
                'January',
                'February',
                'March',
                'April',
                'May',
                'June',
                'July',
                'August',
                'September',
                'October',
                'November',
                'December',
            ];

            month = now.getMonth();

            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent =
                months[month] + ' ' + year;
        },

        changedType: function() {
            var fields = document.querySelectorAll(
                DOMstrings.inputType +
                    ',' +
                    DOMstrings.inputDescription +
                    ',' +
                    DOMstrings.inputValue
            );

            nodeListForEach(fields, function(current) {
                current.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        },

        // Make DOMstrings object/variables available to the app controller
        getDOMstrings: function() {
            return DOMstrings;
        },
    };
})();

/* *** */
// GLOBAL APP CONTROLLER MODULE
var controller = (function(budgetCtrl, UICtrl) {
    // Private function setting up the event listeners
    var setupEventListeners = function() {
        // Get DOM strings from UI controller module
        var DOM = UICtrl.getDOMstrings();

        document
            .querySelector(DOM.inputBtn)
            .addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        document
            .querySelector(DOM.container)
            .addEventListener('click', ctrlDeleteItem);

        document
            .querySelector(DOM.inputType)
            .addEventListener('change', UICtrl.changedType);
    };

    var updateBudget = function() {
        // 1. Calculate the budget
        budgetCtrl.calculateBudget();

        // 2. Return the budget
        var budget = budgetCtrl.getBudget();

        // 3. Display the budget on the UI
        UICtrl.displayBudget(budget);
    };

    var updatePercentages = function() {
        // 1. Calculate percentages
        budgetCtrl.calculatePercentages();

        // 2. Read percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();

        //3. Update the UI with the new percentages
        UICtrl.displayPercentages(percentages);
    };

    // Private function called when we add a new item
    var ctrlAddItem = function() {
        var input, newItem;
        // 1. Get the field input data
        input = UICtrl.getInput();

        if (
            input.description !== '' &&
            !isNaN(input.value) &&
            input.value > 0
        ) {
            // 2. Add the item to the budget controller
            newItem = budgetCtrl.addItem(
                input.type,
                input.description,
                input.value
            );

            // 3. Add the new item to the UI
            UICtrl.addListItem(newItem, input.type);

            // 4. Clear the fields
            UICtrl.clearFields();

            // 5. Calculate and update budget
            updateBudget();

            // 6. Calculate and update percentages
            updatePercentages();
        }
    };

    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, id;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            id = parseInt(splitID[1]);

            // 1. Delete the item from the data structure
            budgetCtrl.deleteItem(type, id);
            // 2. Delete the item from the UI
            UICtrl.deleteListItem(itemID);

            // 3. Update and show the new budget
            updateBudget();

            // 4. Calculate and update percentages
            updatePercentages();
        }
    };

    // Public initialization function
    return {
        init: function() {
            console.log('Application has started.');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1,
            });
            setupEventListeners();
        },
    };
})(budgetController, UIController);

controller.init();
