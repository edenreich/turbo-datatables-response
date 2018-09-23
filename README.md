
# Node Datatables

Server-side response generator in the correct format for datatables.

## Installation
Inside the vue project run:
```sh
npm i turbo-datatables-response
```

## Quickstart

```javascript
    // Optionally you can give the Datatables the mysql connection.
    const datatables = await Datatables();
    
    // supply the table name and the columns you need. 
    datatables.of('users').only(['id', 'name', 'email']);
    
    // or use the inverse
    // dt.of('users').hide(['password']);
    
    // Set the inputs from the client.
    datatables.setInputs(inputs);

    // Generates the response.
    let response = await datatables.make();

    // after the promise has been resolved
    // you will get a json object to return to the client.
```
