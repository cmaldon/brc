const dateRegex = new RegExp('^\\d\\d\\d\\d-\\d\\d-\\d\\d');

function jsonDateReviver(key, value) {
  if (dateRegex.test(value)) return new Date(value);
  return value;
}

function EmployeeRow(props) {
    const employee = props.employee;
    return (
      <tr>
        <td>{employee.id}</td>
        <td>{employee.id_num}</td>
        <td>{employee.firstName}</td>
        <td>{employee.lastName}</td>
        <td>{employee.status}</td>
        <td>{employee.department}</td>
        <td>{employee.created.toDateString()}</td>
      </tr>
    );
  }

function EmployeeTable(props) {
    const employeeRows = props.employees.map(employee =>
      <EmployeeRow key={employee.id} employee={employee} />
    );

    return (
      <table className="bordered-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Employee ID Number</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Status</th>
            <th>Department</th>
            <th>Date Created</th>
          </tr>
        </thead>

        <tbody>
          {employeeRows}
        </tbody>
      </table>
    );
}

class EmployeeAdd extends React.Component {
  constructor() {
    super();
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  
  handleSubmit(e) {
    e.preventDefault();
    const form = document.forms.employeeAdd;
    const employee = {
      id: form.id.value,
      id_num: form.id_num.value,
      firstName: form.firstName.value, 
      lastName: form.lastName.value, 
      status: form.status.value,
      department: form.department.value,
    }
    this.props.createEmployee(employee);
    form.id.value = "";
    form.id_num.value = "";
    form.firstName.value = ""; 
    form.lastName.value = "";
    form.status.value = "";
    form.department.value = "";
  }

  render() {
    return (
      <form name="employeeAdd" onSubmit={this.handleSubmit}>
        <input type="text" name="id_num" placeholder="Employee ID Number" />
        <input type="text" name="firstName" placeholder="First Name" />
        <input type="text" name="lastName" placeholder="Last Name" />
        <input type="text" name="status" placeholder="Status" />
        <input type="text" name="department" placeholder="Departments" />
        <button>Add</button>
      </form>
    );
  }
}


async function graphQLFetch(query, variables = {}) {
  try {
    const response = await fetch('/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json'},
      body: JSON.stringify({ query, variables })
    });
    const body = await response.text();
    const result = JSON.parse(body, jsonDateReviver);

    if (result.errors) {
      const error = result.errors[0];
      if (error.extensions.code === 'BAD_USER_INPUT') {
        const details = error.extensions.exception.errors.join('\n ');
        alert(`${error.message}:\n ${details}`);
      } else {
        alert(`${error.extensions.code}: ${error.message}`);
      }
    }
    return result.data;
  } catch (e) {
    alert(`Error in sending data to server: ${e.message}`);
  }
}

class EmployeeList extends React.Component {
  constructor() {
    super();
    this.state = { employees: [] };
    this.createEmployee = this.createEmployee.bind(this);
  }

  componentDidMount() {
    this.loadData();
  }

  async loadData() {
    const query = `query {
      employeeList {
        id 
        id_num
        firstName
        lastName
        status
        department
        created
      }
    }`;

    const data = await graphQLFetch(query);
    if (data) {
      this.setState({ employees: data.employeeList });
    }
  }

  async createEmployee(employee) {
    const query = `mutation employeeAdd($employee: EmployeeInputs!) {
      employeeAdd(employee: $employee) {
        id
      }
    }`;

    const data = await graphQLFetch(query, { employee });
    if (data) {
      this.loadData();
    }
  }

  render() {
    return (
      <React.Fragment>
        <h1>Employee Information List</h1>
        <hr />
        <EmployeeTable employees={this.state.employees} />
        <hr />
        <EmployeeAdd createEmployee={this.createEmployee} />
      </React.Fragment>
    );
  }
}

const element = <EmployeeList />;

ReactDOM.render(element, document.getElementById('contents'));
