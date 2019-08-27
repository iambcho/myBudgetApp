// budget Class: Represents a budget line
class Budget {
  constructor(description, cost, category, date) {
    this.description = description;
    this.cost = cost;
    this.category = category;
    this.date = date;
  }
}

// UI Class: Handle UI Tasks
class UI {
  //#1
  static displayBudgets() {
    const budgets = Store.getBudgets();
    let sum = 0;

    //for each budget in an array of budgets (budget objects)
    budgets.forEach((budget) => UI.addBudgetToList(budget));

    //display sum 
    UI.updateSumAndSort();
  }

  //#2
  //here we are going to create the table to be added to the row
  static addBudgetToList(budget) {
    const list = document.querySelector('#budget-list');

    const row = document.createElement('tr');
    row.setAttribute('title', 'Drag and drop to sort list item');

    //The innerHTML property sets or returns the HTML content (inner HTML) of an element.
    row.innerHTML = 
    `<td>${budget.description}</td>
      <td>$${budget.cost}</td>
      <td>${budget.category}</td>
      <td>${budget.date}</td>
      <td><a href="#" class="btn btn-danger btn-sm delete" title="Delete">X</a></td>
    `;

    list.appendChild(row);
  }

  //#3
  static deleteBudget(el) {
    if(el.classList.contains('delete')) {

        //need to do parent element twice in order to remove the whole row <tr> rather than removing just the button
      el.parentElement.parentElement.remove();
    }
  }

  //#4
  static showAlert(message, className) {
    const div = document.createElement('div');
    div.className = `alert alert-${className}`;
    div.appendChild(document.createTextNode(message));
    // div.style.width = "200px";
    div.style.padding = "10px";
    div.style.fontSize = "x-large";
    div.style.color = "white";

    if(div.className === 'alert alert-danger') {
      div.style.backgroundColor = "red";
    }
    else if (div.className === 'alert alert-success') {
      div.style.backgroundColor = "CornflowerBlue";
    }

    const container = document.querySelector('.container');
    const form = document.querySelector('#budget-form');
    container.insertBefore(div, form);

    // Vanish in 3 seconds
    setTimeout(() => document.querySelector('.alert').remove(), 3000);
  }

  //#5
  static clearFields() {
    document.querySelector('#description').value = '';
    document.querySelector('#cost').value = '';
    document.querySelector('#category').value = '';
    document.querySelector('#date').value = '';
  }

  //#6
  static updateSumAndSort() {
    let sum = 0;
    let budgets = Store.getBudgets();
    budgets.forEach((budget) => sum += parseFloat(budget.cost));
    const sumRow = document.getElementById('total-sum');
    sumRow.innerHTML = `<td>$${sum.toFixed(2)}</td>`;

    let el = document.getElementById('budget-list');
    let sortable = Sortable.create(el);
  }
}

// Store Class: Handles Storage
//NOTE: you cannot add objects to local storage - you can only add strings; therefore, we need to 'stringify' before we can add to local storage, and then when we pull it out, we need to parse it
class Store {
  static getBudgets() {
    let budgets;
    //if there are no items of 'budgets'
    if(localStorage.getItem('budgets') === null) {
      budgets = [];
    } else {
      budgets = JSON.parse(localStorage.getItem('budgets'));
    }

    return budgets;
  }

  static addBudget(budget) {
    const budgets = Store.getBudgets();
    budgets.push(budget);
    localStorage.setItem('budgets', JSON.stringify(budgets));
  }

  static removeBudget(description) {

    const budgets = Store.getBudgets();

    budgets.forEach((budget, index) => {
      if(budget.description === description) {
        budgets.splice(index, 1);
      }
    });

    localStorage.setItem('budgets', JSON.stringify(budgets));
  }
}

// Event: Display budgets
//The DOMContentLoaded event fires when the initial HTML document has been completely loaded and parsed, without waiting for stylesheets, images, and subframes to finish loading.
document.addEventListener('DOMContentLoaded', UI.displayBudgets);

// Event: Add a budget
//we want to listen for a 'submit' event on this form
document.querySelector('#budget-form').addEventListener('submit', (e) => {
  // Prevent actual submit - in order to test
  e.preventDefault();

  // Get form values
  const description = document.querySelector('#description').value;
  const cost = document.querySelector('#cost').value;
  const category = document.querySelector('#category').value;
  const date = document.querySelector('#date').value;
  let budgets = Store.getBudgets();

  // Validate
  // budgets.forEach((budget) => (budget.description === description) ? UI.showAlert('Description already entered - please try another input', 'danger') : console.log('Success'));
  let match = false;
  var regex  = /^(?:-?\d+(?:\.\d{0,2}))?$/;

  budgets.forEach((budget) => (budget.description === description) ? match = true: console.log("Not a match")) ;

  //Error - if description matches previous description
  if(match === true) {
    UI.showAlert('Description already used - please use a different description', 'danger');
  } else {

    if(description === '' || cost === '' || category === ''|| date === '') {
      UI.showAlert('Please fill in all fields', 'danger');
    } else if(regex.test(cost) === false) {
      //cost is not in correct format
      UI.showAlert('Error - please make sure the cost is formatted with 2 decimal points (i.e., 5.00 rather than 5)', 'danger');

    } 
    else if (moment(date, 'MM/DD/YYYY',true).isValid() === false) {
      //date is not in correct format
      UI.showAlert('Error - please make sure the date is formatted as MM/DD/YYYY', 'danger');

    } else {
      // Instatiate budget line
      const budget = new Budget(description, cost, category, date);
  
      // Add budget to UI
      UI.addBudgetToList(budget);
  
      // Add budget to store
      Store.addBudget(budget);
  
      //Update to sum
      UI.updateSumAndSort();

      // Show success message
      UI.showAlert('Budget Line Added', 'success');
  
      // Clear fields
      UI.clearFields();
    }

  }

  
});

// Event: Remove a budget
document.querySelector('#budget-list').addEventListener('click', (e) => {
  // Remove budget from UI
  UI.deleteBudget(e.target);

  // Remove budget from store - this is trying to return the contents of 'description'
  Store.removeBudget(e.target.parentElement.previousElementSibling.previousElementSibling.previousElementSibling.previousElementSibling.textContent);

  //Update Sum
  UI.updateSumAndSort();

  // Show success message
  UI.showAlert('Budget Line Removed', 'success');
});