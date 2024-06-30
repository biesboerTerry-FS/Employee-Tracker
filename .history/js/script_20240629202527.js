import { clear, log } from "./module.js";

(function () {
	clear();

	class Employee {
		constructor(name, age) {
			this.name = name;
			this.age = age;
		}
	}

	class PartTime extends Employee {
		constructor(name, age, hours, payRate) {
			super(name, age);
			this.hours = hours;
			this.payRate = this.roundToTwo(payRate);
			this.salary = this.calculatePay();
			this.type = "Part-time";
		}
		calculatePay() {
			return this.roundToTwo(this.payRate * this.hours * 52);
		}
		roundToTwo(num) {
			return parseFloat(num.toFixed(2));
		}
	}

	class Manager extends Employee {
		constructor(name, age, hours, payRate) {
			super(name, age);
			this.hours = hours;
			this.payRate = this.roundToTwo(payRate);
			this.salary = this.calculatePay();
			this.type = "Manager";
		}
		calculatePay() {
			return this.roundToTwo(this.payRate * this.hours * 52 - 1000);
		}
		roundToTwo(num) {
			return parseFloat(num.toFixed(2));
		}
	}

	const convertToTracker = (employee) => {
		if (employee.type === "Manager") {
			return new Manager(
				employee.name,
				employee.age,
				employee.hours,
				employee.payRate || employee.salary / (52 * employee.hours - 1000)
			);
		} else {
			return new PartTime(
				employee.name,
				employee.age,
				employee.hours,
				employee.payRate || employee.salary / (52 * employee.hours)
			);
		}
	};

	// Function to load employees from localStorage or use hardcoded if not available
	const loadEmployees = () => {
		const storedEmployees = localStorage.getItem("employeeArray");
		if (storedEmployees) {
			employeeArray = JSON.parse(storedEmployees).map(convertToTracker);
		} else {
			employeeArray = hardcodedEmployees.map(convertToTracker);
			saveEmployees(); // Save hardcoded employees to localStorage initially
		}
		assignIDs();
		renderEmployees();
	};

	// Hardcoded employees
	const hardcodedEmployees = [
		{ name: "John", age: 30, hours: 40, payRate: 25.0, type: "Part-time" },
		{ name: "Jane", age: 28, hours: 35, payRate: 30.0, type: "Manager" },
		{ name: "Dave", age: 46, hours: 32, payRate: 22.75, type: "Part-time" }
	];

	let employeeArray = [];

	const initializeEmployees = () => {
		loadEmployees();
	};

	// Function to assign IDs to employees
	const assignIDs = () => {
		employeeArray.forEach((employee, index) => {
			employee.id = index + 1;
		});
		log(
			"Assigned IDs:",
			employeeArray.map((e) => e.id)
		);
	};

	// Function to save employees to localStorage
	const saveEmployees = () => {
		localStorage.setItem("employeeArray", JSON.stringify(employeeArray));
		log("Saved employees to local storage:", employeeArray);
	};

	// Function to render employees in the table
	const renderEmployees = () => {
		const employeeTable = document.querySelector("#employeeTable tbody");
		employeeTable.innerHTML = "";

		employeeArray.forEach((employee) => {
			const row = document.createElement("tr");

			row.innerHTML = `
                <td>${employee.id}</td>
                <td>${employee.name}</td>
                <td>${employee.age}</td>
                <td>${employee.type}</td>
                <td>${employee.payRate.toFixed(2)}</td>
                <td>${employee.hours}</td>
                <td>${employee.salary.toFixed(2)}</td>
                <td>
                    <button class="edit" data-id="${employee.id}">Edit</button>
                    <button class="delete" data-id="${
											employee.id
										}">Delete</button>
                </td>
            `;

			employeeTable.appendChild(row);
		});

		log("Rendered employees:", employeeArray);
	};

	// Function to show the add form and hide the edit form
	const showAddForm = () => {
		document.getElementById("employeeForm").style.display = "block";
		document.getElementById("editEmployeeForm").style.display = "none";
	};

	// Function to show the edit form and populate fields with employee data
	const showEditForm = (employee) => {
		document.getElementById("employeeForm").style.display = "none";
		document.getElementById("editEmployeeForm").style.display = "block";
		document.getElementById("editId").value = employee.id;
		document.getElementById("editName").value = employee.name;
		document.getElementById("editAge").value = employee.age;
		document.getElementById("editHours").value = employee.hours;
		document.getElementById("editPayRate").value = employee.payRate;
	};

	// Function to add event listeners
	const addEventListeners = () => {
		// Add employee form submit listener
		document
			.querySelector("#saveNewEmployee")
			.addEventListener("click", addEmployee);
		document.addEventListener("keypress", (event) => {
			if (event.key === "Enter") {
				addEmployee();
			}
		});

		// Save edited employee listener
		document
			.querySelector("#saveEditedEmployee")
			.addEventListener("click", saveEditedEmployee);

		// Edit and delete buttons listener
		document
			.querySelector("#employeeTable")
			.addEventListener("click", (event) => {
				const target = event.target;
				if (target.classList.contains("delete")) {
					const id = parseInt(target.dataset.id);
					deleteEmployee(id);
				} else if (target.classList.contains("edit")) {
					const id = parseInt(target.dataset.id);
					const employee = employeeArray.find((employee) => employee.id === id);
					showEditForm(employee);
				}
			});

		// Cancel edit listener
		document
			.querySelector("#cancelEdit")
			.addEventListener("click", showAddForm);
	};

	// Function to add a new employee
	const addEmployee = () => {
		const name = document.querySelector("#name").value;
		const age = parseInt(document.querySelector("#age").value);
		const hours = parseInt(document.querySelector("#hours").value);
		const payRate = parseFloat(document.querySelector("#payRate").value);

		if (validateInput(name, age, hours, payRate)) {
			const newEmployee = new PartTime(name, age, hours, payRate);
			employeeArray.push(newEmployee);
			assignIDs();
			saveEmployees();
			renderEmployees();

			// Clear input fields after adding employee
			document.querySelector("#name").value = "";
			document.querySelector("#age").value = "";
			document.querySelector("#hours").value = "";
			document.querySelector("#payRate").value = "";

			showAddForm();
		} else {
			alert("Please fill in all fields with valid inputs.");
		}
	};

	// Function to validate input fields
	const validateInput = (name, age, hours, payRate) => {
		return name !== "" && !isNaN(age) && !isNaN(hours) && !isNaN(payRate);
	};

	// Function to save edited employee details
	const saveEditedEmployee = () => {
		const id = parseInt(document.querySelector("#editId").value);
		const name = document.querySelector("#editName").value;
		const age = parseInt(document.querySelector("#editAge").value);
		const hours = parseInt(document.querySelector("#editHours").value);
		const payRate = parseFloat(document.querySelector("#editPayRate").value);

		if (validateInput(name, age, hours, payRate)) {
			const employee = employeeArray.find((employee) => employee.id === id);
			employee.name = name;
			employee.age = age;
			employee.hours = hours;
			employee.payRate = employee.roundToTwo(payRate);
			employee.salary = employee.calculatePay();

			saveEmployees();
			renderEmployees();
			showAddForm();
		} else {
			alert("Please fill in all fields with valid inputs.");
		}
	};

	// Function to delete an employee
	const deleteEmployee = (id) => {
		employeeArray = employeeArray.filter((employee) => employee.id !== id);
		assignIDs();
		saveEmployees();
		renderEmployees();
	};

	// Initialize the application
	initializeEmployees();
	addEventListeners();
})();
