CREATE TABLE exercises (
    id int NOT NULL AUTO_INCREMENT,
    warmup_id int NOT NULL,
    predefined_exercise_id int NOT NULL,
    name text,
    range_begin int,
    range_end int,
    created_at datetime,
    deleted_at datetime,
    updated_at datetime,
    PRIMARY KEY (id),
    FOREIGN KEY (warmup_id) REFERENCES warmups(id),
    FOREIGN KEY (predefined_exercise_id) REFERENCES predefined_exercises(id)
);