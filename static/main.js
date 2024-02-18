document.addEventListener('DOMContentLoaded', function() {
  const userNameElement = document.getElementById("user-name");
  const userName = localStorage.getItem("username");

  if (userName !== null) {
      userNameElement.textContent = userName;
  }
});
document.addEventListener('DOMContentLoaded', function() {
  const userNameElement = document.getElementById("user-name");
  const logoutButton = document.getElementById("logout-button");

  const userName = localStorage.getItem("username");

  if (userName !== null) {
      userNameElement.textContent = userName;
  }

  // Event listener for logout button
  logoutButton.addEventListener('click', function() {
      localStorage.removeItem("username"); // Remove username from local storage
      window.location.href = "login.html"; // Redirect to the login page
  });
});


document.addEventListener('DOMContentLoaded', function() {

    // Selecting the add category button by its ID
    const addCategoryButton = document.getElementById("add-category-button");
  
    // Rest of your JavaScript code remains unchanged
    const UserName = document.getElementById("user-name");
    const Time = document.getElementById("current-time");
    const CurrentDate = document.getElementById("current-date");
    const dateAndTime = new Date();
    const newCategoryNameInput = document.getElementById('new-category-name');
    const newCategoryBudgetInput = document.getElementById('new-category-budget');
    const newCategoryTotalSpentInput = document.getElementById('new-category-total-spent'); // Renamed TotalSpent input
    const categoriesContainer = document.querySelector('.categories');
    const totalSpentSpan = document.getElementById('total-spent');
    const totalIncomeSpan = document.getElementById('total-income');
    const dif = document.getElementById('Difference');

    // let tempName = prompt("Please Enter Your Name");
    let tempTotal = prompt("Please Enter In Your monthly income")
    // if (tempName !== null) {
    //     UserName.innerHTML = tempName;
totalIncomeSpan.textContent = tempTotal;
    // }
  
    if (dateAndTime !== null) {
        // Formatting minutes with iik,kkkkkikkk8a leading zero if necessary
        let minutes = dateAndTime.getMinutes();
        if (minutes < 10) {
            minutes = "0" + minutes;
        }
       
        Time.innerHTML = dateAndTime.getHours() + ":" + minutes;
        let currorectmonth = dateAndTime.getMonth() + 1
        CurrentDate.innerHTML = dateAndTime.getFullYear() + " " + currorectmonth + " " +dateAndTime.getDate();
    }
  
   
    
    // Event listener for adding a new category
    addCategoryButton.addEventListener('click', () => {
      const categoryName = newCategoryNameInput.value.trim();
      const categoryBudget = Number(newCategoryBudgetInput.value);
      const categoryTotalSpent = Number(newCategoryTotalSpentInput.value); // Get TotalSpent input value
  
      // Validate inputs
      if (!categoryName || !categoryBudget || !categoryTotalSpent || isNaN(categoryBudget) || isNaN(categoryTotalSpent)) {
        alert('Please enter a valid category name, budget, and total spent.');
        return;
      }
  
      // Create a new category element
      const categoryElement = createCategoryElement(categoryName, categoryBudget, categoryTotalSpent);
  
      // Add the category element to the DOM
      categoriesContainer.appendChild(categoryElement);
  
      // Clear input fields
      newCategoryNameInput.value = '';
      newCategoryBudgetInput.value = '';
      newCategoryTotalSpentInput.value = '';
  
      // Update totals (add this functionality here)
      calculateAndDisplayTotals();

      // Call API
      apiAddExpense(categoryName, categoryTotalSpent, categoryBudget).then(response => { 
        if (response.ok)
          console.log(`Successfully added ${categoryName} to the database (${response.status})`);
        else
          console.error(`Failed to add ${categoryName} to the database: ${response}`);
      });
    });
  
    // Function to create a new category element
    function createCategoryElement(categoryName, categoryBudget, categoryTotalSpent) {
        const category = document.createElement('div');
        category.classList.add('category');
      
        const categoryNameElement = document.createElement('p');
        categoryNameElement.textContent = categoryName;
        categoryNameElement.classList.add('category-name');
      
        const spentAmountElement = document.createElement('p');
        spentAmountElement.classList.add('spent-amount', 'spent-amount-with-slash');
        const spentSpan = document.createElement('span');
        spentSpan.classList.add('spent');
        spentSpan.textContent = categoryTotalSpent; // Initialize spent amount to TotalSpent input value
        const slashSpan = document.createElement('span');
        slashSpan.textContent = '/';
        const budgetedSpan = document.createElement('span');
        budgetedSpan.classList.add('budgeted');
        budgetedSpan.textContent = categoryBudget;
        spentAmountElement.appendChild(spentSpan);
        spentAmountElement.appendChild(slashSpan);
        spentAmountElement.appendChild(budgetedSpan);
      
        const removeButton = document.createElement('button');
        removeButton.classList.add('remove-category');
        removeButton.textContent = 'Remove';
        removeButton.addEventListener('click', () => {
          // Remove the category element from the DOM
          categoriesContainer.removeChild(category);
          // Update totals after removing the category
          calculateAndDisplayTotals();
          // Call API to remove the category
          apiDeleteExpense(categoryName, categoryTotalSpent, categoryBudget).then(response => {
            if (response.ok)
              console.log(`Successfully removed ${categoryName} from the database (${response.status})`);
            else
              console.error(`Failed to remove ${categoryName} from the database: ${response}`);
          });
        });
      
        category.appendChild(categoryNameElement);
        category.appendChild(spentAmountElement);
        category.appendChild(removeButton);
      
        return category;
    }
    function calculateAndDisplayTotals() {
      const spentElements = document.querySelectorAll('.spent');
      let totalSpent = 0;
      
      // Calculate total spent
      spentElements.forEach(element => {
          totalSpent += Number(element.textContent);
      });
  
      // Get the monthly salary
      const monthlySalary = Number(totalIncomeSpan.textContent);
  
      // Calculate remaining budget
      const remainingBudget = monthlySalary - totalSpent;
  
      // Display total spent and remaining budget
      //totalSpentSpan.textContent = totalSpent;
      dif.textContent = remainingBudget;
    }

    // Populate page with API info
    async function apiAllInfo() {
      let response = await fetch("/api/userfinances");
      let data = await response.json();
      console.log("Recieved data:", data);
      document.getElementById("user-name").textContent = data.name;
    
      for (let category of data.categories)
        createCategoryElement(category.name, category.budget, category.expense);
    }
    apiAllInfo();
  });
  
async function apiAddExpense(name, expense, budget) {
  let jsonobj = JSON.stringify({ name: name, expense: expense, budget: budget });
  console.log("Making API call to /api/addexpense: " + jsonobj);
  return await fetch("/api/addexpense", {
    method: "POST",
    body: jsonobj,
    headers: {
      "Content-Type": "application/json"
    }
  });
}

async function apiDeleteExpense(name, expense, budget) {
  let jsonobj = JSON.stringify({ name: name, expense: expense, budget: budget });
  console.log("Making API call to /api/deleteexpense: " + jsonobj);
  return await fetch("/api/deleteexpense", {
    method: "DELETE",
    body: jsonobj,
    headers: {
      "Content-Type": "application/json"
    }
  });
}