# Book Managment System

A simple and secure library management system to manage books and
borrowers.
## Key features

* **Book Management:** Easily add, update, or remove books from the library . Each book entry includes details such as title, author, quantity available, ISBN and more.

* **Borrower Management:** Keep track of borrowers and their borrowing history. Capture borrower information such as name, contact details, membership status, and borrowing activity.

* **Search :** Efficiently search and filter books based on various criteria such as title, author, etc. This helps users quickly find the books they are looking for.

* **Checkout and Return:** Enable borrowers to check out books and return while keep tracking due dates. The system automatically updates the book's availability status and maintains a borrowing history for each borrower.

## Setup
 * link to install MySql : [MySql](https://dev.mysql.com/downloads/)
 * give the bash script permissions to be executable
 
    ``
    chmod +x start_db.sh
    ``
 
 * run bash script to create fresh database table
 
    ``
    ./start_db.sh
    ``

    **or**

    #### import the data 

    ``
    mysql -u root -p book_management < ./Dump20240207/<sql_script>
    ``

## Package Installation


```bash
npm install
```

## Run

```bash
npm start
```


## Database schema 

[Schema](https://lucid.app/lucidchart/69e9a5a3-65ae-4797-88b6-43372fed2846/edit?viewport_loc=384%2C-302%2C2152%2C939%2C0_0&invitationId=inv_8f5cc0ba-c63e-45aa-97bc-bdb73ce26536)