CREATE TABLE users (
    id int NOT NULL AUTO_INCREMENT,
    firstName text NOT NULL,
    lastName text NOT NULL,
    email varchar(256) NOT NULL UNIQUE,
    password text NOT NULL,
    created_at datetime NOT NULL,
    deleted_at datetime,
    updated_at datetime,
    PRIMARY KEY (id)
);