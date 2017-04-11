ALTER TABLE `test`.`person_version` 
ADD COLUMN `fullname` VARCHAR(510) GENERATED ALWAYS AS (LOWER(CONCAT(surname," ",name))) VIRTUAL AFTER `surname`;
