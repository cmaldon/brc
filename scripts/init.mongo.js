db.employees.remove({});

const employeesDB = [
    {
      id: 1,
      id_num: '7509',
      firstName: 'Sally',
      lastName: 'Jones',
      status: 'Employee',
      department: 'Veterans',
      password: '',
      dateLastLoggedIn: '',
      dateLastChanged: '',
      created: new Date('2021-02-20'),
      dateUpdated: '',
      deletedFlag: false
    }, 
    {
      id: 2,
      id_num: '3345',
      firstName: 'Jesse',
      lastName: 'Mucchio',
      status: 'Volunteer',
      department: 'Disaster Relief, Admin',
      password: '',
      dateLastLoggedIn: '',
      dateLastChanged: '',
      created: new Date('2021-01-18'),
      dateUpdated: '',
      deletedFlag: false
    },
    {
      id: 3,
      id_num: '2312',
      firstName: 'Andreas',
      lastName: 'Pertelli',
      status: 'Volunteer',
      department: 'Rescue',
      password: '',
      dateLastLoggedIn: '',
      dateLastChanged: '',
      created: new Date('2021-01-16'),
      dateUpdated: '',
      deletedFlag: false
    }
  ];

  db.employees.insertMany(employeesDB);
  const count = db.employees.count();
  print('Inserted', count, 'employees');

  db.counters.remove({ _id: 'employees'});
  db.counters.insert({ _id: 'employees', current: count });

  db.employees.createIndex({ id: 1 }, { unique: true });
  db.employees.createIndex({ id_num: 1 });
  db.employees.createIndex({ status: 1 });
  db.employees.createIndex({ department: 1 });
  db.employees.createIndex({ created: 1 });
