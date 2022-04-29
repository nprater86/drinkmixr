-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema drinkmixr_schema
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema drinkmixr_schema
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `drinkmixr_schema` DEFAULT CHARACTER SET utf8 ;
USE `drinkmixr_schema` ;

-- -----------------------------------------------------
-- Table `drinkmixr_schema`.`users`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `drinkmixr_schema`.`users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `first_name` VARCHAR(255) NULL,
  `last_name` VARCHAR(255) NULL,
  `email` VARCHAR(255) NULL,
  `birthday` DATE NULL,
  `user_name` VARCHAR(255) NULL,
  `password` VARCHAR(255) NULL,
  `created_at` DATETIME NULL,
  `updated_at` DATETIME NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `drinkmixr_schema`.`recipes`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `drinkmixr_schema`.`recipes` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NULL,
  `description` TEXT NULL,
  `directions` TEXT NULL,
  `created_at` DATETIME NULL,
  `updated_at` DATETIME NULL,
  `user_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_recipes_users1_idx` (`user_id` ASC) VISIBLE,
  CONSTRAINT `fk_recipes_users1`
    FOREIGN KEY (`user_id`)
    REFERENCES `drinkmixr_schema`.`users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `drinkmixr_schema`.`favorites`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `drinkmixr_schema`.`favorites` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `recipes_id` INT NOT NULL,
  `users_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_favorites_recipes_idx` (`recipes_id` ASC) VISIBLE,
  INDEX `fk_favorites_users1_idx` (`users_id` ASC) VISIBLE,
  CONSTRAINT `fk_favorites_recipes`
    FOREIGN KEY (`recipes_id`)
    REFERENCES `drinkmixr_schema`.`recipes` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_favorites_users1`
    FOREIGN KEY (`users_id`)
    REFERENCES `drinkmixr_schema`.`users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `drinkmixr_schema`.`comments`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `drinkmixr_schema`.`comments` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `content` TEXT NULL,
  `created_at` DATETIME NULL,
  `updated_at` DATETIME NULL,
  `users_id` INT NOT NULL,
  `recipes_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_comments_users1_idx` (`users_id` ASC) VISIBLE,
  INDEX `fk_comments_recipes1_idx` (`recipes_id` ASC) VISIBLE,
  CONSTRAINT `fk_comments_users1`
    FOREIGN KEY (`users_id`)
    REFERENCES `drinkmixr_schema`.`users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_comments_recipes1`
    FOREIGN KEY (`recipes_id`)
    REFERENCES `drinkmixr_schema`.`recipes` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `drinkmixr_schema`.`ingredients`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `drinkmixr_schema`.`ingredients` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `ingredient_name` VARCHAR(255) NULL,
  `quantity` FLOAT NULL,
  `measurement` VARCHAR(255) NULL,
  `created_at` DATETIME NULL,
  `updated_at` DATETIME NULL,
  `recipe_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_ingredients_recipes1_idx` (`recipe_id` ASC) VISIBLE,
  CONSTRAINT `fk_ingredients_recipes1`
    FOREIGN KEY (`recipe_id`)
    REFERENCES `drinkmixr_schema`.`recipes` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `drinkmixr_schema`.`spirits`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `drinkmixr_schema`.`spirits` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NULL,
  `created_at` DATETIME NULL,
  `updated_at` DATETIME NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `drinkmixr_schema`.`spirits_in_recipes`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `drinkmixr_schema`.`spirits_in_recipes` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `quantity` FLOAT NULL,
  `spirit_id` INT NOT NULL,
  `recipe_id` INT NOT NULL,
  `created_at` DATETIME NULL,
  `updated_at` DATETIME NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_spirits_in_recipes_spirits1_idx` (`spirit_id` ASC) VISIBLE,
  INDEX `fk_spirits_in_recipes_recipes1_idx` (`recipe_id` ASC) VISIBLE,
  CONSTRAINT `fk_spirits_in_recipes_spirits1`
    FOREIGN KEY (`spirit_id`)
    REFERENCES `drinkmixr_schema`.`spirits` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_spirits_in_recipes_recipes1`
    FOREIGN KEY (`recipe_id`)
    REFERENCES `drinkmixr_schema`.`recipes` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
