CREATE TABLE warmups (
    id int NOT NULL AUTO_INCREMENT,
    user_id int NOT NULL,
    name text,
    filename text,
    created_at datetime,
    deleted_at datetime,
    updated_at datetime,
    PRIMARY KEY (ID)
);