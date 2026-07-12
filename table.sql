create table users(
    id int primary key auto_increment,
    name varchar(255) not null,
    contactNumber varchar(20) not null,
    email varchar(255) not null unique,
    password varchar(255) not null,
    status varchar(20) not null,
    role varchar(50) not null
);

insert into users (name, contactNumber, email, password, status, role) values ('John Doe', '1234567890', 'john.doe@example.com', 'password123', 'active', 'user');

create table categories(
    id int not null primary key auto_increment,
    name varchar(255) not null unique
);

insert into categories (name) values ('Beverages');

create table products(
    id int not null primary key auto_increment,
    name varchar(255) not null,
    description text,
    price decimal(10, 2) not null,
    status varchar(20) not null,
    categoryId int,
    FOREIGN KEY (categoryId) REFERENCES categories(id)
);

insert into products (name, description, price, status, categoryId) values ('Coffee', 'Freshly brewed coffee', 2.99, 'available', 1);

create table orders(
    id int not null primary key auto_increment,
    userId int,
    productId int,
    quantity int not null,
    totalPrice decimal(10, 2) not null,
    orderDate datetime default current_timestamp,
    status varchar(20) not null,
    FOREIGN KEY (userId) REFERENCES users(id),
    FOREIGN KEY (productId) REFERENCES products(id)
);

insert into orders (userId, productId, quantity, totalPrice, status) values (1, 1, 2, 5.98, 'pending');

CREATE TABLE order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    orderId INT NOT NULL,
    productId INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (orderId) REFERENCES orders(id),
    FOREIGN KEY (productId) REFERENCES products(id)
);

insert into order_items (orderId, productId, quantity, price) values (1, 1, 2, 2.99);

create table bills(
    id int not null primary key auto_increment,
    orderId int,
    uuid varchar(255) not null unique,
    name varchar(255) not null,
    email varchar(255) not null,
    contactNumber varchar(20) not null,
    paymentMethod varchar(50) not null,
    totalAmount decimal(10, 2) not null,
    productDetails json default null,
    createdBy varchar(255) not null,
    billDate datetime default current_timestamp,
    FOREIGN KEY (orderId) REFERENCES orders(id)
);

insert into bills (orderId, uuid, name, email, contactNumber, paymentMethod, totalAmount, productDetails, createdBy) values (1, '123e4567-e89b-12d3-a456-426614174000', 'John Doe', 'john.doe@example.com', '1234567890', 'credit_card', 5.98, '[{"productId": 1, "quantity": 2, "price": 2.99}]', 'John Doe');