// Budget Controller
let budgetController = (function() {
    let Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome) {
        totalIncome > 0
            ? (this.percentage = Math.round((this.value / totalIncome) * 100))
            : (this.percentage = -1);
    };

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };

    let Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    let calculateTotal = function(type) {
        let sum = 0;
        data.allItems[type].forEach(function(current) {
            sum += current.value;
        });
        data.totals[type] = sum;
    };

    let data = {
        allItems: {
            exp: [],
            inc: []
        },

        totals: {
            exp: 0,
            inc: 0
        },

        budget: 0,
        percentage: -1
    };

    return {
        addItem: function(type, des, val) {
            let newItem, ID;

            //Create new ID
            data.allItems[type].length > 0
                ? (ID =
                      data.allItems[type][data.allItems[type].length - 1].id +
                      1)
                : (ID = 0);

            //Create new item based on 'inc' or 'exp' type
            if (type === "exp") {
                newItem = new Expense(ID, des, val);
            } else if (type === "inc") {
                newItem = new Income(ID, des, val);
            }

            //Push new item into our data structure
            data.allItems[type].push(newItem);

            //Return the new element
            return newItem;
        },

        deleteItem: function(type, id) {
            let ids, index;

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
            calculateTotal("exp");
            calculateTotal("inc");

            // 2. Calculate the Budget: Income - Expenses
            data.budget = data.totals.inc - data.totals.exp;

            // 3. Calculate the percentage of income that we spent
            data.totals.inc > 0
                ? (data.percentage = Math.round(
                      (data.totals.exp / data.totals.inc) * 100
                  ))
                : (data.percentage = -1);
        },

        calculatePercentages: function() {
            data.allItems.exp.forEach(function(current) {
                current.calcPercentage(data.totals.inc);
            });
        },

        getPercentages: function() {
            let allPercentages = data.allItems.exp.map(function(current) {
                return current.getPercentage();
            });
            return allPercentages;
        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },

        testing: function() {
            console.log(data);
        }
    };
})();

// UI Controller
let UIController = (function() {
    //Change the DOMStrings without causing further complications
    let DOMStrings = {
        inputType: ".add__type",
        inputDescription: ".add__description",
        inputValue: ".add__value",
        inputButton: ".add__btn",
        incomeContainer: ".income__list",
        expenseContainer: ".expenses__list",
        budgetLabel: ".budget__value",
        incomeLabel: ".budget__income--value",
        expenseLabel: ".budget__expenses--value",
        percentageLabel: ".budget__expenses--percentage",
        container: ".container",
        expensesPercentageLabel: ".item__percentage",
        dateLabel: ".budget__title--month"
    };

    let formatNumber = function(num, type) {
        let numSplit, dec, int;
        num = Math.abs(num);
        num = num.toFixed(2);
        numSplit = num.split(".");
        int = parseInt(numSplit[0]);
        dec = numSplit[1];
        int = int.toLocaleString();
        return (type === "exp" ? "-" : "+") + " " + int + "." + dec;
    };

    let nodeListForEach = function(list, callback) {
        for (let i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

    return {
        getInput: function() {
            //Return the input fields to the App Controller
            return {
                type: document.querySelector(DOMStrings.inputType).value, // Either Inc or Exp
                description: document.querySelector(DOMStrings.inputDescription)
                    .value,
                value: parseFloat(
                    document.querySelector(DOMStrings.inputValue).value
                )
            };
        },

        addListItem: function(obj, type) {
            let html, newHTML, element;

            // Create HTML String with Placeholder Text
            if (type === "inc") {
                element = DOMStrings.incomeContainer;
                html =
                    '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === "exp") {
                element = DOMStrings.expenseContainer;
                html =
                    '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            // Replace the placeholder text with actual data
            newHTML = html.replace("%id%", obj.id);
            newHTML = newHTML.replace("%description%", obj.description);
            newHTML = newHTML.replace("%value%", formatNumber(obj.value, type));

            // Insert the HTML into the DOM
            document
                .querySelector(element)
                .insertAdjacentHTML("beforeend", newHTML);
        },

        deleteListItem: function(selectorID) {
            let element = document.getElementById(selectorID);
            element.parentNode.removeChild(element);
        },

        clearFields: function() {
            let fields, fieldsArr;

            // Creates a list from the input description and value field elements
            fields = document.querySelectorAll(
                DOMStrings.inputDescription + ", " + DOMStrings.inputValue
            );

            //Converts fields List into an Array
            fieldsArr = Array.prototype.slice.call(fields);

            //Clears the value of the elements in field i.e input description and input value
            fieldsArr.forEach(function(current, index, array) {
                current.value = "";
            });

            //Sets focus back to description
            fieldsArr[0].focus();
        },

        displayBudget: function(obj) {
            obj.budget > 0 ? (type = "inc") : (type = "exp");

            document.querySelector(
                DOMStrings.budgetLabel
            ).textContent = formatNumber(obj.budget, type);

            document.querySelector(
                DOMStrings.incomeLabel
            ).textContent = formatNumber(obj.totalInc, "inc");

            document.querySelector(
                DOMStrings.expenseLabel
            ).textContent = formatNumber(obj.totalExp, "exp");

            obj.percentage > 0
                ? (document.querySelector(
                      DOMStrings.percentageLabel
                  ).textContent = obj.percentage + "%")
                : (document.querySelector(
                      DOMStrings.percentageLabel
                  ).textContent = "---");
        },

        displayPercentages: function(percentages) {
            let fields = document.querySelectorAll(
                DOMStrings.expensesPercentageLabel
            );

            nodeListForEach(fields, function(current, index) {
                percentages[index] > 0
                    ? (current.textContent = percentages[index] + "%")
                    : (current.textContent = "---");
            });
        },

        displayDate: function() {
            let date = new Intl.DateTimeFormat("en", {
                year: "numeric",
                month: "long"
            }).format();

            document.querySelector(DOMStrings.dateLabel).textContent = date;
        },

        //Changes color of input fields depending if input is income or expense
        changeType: function() {
            let fields = document.querySelectorAll(
                DOMStrings.inputType +
                    "," +
                    DOMStrings.inputDescription +
                    "," +
                    DOMStrings.inputValue
            );

            nodeListForEach(fields, function(current) {
                current.classList.toggle("red-focus");
            });

            document
                .querySelector(DOMStrings.inputButton)
                .classList.toggle("red");
        },

        getDOMStrings: function() {
            return DOMStrings;
        }
    };
})();

// Global App Controller
let controller = (function(budgetCtrl, UICtrl) {
    let setUpEventListeners = function() {
        let DOM = UICtrl.getDOMStrings();

        document
            .querySelector(DOM.inputButton)
            .addEventListener("click", ctrlAddItem);

        document.addEventListener("keypress", function(event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        document
            .querySelector(DOM.container)
            .addEventListener("click", ctrlDeleteItem);

        document
            .querySelector(DOM.inputType)
            .addEventListener("change", UICtrl.changeType);
    };

    let updateBudget = function() {
        //  1. Calculate the budget
        budgetCtrl.calculateBudget();

        //  2. Return the budget
        let budget = budgetCtrl.getBudget();

        //  3. Display the budget
        UICtrl.displayBudget(budget);
    };

    let updatePercentages = function() {
        // 1. Calculate percentages
        budgetCtrl.calculatePercentages();
        // 2. Read percentages from budget controller
        let percentages = budgetCtrl.getPercentages();
        // 3. Update the user interface with new percentages
        UICtrl.displayPercentages(percentages);
    };

    let ctrlAddItem = function() {
        let input, newItem;

        // 1. Get field input data
        input = UICtrl.getInput();

        if (
            input.description !== "" &&
            !isNaN(input.value) &&
            input.value > 0
        ) {
            // 2. Add the item to the budget controller
            newItem = budgetCtrl.addItem(
                input.type,
                input.description,
                input.value
            );

            // 3. Add new item to the user interface
            UICtrl.addListItem(newItem, input.type);

            // 4. Clear the fields
            UICtrl.clearFields();

            // 5. Calculate and update budget
            updateBudget();

            // 6. Calculate and update percentages
            updatePercentages();
        }
    };

    let ctrlDeleteItem = function(event) {
        let itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {
            splitID = itemID.split("-");
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // 1. Delete item from data structure
            budgetCtrl.deleteItem(type, ID);

            // 2. Delete item from UI
            UICtrl.deleteListItem(itemID);

            // 3. Update and show the new budget
            updateBudget();

            // 4. Calculate and update percentages
            updatePercentages();
        }
    };

    return {
        init: function() {
            UICtrl.displayDate();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0
            });
            setUpEventListeners();
        }
    };
})(budgetController, UIController);

controller.init();
